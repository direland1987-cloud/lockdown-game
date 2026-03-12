#!/usr/bin/env python3
"""
LOCKDOWN Sprite Pipeline v2 — Calibrated for actual ChatGPT-generated sprites.

Key improvements over v1:
- Handles both white-background and transparent-background images
- Calibrated to actual sprite colors (warm amber = Marcus, cool navy = Yuki)
- Hue-based primary classification (much more reliable for these sprites)
- Improved black outline handling via nearest-neighbor propagation
- Generates cropped output sprites (no excess whitespace)
"""

import argparse
import json
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from sklearn.cluster import DBSCAN
from scipy.ndimage import distance_transform_edt


# ─── Configuration ──────────────────────────────────────────────────────────

# Actual sampled colors from the ChatGPT-generated sprites
# Marcus = warm amber/orange skin tones (shirtless, brown skin rendered as gold/orange)
# Yuki = cool navy/blue (rash guard) + lighter blue-gray tones

# Hue ranges (0-360 degrees) - primary classification method
MARCUS_HUE_RANGE = (15, 55)     # Warm amber/orange hues
YUKI_HUE_RANGE = (200, 280)    # Cool navy/blue hues

# Saturation threshold - low saturation pixels are ambiguous (grays, blacks, whites)
SATURATION_THRESHOLD = 25       # Below this, pixel is "shared" (outlines, etc.)

# White background threshold
BG_THRESHOLD = 230              # Pixels where ALL channels > this = background

# Minimum brightness to consider (very dark pixels are outlines)
DARK_THRESHOLD = 30             # Below this = shared/outline pixel


def remove_background(arr):
    """Remove white/near-white background, return RGBA array."""
    if arr.shape[2] == 3:
        # RGB - add alpha channel
        alpha = np.full((*arr.shape[:2], 1), 255, dtype=np.uint8)
        arr = np.concatenate([arr, alpha], axis=2)

    # Detect white-ish background
    is_bg = np.all(arr[:, :, :3] > BG_THRESHOLD, axis=2)
    arr[is_bg, 3] = 0

    return arr


def rgb_to_hsv_pixel(r, g, b):
    """Convert single RGB pixel to HSV (H in degrees, S and V in 0-100)."""
    r, g, b = r / 255.0, g / 255.0, b / 255.0
    mx = max(r, g, b)
    mn = min(r, g, b)
    diff = mx - mn

    if diff == 0:
        h = 0
    elif mx == r:
        h = (60 * ((g - b) / diff) + 360) % 360
    elif mx == g:
        h = (60 * ((b - r) / diff) + 120) % 360
    else:
        h = (60 * ((r - g) / diff) + 240) % 360

    s = 0 if mx == 0 else (diff / mx) * 100
    v = mx * 100
    return h, s, v


def classify_by_hue(arr, opaque_mask):
    """
    Classify pixels by hue angle.
    Returns label_map: 0=Marcus, 1=Yuki, -1=shared/ambiguous
    """
    h, w = arr.shape[:2]
    label_map = np.full((h, w), -1, dtype=int)

    ys, xs = np.where(opaque_mask)

    marcus_count = 0
    yuki_count = 0
    shared_count = 0

    for y, x in zip(ys, xs):
        r, g, b = int(arr[y, x, 0]), int(arr[y, x, 1]), int(arr[y, x, 2])
        hue, sat, val = rgb_to_hsv_pixel(r, g, b)

        # Very dark pixels = outlines, shared
        if val < DARK_THRESHOLD:
            shared_count += 1
            label_map[y, x] = -2  # Will be resolved later
            continue

        # Low saturation = gray/ambiguous
        if sat < SATURATION_THRESHOLD:
            # Check if it's a light gray (could be Yuki's white panels)
            if val > 80 and b > r:  # Blue-ish gray = likely Yuki
                label_map[y, x] = 1
                yuki_count += 1
            else:
                shared_count += 1
                label_map[y, x] = -2
            continue

        # Red-tinted very dark pixels (dark outlines with slight warm cast)
        if val < 15 and r > b:
            label_map[y, x] = -2
            shared_count += 1
            continue

        # Classify by hue
        if MARCUS_HUE_RANGE[0] <= hue <= MARCUS_HUE_RANGE[1]:
            label_map[y, x] = 0
            marcus_count += 1
        elif YUKI_HUE_RANGE[0] <= hue <= YUKI_HUE_RANGE[1]:
            label_map[y, x] = 1
            yuki_count += 1
        elif hue < 15 or hue > 340:
            # Red hue range - could be Marcus's red stripe
            if sat > 40:
                label_map[y, x] = 0
                marcus_count += 1
            else:
                label_map[y, x] = -2
                shared_count += 1
        elif 55 < hue < 80:
            # Yellow-green - likely Marcus skin highlights
            label_map[y, x] = 0
            marcus_count += 1
        elif 150 < hue < 200:
            # Teal/cyan - could be Yuki's lighter blue tones
            label_map[y, x] = 1
            yuki_count += 1
        else:
            label_map[y, x] = -2
            shared_count += 1

    total = marcus_count + yuki_count + shared_count
    print(f"  Hue classification: Marcus={marcus_count} ({100*marcus_count/max(total,1):.1f}%), "
          f"Yuki={yuki_count} ({100*yuki_count/max(total,1):.1f}%), "
          f"Shared={shared_count} ({100*shared_count/max(total,1):.1f}%)")

    return label_map


def resolve_shared_pixels(label_map):
    """Assign shared/outline pixels to nearest classified character."""
    ambiguous = label_map == -2
    if ambiguous.sum() == 0:
        return label_map

    print(f"  Resolving {ambiguous.sum()} shared/outline pixels...")

    # For each character label, compute distance transform
    for label in [0, 1]:
        known = (label_map == label).astype(float)
        if known.sum() == 0:
            continue
        dist, indices = distance_transform_edt(known == 0, return_indices=True)
        # Assign ambiguous pixels to this label if it's the nearest
        nearest_labels = label_map[indices[0], indices[1]]

    # More robust: compare distances from both characters
    marcus_known = (label_map == 0).astype(float)
    yuki_known = (label_map == 1).astype(float)

    if marcus_known.sum() > 0 and yuki_known.sum() > 0:
        dist_m, _ = distance_transform_edt(marcus_known == 0, return_indices=True)
        dist_y, _ = distance_transform_edt(yuki_known == 0, return_indices=True)

        # Assign to closest character
        closer_to_marcus = dist_m < dist_y
        label_map[ambiguous & closer_to_marcus] = 0
        label_map[ambiguous & ~closer_to_marcus] = 1
    elif marcus_known.sum() > 0:
        label_map[ambiguous] = 0
    elif yuki_known.sum() > 0:
        label_map[ambiguous] = 1

    return label_map


def find_anchor_points(label_map, label_a=0, label_b=1):
    """Detect contact regions between the two characters."""
    h, w = label_map.shape
    contact_pixels = []

    # Find pixels where one character borders the other
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            if label_map[y, x] == label_a:
                neighbors = label_map[y-1:y+2, x-1:x+2].flatten()
                if label_b in neighbors:
                    contact_pixels.append((x, y))

    if not contact_pixels:
        return {"contact_points": [], "center": {"x": w//2, "y": h//2},
                "bounds": {"min_x": 0, "max_x": w, "min_y": 0, "max_y": h},
                "contact_count": 0, "regions": []}

    xs = [p[0] for p in contact_pixels]
    ys = [p[1] for p in contact_pixels]

    anchors = {
        "contact_points": contact_pixels[:500],  # Limit stored points
        "center": {"x": int(np.mean(xs)), "y": int(np.mean(ys))},
        "bounds": {"min_x": int(min(xs)), "max_x": int(max(xs)),
                   "min_y": int(min(ys)), "max_y": int(max(ys))},
        "contact_count": len(contact_pixels)
    }

    # Cluster into distinct contact regions
    if len(contact_pixels) > 5:
        contact_arr = np.array(contact_pixels)
        clustering = DBSCAN(eps=10, min_samples=5).fit(contact_arr)
        labels = clustering.labels_
        unique_labels = sorted(set(labels) - {-1})

        regions = []
        for lbl in unique_labels:
            region_pixels = contact_arr[labels == lbl]
            regions.append({
                "center_x": int(np.mean(region_pixels[:, 0])),
                "center_y": int(np.mean(region_pixels[:, 1])),
                "pixel_count": int(len(region_pixels)),
            })

        regions.sort(key=lambda r: r["center_y"])
        for i, r in enumerate(regions):
            if i == 0:
                r["suggested_name"] = "upper_contact"
            elif i == len(regions) - 1:
                r["suggested_name"] = "lower_contact"
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


def extract_character_sprite(arr, label_map, label, crop=True):
    """Extract one character into a new RGBA image, optionally cropped tight."""
    result = np.zeros_like(arr)
    mask = label_map == label
    result[mask] = arr[mask]

    img = Image.fromarray(result, "RGBA")

    if crop:
        bbox = img.getbbox()
        if bbox:
            # Add small padding
            pad = 4
            x1, y1, x2, y2 = bbox
            x1 = max(0, x1 - pad)
            y1 = max(0, y1 - pad)
            x2 = min(img.width, x2 + pad)
            y2 = min(img.height, y2 + pad)
            img = img.crop((x1, y1, x2, y2))

    return img


def create_debug_visualization(arr, label_map, anchors, output_path):
    """Create debug image: red tint = Marcus, blue tint = Yuki, green = anchors."""
    debug = arr.copy()

    mask_a = label_map == 0
    mask_b = label_map == 1

    # Red tint for Marcus
    debug[mask_a, 0] = np.clip(debug[mask_a, 0].astype(int) + 50, 0, 255).astype(np.uint8)
    debug[mask_a, 1] = (debug[mask_a, 1] * 0.7).astype(np.uint8)
    debug[mask_a, 2] = (debug[mask_a, 2] * 0.7).astype(np.uint8)

    # Blue tint for Yuki
    debug[mask_b, 2] = np.clip(debug[mask_b, 2].astype(int) + 50, 0, 255).astype(np.uint8)
    debug[mask_b, 0] = (debug[mask_b, 0] * 0.7).astype(np.uint8)
    debug[mask_b, 1] = (debug[mask_b, 1] * 0.7).astype(np.uint8)

    # Green markers for anchor regions
    for region in anchors.get("regions", []):
        cx, cy = region["center_x"], region["center_y"]
        h, w = debug.shape[:2]
        for dy in range(-4, 5):
            for dx in range(-4, 5):
                ny, nx = cy + dy, cx + dx
                if 0 <= ny < h and 0 <= nx < w:
                    if abs(dy) <= 1 or abs(dx) <= 1:  # Cross shape
                        debug[ny, nx] = [0, 255, 0, 255]

    Image.fromarray(debug, "RGBA").save(output_path)


def process_paired_sprite(input_path, output_dir, position_name="unknown"):
    """Main processing function for a single paired sprite."""
    print(f"\n{'='*60}")
    print(f"Processing: {os.path.basename(input_path)}")
    print(f"Position: {position_name}")
    print(f"{'='*60}")

    os.makedirs(output_dir, exist_ok=True)

    # Load image
    img = Image.open(input_path).convert("RGBA")
    arr = np.array(img)
    print(f"  Image size: {arr.shape[1]}x{arr.shape[0]}")

    # Remove white background
    arr = remove_background(arr)
    opaque = arr[:, :, 3] > 10
    print(f"  Opaque pixels after bg removal: {opaque.sum()}")

    if opaque.sum() < 100:
        print("  ERROR: Too few opaque pixels. Skipping.")
        return None

    # Classify by hue
    print("  Classifying pixels by hue...")
    label_map = classify_by_hue(arr, opaque)

    # Resolve shared/outline pixels
    label_map = resolve_shared_pixels(label_map)

    # Stats
    marcus_px = (label_map == 0).sum()
    yuki_px = (label_map == 1).sum()
    total_px = marcus_px + yuki_px
    print(f"  Final split: Marcus={marcus_px} ({100*marcus_px/max(total_px,1):.1f}%), "
          f"Yuki={yuki_px} ({100*yuki_px/max(total_px,1):.1f}%)")

    # Check for reasonable split
    ratio = marcus_px / max(total_px, 1)
    if ratio < 0.15 or ratio > 0.85:
        print(f"  WARNING: Very uneven split ({100*ratio:.0f}%). Results may need manual review.")

    # Extract character sprites
    marcus_sprite = extract_character_sprite(arr, label_map, 0)
    yuki_sprite = extract_character_sprite(arr, label_map, 1)

    # Also save uncropped versions for the anchor renderer
    marcus_full = extract_character_sprite(arr, label_map, 0, crop=False)
    yuki_full = extract_character_sprite(arr, label_map, 1, crop=False)

    marcus_path = os.path.join(output_dir, f"{position_name}_marcus.png")
    yuki_path = os.path.join(output_dir, f"{position_name}_yuki.png")
    marcus_full_path = os.path.join(output_dir, f"{position_name}_marcus_full.png")
    yuki_full_path = os.path.join(output_dir, f"{position_name}_yuki_full.png")

    marcus_sprite.save(marcus_path)
    yuki_sprite.save(yuki_path)
    marcus_full.save(marcus_full_path)
    yuki_full.save(yuki_full_path)

    print(f"  Saved: {marcus_path} ({marcus_sprite.size[0]}x{marcus_sprite.size[1]})")
    print(f"  Saved: {yuki_path} ({yuki_sprite.size[0]}x{yuki_sprite.size[1]})")

    # Detect anchors
    print("  Detecting anchor points...")
    anchors = find_anchor_points(label_map)
    print(f"  Found {anchors['contact_count']} contact pixels in "
          f"{len(anchors.get('regions', []))} regions")

    for region in anchors.get("regions", []):
        print(f"    {region['suggested_name']}: ({region['center_x']}, {region['center_y']})")

    # Save anchor data
    anchor_data = {
        "position": position_name,
        "source_file": os.path.basename(input_path),
        "image_size": {"width": arr.shape[1], "height": arr.shape[0]},
        "characters": {
            "marcus": {
                "sprite_file": f"{position_name}_marcus.png",
                "sprite_full": f"{position_name}_marcus_full.png",
                "role": "top/aggressor"
            },
            "yuki": {
                "sprite_file": f"{position_name}_yuki.png",
                "sprite_full": f"{position_name}_yuki_full.png",
                "role": "bottom/defender"
            }
        },
        "anchor_regions": anchors["regions"],
        "contact_center": anchors["center"],
        "contact_bounds": anchors["bounds"]
    }

    # Remove raw contact_points from JSON (too large)
    anchor_path = os.path.join(output_dir, f"{position_name}_anchors.json")
    with open(anchor_path, "w") as f:
        json.dump(anchor_data, f, indent=2)

    # Debug visualization
    debug_path = os.path.join(output_dir, f"{position_name}_debug.png")
    create_debug_visualization(arr, label_map, anchors, debug_path)
    print(f"  Saved debug: {debug_path}")

    return anchor_data


def batch_process(input_dir, output_dir):
    """Process all paired sprites (A*.png files)."""
    input_path = Path(input_dir)
    results = {}

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

    for img_file in sorted(input_path.glob("A*.png")):
        stem = img_file.stem
        position_name = stem

        for prefix, pos_name in position_map.items():
            if stem.upper().startswith(prefix):
                position_name = pos_name
                break

        pos_output = os.path.join(output_dir, position_name)
        result = process_paired_sprite(str(img_file), pos_output, position_name)
        if result:
            results[position_name] = result

    # Save combined manifest
    manifest_path = os.path.join(output_dir, "anchor_manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n{'='*60}")
    print(f"Combined manifest saved: {manifest_path}")
    print(f"Processed {len(results)} positions successfully")

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LOCKDOWN Sprite Separator v2")
    parser.add_argument("input", help="Input image or directory")
    parser.add_argument("--output-dir", "-o", default="./separated")
    parser.add_argument("--position", "-p", default="unknown")
    parser.add_argument("--batch", "-b", action="store_true")

    args = parser.parse_args()

    if args.batch or os.path.isdir(args.input):
        batch_process(args.input, args.output_dir)
    else:
        process_paired_sprite(args.input, args.output_dir, args.position)
