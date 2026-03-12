#!/usr/bin/env python3
"""
LOCKDOWN Sprite Pipeline — Step 1: Paired Sprite Separator

Takes a paired grappling sprite (two characters together) and attempts to
separate them into individual character layers using color-palette clustering.

For pixel art, this works by:
1. Identifying distinct color clusters that belong to each character
2. Using spatial analysis to resolve overlapping regions
3. Outputting two separated PNGs with transparency

Usage:
    python separate_sprites.py input_image.png --output-dir ./separated/

Requirements:
    pip install Pillow numpy scikit-learn
"""

import argparse
import json
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from sklearn.cluster import KMeans, DBSCAN
from collections import Counter


# Character color signatures — adjust these to match YOUR generated sprites
# These are approximate RGB ranges for each character's dominant colors
CHARACTER_PALETTES = {
    "marcus": {
        "name": "Marcus 'The Bull' Reyes",
        "signature_colors": [
            # (R, G, B) — dominant identifying colors
            (139, 90, 60),   # Medium-brown skin (approximate)
            (50, 50, 50),    # Black shorts
            (180, 40, 40),   # Red stripe accent
            (120, 75, 50),   # Skin shadow tones
            (160, 110, 75),  # Skin highlight tones
        ],
        "color_tolerance": 50,  # How far from signature to still match
    },
    "yuki": {
        "name": "Yuki 'Spider' Tanaka",
        "signature_colors": [
            (30, 40, 80),    # Dark navy rash guard
            (220, 200, 180), # Light skin tone
            (40, 50, 100),   # Navy shorts
            (200, 200, 200), # White side panels
            (240, 220, 200), # Skin highlight tones
        ],
        "color_tolerance": 50,
    }
}


def load_image(path: str) -> tuple[np.ndarray, Image.Image]:
    """Load image and return as numpy array + PIL Image."""
    img = Image.open(path).convert("RGBA")
    arr = np.array(img)
    return arr, img


def get_opaque_pixels(arr: np.ndarray) -> np.ndarray:
    """Get mask of non-transparent pixels."""
    return arr[:, :, 3] > 10  # Alpha > 10 to account for anti-aliasing


def color_distance(c1, c2):
    """Euclidean distance between two RGB colors."""
    return np.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))


def classify_pixel_by_palette(rgb, palettes: dict, default="unknown"):
    """Classify a single pixel to the closest character palette."""
    best_match = default
    best_distance = float("inf")

    for char_key, palette_info in palettes.items():
        for sig_color in palette_info["signature_colors"]:
            dist = color_distance(rgb[:3], sig_color)
            if dist < palette_info["color_tolerance"] and dist < best_distance:
                best_distance = dist
                best_match = char_key

    return best_match


def spatial_cluster_fallback(arr: np.ndarray, opaque_mask: np.ndarray) -> np.ndarray:
    """
    Fallback: split by spatial position (left = Fighter A, right = Fighter B).
    Works for side-on fighting game sprites where characters are on opposite sides.
    """
    h, w = opaque_mask.shape
    label_map = np.full((h, w), -1, dtype=int)

    # Find center of mass of all opaque pixels
    ys, xs = np.where(opaque_mask)
    if len(xs) == 0:
        return label_map

    center_x = np.median(xs)

    # Simple left/right split — label 0 = left character, label 1 = right character
    for y, x in zip(ys, xs):
        if opaque_mask[y, x]:
            label_map[y, x] = 0 if x < center_x else 1

    return label_map


def palette_based_separation(arr: np.ndarray, opaque_mask: np.ndarray,
                              palettes: dict) -> np.ndarray:
    """
    Primary method: classify pixels by color palette matching.
    Falls back to spatial clustering for ambiguous pixels.
    """
    h, w = arr.shape[:2]
    label_map = np.full((h, w), -1, dtype=int)
    char_keys = list(palettes.keys())

    classified_count = {k: 0 for k in char_keys}
    unknown_count = 0

    ys, xs = np.where(opaque_mask)

    for y, x in zip(ys, xs):
        rgb = arr[y, x, :3]
        match = classify_pixel_by_palette(rgb, palettes)

        if match != "unknown":
            label_map[y, x] = char_keys.index(match)
            classified_count[match] += 1
        else:
            unknown_count += 1
            label_map[y, x] = -2  # Mark for spatial fallback

    total_opaque = len(ys)
    classified = sum(classified_count.values())
    print(f"  Palette classification: {classified}/{total_opaque} pixels "
          f"({100*classified/max(total_opaque,1):.1f}%)")
    for k, v in classified_count.items():
        print(f"    {k}: {v} pixels")
    print(f"    Ambiguous: {unknown_count} pixels")

    # For ambiguous pixels, use nearest-classified-neighbor approach
    if unknown_count > 0:
        print("  Resolving ambiguous pixels by nearest neighbor...")
        # Simple flood: assign ambiguous pixels to the label of their nearest classified neighbor
        from scipy.ndimage import distance_transform_edt

        for label_idx in range(len(char_keys)):
            known = (label_map == label_idx).astype(float)
            if known.sum() > 0:
                dist, indices = distance_transform_edt(known == 0, return_indices=True)
                # Only update ambiguous pixels
                ambiguous = label_map == -2
                label_map[ambiguous] = label_map[indices[0][ambiguous], indices[1][ambiguous]]

    # Remaining unresolved: spatial fallback
    still_unknown = label_map == -2
    if still_unknown.sum() > 0:
        print(f"  Spatial fallback for {still_unknown.sum()} remaining pixels")
        spatial = spatial_cluster_fallback(arr, still_unknown)
        label_map[still_unknown] = spatial[still_unknown]

    return label_map


def extract_character_sprite(arr: np.ndarray, label_map: np.ndarray,
                              label: int) -> Image.Image:
    """Extract one character's pixels into a new RGBA image."""
    h, w = arr.shape[:2]
    result = np.zeros_like(arr)

    mask = label_map == label
    result[mask] = arr[mask]

    return Image.fromarray(result, "RGBA")


def find_anchor_points(label_map: np.ndarray, label_a: int, label_b: int) -> dict:
    """
    Detect anchor points where the two characters are adjacent/overlapping.
    These are the contact points for the game engine.
    """
    h, w = label_map.shape
    contact_pixels = []

    # Find pixels where character A is adjacent to character B
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            if label_map[y, x] == label_a:
                # Check 8-connected neighbors
                neighbors = label_map[y-1:y+2, x-1:x+2].flatten()
                if label_b in neighbors:
                    contact_pixels.append((x, y))

    if not contact_pixels:
        return {"contact_points": [], "center": None}

    xs = [p[0] for p in contact_pixels]
    ys = [p[1] for p in contact_pixels]

    # Cluster contact points into logical groups (grip points, hip contact, etc.)
    # Use simple spatial clustering
    contact_arr = np.array(contact_pixels)

    anchors = {
        "contact_points": contact_pixels,
        "center": {
            "x": int(np.mean(xs)),
            "y": int(np.mean(ys))
        },
        "bounds": {
            "min_x": int(min(xs)),
            "max_x": int(max(xs)),
            "min_y": int(min(ys)),
            "max_y": int(max(ys))
        },
        "contact_count": len(contact_pixels)
    }

    # Try to identify distinct contact regions using DBSCAN
    if len(contact_pixels) > 5:
        clustering = DBSCAN(eps=8, min_samples=3).fit(contact_arr)
        labels = clustering.labels_
        unique_labels = set(labels) - {-1}

        regions = []
        for lbl in unique_labels:
            region_pixels = contact_arr[labels == lbl]
            regions.append({
                "center_x": int(np.mean(region_pixels[:, 0])),
                "center_y": int(np.mean(region_pixels[:, 1])),
                "pixel_count": len(region_pixels),
                "name": f"contact_region_{lbl}"
            })

        # Sort regions top-to-bottom for consistent naming
        regions.sort(key=lambda r: r["center_y"])
        for i, r in enumerate(regions):
            if i == 0:
                r["suggested_name"] = "upper_contact"  # Head/shoulder area
            elif i == len(regions) - 1:
                r["suggested_name"] = "lower_contact"  # Hip/leg area
            else:
                r["suggested_name"] = f"mid_contact_{i}"

        anchors["regions"] = regions
    else:
        anchors["regions"] = [{
            "center_x": anchors["center"]["x"],
            "center_y": anchors["center"]["y"],
            "pixel_count": len(contact_pixels),
            "suggested_name": "primary_contact"
        }]

    return anchors


def create_debug_visualization(arr: np.ndarray, label_map: np.ndarray,
                                anchors: dict, output_path: str):
    """Create a debug image showing the separation and anchor points."""
    h, w = arr.shape[:2]
    debug = arr.copy()

    # Tint character A pixels slightly red, character B slightly blue
    mask_a = label_map == 0
    mask_b = label_map == 1

    # Overlay tint
    debug[mask_a, 0] = np.clip(debug[mask_a, 0].astype(int) + 40, 0, 255).astype(np.uint8)
    debug[mask_b, 2] = np.clip(debug[mask_b, 2].astype(int) + 40, 0, 255).astype(np.uint8)

    # Mark anchor points in bright green
    for region in anchors.get("regions", []):
        cx, cy = region["center_x"], region["center_y"]
        for dy in range(-2, 3):
            for dx in range(-2, 3):
                ny, nx = cy + dy, cx + dx
                if 0 <= ny < h and 0 <= nx < w:
                    debug[ny, nx] = [0, 255, 0, 255]

    Image.fromarray(debug, "RGBA").save(output_path)


def process_paired_sprite(input_path: str, output_dir: str,
                           position_name: str = "unknown"):
    """Main processing function for a single paired sprite."""
    print(f"\nProcessing: {input_path}")
    print(f"Position: {position_name}")
    print("-" * 50)

    os.makedirs(output_dir, exist_ok=True)

    # Load
    arr, img = load_image(input_path)
    print(f"  Image size: {arr.shape[1]}x{arr.shape[0]}")

    # Get opaque pixels
    opaque = get_opaque_pixels(arr)
    print(f"  Opaque pixels: {opaque.sum()}")

    if opaque.sum() == 0:
        print("  ERROR: No opaque pixels found. Is the background transparent?")
        return

    # Separate using palette-based method
    print("  Running palette-based separation...")
    label_map = palette_based_separation(arr, opaque, CHARACTER_PALETTES)

    # Check if separation produced reasonable results
    char_keys = list(CHARACTER_PALETTES.keys())
    counts = {k: (label_map == i).sum() for i, k in enumerate(char_keys)}
    total = sum(counts.values())

    for k, v in counts.items():
        ratio = v / max(total, 1)
        print(f"  {k}: {v} pixels ({100*ratio:.1f}%)")
        if ratio < 0.15 or ratio > 0.85:
            print(f"  WARNING: Uneven split detected. Consider adjusting "
                  f"CHARACTER_PALETTES or using spatial fallback.")

    # Extract individual sprites
    for i, char_key in enumerate(char_keys):
        sprite = extract_character_sprite(arr, label_map, i)
        sprite_path = os.path.join(output_dir, f"{position_name}_{char_key}.png")
        sprite.save(sprite_path)
        print(f"  Saved: {sprite_path}")

    # Detect anchor points
    print("  Detecting anchor points...")
    anchors = find_anchor_points(label_map, 0, 1)
    print(f"  Found {anchors['contact_count']} contact pixels in "
          f"{len(anchors.get('regions', []))} regions")

    for region in anchors.get("regions", []):
        print(f"    {region['suggested_name']}: ({region['center_x']}, "
              f"{region['center_y']}) — {region['pixel_count']} pixels")

    # Save anchor data
    anchor_data = {
        "position": position_name,
        "source_file": os.path.basename(input_path),
        "image_size": {"width": arr.shape[1], "height": arr.shape[0]},
        "characters": {
            char_keys[0]: {
                "sprite_file": f"{position_name}_{char_keys[0]}.png",
                "role": "top/aggressor"
            },
            char_keys[1]: {
                "sprite_file": f"{position_name}_{char_keys[1]}.png",
                "role": "bottom/defender"
            }
        },
        "anchor_regions": anchors["regions"],
        "contact_center": anchors["center"],
        "contact_bounds": anchors["bounds"]
    }

    anchor_path = os.path.join(output_dir, f"{position_name}_anchors.json")
    with open(anchor_path, "w") as f:
        json.dump(anchor_data, f, indent=2)
    print(f"  Saved anchors: {anchor_path}")

    # Debug visualization
    debug_path = os.path.join(output_dir, f"{position_name}_debug.png")
    create_debug_visualization(arr, label_map, anchors, debug_path)
    print(f"  Saved debug view: {debug_path}")

    return anchor_data


def batch_process(input_dir: str, output_dir: str):
    """Process all paired sprites in a directory."""
    input_path = Path(input_dir)
    results = {}

    # Expected naming convention: A1_closed_guard.png, A2_open_guard.png, etc.
    position_map = {
        "A1": "closed_guard",
        "A2": "open_guard",
        "A3": "half_guard",
        "A4": "side_control",
        "A5": "mount",
        "A6": "back_mount",
        "A7": "turtle",
        "A8": "standing_clinch"
    }

    for img_file in sorted(input_path.glob("*.png")):
        # Try to extract position name from filename
        stem = img_file.stem
        position_name = stem

        for prefix, pos_name in position_map.items():
            if stem.upper().startswith(prefix):
                position_name = pos_name
                break

        result = process_paired_sprite(
            str(img_file),
            os.path.join(output_dir, position_name),
            position_name
        )
        if result:
            results[position_name] = result

    # Save combined anchor manifest
    manifest_path = os.path.join(output_dir, "anchor_manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nSaved combined manifest: {manifest_path}")

    return results


def main():
    parser = argparse.ArgumentParser(
        description="LOCKDOWN Sprite Separator — Split paired grappling sprites"
    )
    parser.add_argument("input", help="Input image or directory of images")
    parser.add_argument("--output-dir", "-o", default="./separated",
                        help="Output directory (default: ./separated)")
    parser.add_argument("--position", "-p", default="unknown",
                        help="Position name (for single image processing)")
    parser.add_argument("--batch", "-b", action="store_true",
                        help="Process all PNGs in input directory")

    args = parser.parse_args()

    if args.batch or os.path.isdir(args.input):
        batch_process(args.input, args.output_dir)
    else:
        process_paired_sprite(args.input, args.output_dir, args.position)


if __name__ == "__main__":
    main()
