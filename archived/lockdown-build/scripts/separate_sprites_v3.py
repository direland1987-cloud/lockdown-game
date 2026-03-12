#!/usr/bin/env python3
"""
LOCKDOWN Sprite Pipeline v3 — Two-pass separation with spatial proximity.

Strategy:
1. Pass 1: Classify high-confidence "anchor" pixels (navy=Yuki, red stripe/tattoo=Marcus)
2. Pass 2: Use distance from anchor regions to classify ambiguous pixels (shared skin tones)
3. Pass 3: Nearest-neighbor fill for outlines and remaining ambiguous pixels
"""

import argparse
import json
import os
from pathlib import Path

import numpy as np
from PIL import Image
from sklearn.cluster import DBSCAN
from scipy.ndimage import distance_transform_edt


# ─── Configuration ──────────────────────────────────────────────────────────

BG_THRESHOLD = 228          # Pixels with ALL channels > this = background
DARK_THRESHOLD = 35         # Below this brightness = outline/shared

# High-confidence color ranges for anchor classification
# These are colors that ONLY appear on one character

def rgb_to_hsv(r, g, b):
    r, g, b = r / 255.0, g / 255.0, b / 255.0
    mx, mn = max(r, g, b), min(r, g, b)
    diff = mx - mn
    if diff == 0: h = 0
    elif mx == r: h = (60 * ((g - b) / diff) + 360) % 360
    elif mx == g: h = (60 * ((b - r) / diff) + 120) % 360
    else: h = (60 * ((r - g) / diff) + 240) % 360
    s = 0 if mx == 0 else (diff / mx) * 100
    v = mx * 100
    return h, s, v


def remove_background(arr):
    if arr.shape[2] == 3:
        alpha = np.full((*arr.shape[:2], 1), 255, dtype=np.uint8)
        arr = np.concatenate([arr, alpha], axis=2)
    is_bg = np.all(arr[:, :, :3] > BG_THRESHOLD, axis=2)
    arr[is_bg, 3] = 0
    return arr


def classify_anchors(arr, opaque_mask):
    """
    Pass 1: Identify high-confidence anchor pixels.
    - Navy/blue hues (200-280°, sat>30) = Yuki's rash guard (DEFINITE)
    - Red hues (0-15° or 345-360°, sat>50) = Marcus's red stripe (DEFINITE)
    - Teal/cyan (150-200°) = Yuki's lighter tones (HIGH confidence)
    - Very saturated blue-gray (hue 210-260, low sat) with blue dominance = Yuki (MODERATE)

    Returns: label_map with 0=Marcus, 1=Yuki, -1=background, -2=ambiguous
    """
    h, w = arr.shape[:2]
    label_map = np.full((h, w), -1, dtype=int)

    ys, xs = np.where(opaque_mask)

    marcus_anchors = 0
    yuki_anchors = 0
    ambiguous = 0

    for y, x in zip(ys, xs):
        r, g, b = int(arr[y, x, 0]), int(arr[y, x, 1]), int(arr[y, x, 2])
        hue, sat, val = rgb_to_hsv(r, g, b)

        # Very dark = outline, ambiguous
        if val < DARK_THRESHOLD:
            label_map[y, x] = -2
            ambiguous += 1
            continue

        # DEFINITE YUKI: Navy blue (rash guard, shorts)
        if 200 <= hue <= 280 and sat > 25 and val > 10:
            label_map[y, x] = 1
            yuki_anchors += 1
            continue

        # DEFINITE YUKI: Teal/cyan tones
        if 150 <= hue <= 200 and sat > 20 and val > 15:
            label_map[y, x] = 1
            yuki_anchors += 1
            continue

        # DEFINITE YUKI: Blue-dominant gray (web pattern, lighter rash guard areas)
        if 200 <= hue <= 270 and sat > 10 and sat <= 25 and b > r and b > g:
            label_map[y, x] = 1
            yuki_anchors += 1
            continue

        # DEFINITE YUKI: White panels (very light, blue-ish or neutral, high value)
        if val > 80 and sat < 20 and b >= r - 5:
            label_map[y, x] = 1
            yuki_anchors += 1
            continue

        # DEFINITE MARCUS: Red stripe (warm red, high saturation)
        if (hue < 15 or hue > 340) and sat > 45 and val > 20:
            label_map[y, x] = 0
            marcus_anchors += 1
            continue

        # Everything else is ambiguous (shared warm skin tones, yellows, oranges)
        label_map[y, x] = -2
        ambiguous += 1

    total = marcus_anchors + yuki_anchors + ambiguous
    print(f"  Pass 1 anchors: Marcus={marcus_anchors} ({100*marcus_anchors/max(total,1):.1f}%), "
          f"Yuki={yuki_anchors} ({100*yuki_anchors/max(total,1):.1f}%), "
          f"Ambiguous={ambiguous} ({100*ambiguous/max(total,1):.1f}%)")

    return label_map


def proximity_classify(label_map):
    """
    Pass 2: Classify ambiguous pixels based on distance to anchor regions.
    Skin-colored pixels near navy rash guard = Yuki's skin
    Skin-colored pixels near red stripe or far from blue = Marcus's skin
    """
    ambiguous = label_map == -2
    if ambiguous.sum() == 0:
        return label_map

    print(f"  Pass 2: Resolving {ambiguous.sum()} ambiguous pixels by proximity...")

    marcus_anchors = (label_map == 0).astype(float)
    yuki_anchors = (label_map == 1).astype(float)

    if marcus_anchors.sum() == 0 or yuki_anchors.sum() == 0:
        # If one character has no anchors, fall back to spatial (left/right) split
        print("  WARNING: One character has no anchor pixels. Using spatial fallback.")
        ys, xs = np.where(ambiguous)
        if len(xs) > 0:
            center_x = np.median(xs)
            label_map[ambiguous & (np.indices(label_map.shape)[1] < center_x)] = 0
            label_map[ambiguous & (np.indices(label_map.shape)[1] >= center_x)] = 1
        return label_map

    # Compute distance from each pixel to nearest marcus/yuki anchor
    dist_marcus, _ = distance_transform_edt(marcus_anchors == 0, return_indices=True)
    dist_yuki, _ = distance_transform_edt(yuki_anchors == 0, return_indices=True)

    # Assign ambiguous pixels to the closer character
    closer_to_marcus = dist_marcus < dist_yuki
    label_map[ambiguous & closer_to_marcus] = 0
    label_map[ambiguous & ~closer_to_marcus] = 1

    marcus_final = (label_map == 0).sum()
    yuki_final = (label_map == 1).sum()
    total = marcus_final + yuki_final
    print(f"  Pass 2 result: Marcus={marcus_final} ({100*marcus_final/max(total,1):.1f}%), "
          f"Yuki={yuki_final} ({100*yuki_final/max(total,1):.1f}%)")

    return label_map


def find_anchor_points(label_map, label_a=0, label_b=1):
    """Detect contact regions between two characters."""
    h, w = label_map.shape
    contact_pixels = []

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
        "center": {"x": int(np.mean(xs)), "y": int(np.mean(ys))},
        "bounds": {"min_x": int(min(xs)), "max_x": int(max(xs)),
                   "min_y": int(min(ys)), "max_y": int(max(ys))},
        "contact_count": len(contact_pixels)
    }

    if len(contact_pixels) > 10:
        contact_arr = np.array(contact_pixels)
        clustering = DBSCAN(eps=15, min_samples=8).fit(contact_arr)
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
            if i == 0: r["suggested_name"] = "upper_contact"
            elif i == len(regions) - 1: r["suggested_name"] = "lower_contact"
            else: r["suggested_name"] = f"mid_contact_{i}"

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
    result = np.zeros_like(arr)
    mask = label_map == label
    result[mask] = arr[mask]
    img = Image.fromarray(result, "RGBA")

    if crop:
        bbox = img.getbbox()
        if bbox:
            pad = 4
            x1 = max(0, bbox[0] - pad)
            y1 = max(0, bbox[1] - pad)
            x2 = min(img.width, bbox[2] + pad)
            y2 = min(img.height, bbox[3] + pad)
            img = img.crop((x1, y1, x2, y2))

    return img


def create_debug_visualization(arr, label_map, anchors, output_path):
    debug = arr.copy()
    mask_a = label_map == 0
    mask_b = label_map == 1

    # Red tint for Marcus
    debug[mask_a, 0] = np.clip(debug[mask_a, 0].astype(int) + 50, 0, 255).astype(np.uint8)
    debug[mask_a, 1] = np.clip((debug[mask_a, 1].astype(int) * 0.6), 0, 255).astype(np.uint8)
    debug[mask_a, 2] = np.clip((debug[mask_a, 2].astype(int) * 0.5), 0, 255).astype(np.uint8)

    # Blue tint for Yuki
    debug[mask_b, 2] = np.clip(debug[mask_b, 2].astype(int) + 60, 0, 255).astype(np.uint8)
    debug[mask_b, 0] = np.clip((debug[mask_b, 0].astype(int) * 0.5), 0, 255).astype(np.uint8)
    debug[mask_b, 1] = np.clip((debug[mask_b, 1].astype(int) * 0.6), 0, 255).astype(np.uint8)

    h, w = debug.shape[:2]
    for region in anchors.get("regions", []):
        cx, cy = region["center_x"], region["center_y"]
        for dy in range(-5, 6):
            for dx in range(-5, 6):
                ny, nx = cy + dy, cx + dx
                if 0 <= ny < h and 0 <= nx < w:
                    if abs(dy) <= 1 or abs(dx) <= 1:
                        debug[ny, nx] = [0, 255, 0, 255]

    Image.fromarray(debug, "RGBA").save(output_path)


def process_paired_sprite(input_path, output_dir, position_name="unknown"):
    print(f"\n{'='*60}")
    print(f"  Position: {position_name}")
    print(f"  File: {os.path.basename(input_path)}")
    print(f"{'='*60}")

    os.makedirs(output_dir, exist_ok=True)

    img = Image.open(input_path).convert("RGBA")
    arr = np.array(img)
    print(f"  Image: {arr.shape[1]}x{arr.shape[0]}")

    arr = remove_background(arr)
    opaque = arr[:, :, 3] > 10
    print(f"  Opaque pixels: {opaque.sum()}")

    if opaque.sum() < 100:
        print("  ERROR: Too few opaque pixels")
        return None

    # Pass 1: High-confidence anchor classification
    label_map = classify_anchors(arr, opaque)

    # Pass 2: Proximity-based classification for ambiguous pixels
    label_map = proximity_classify(label_map)

    # Extract sprites
    marcus_sprite = extract_character_sprite(arr, label_map, 0)
    yuki_sprite = extract_character_sprite(arr, label_map, 1)
    marcus_full = extract_character_sprite(arr, label_map, 0, crop=False)
    yuki_full = extract_character_sprite(arr, label_map, 1, crop=False)

    # Save
    for name, sprite in [
        (f"{position_name}_marcus.png", marcus_sprite),
        (f"{position_name}_yuki.png", yuki_sprite),
        (f"{position_name}_marcus_full.png", marcus_full),
        (f"{position_name}_yuki_full.png", yuki_full),
    ]:
        path = os.path.join(output_dir, name)
        sprite.save(path)

    print(f"  Marcus: {marcus_sprite.size[0]}x{marcus_sprite.size[1]}")
    print(f"  Yuki:   {yuki_sprite.size[0]}x{yuki_sprite.size[1]}")

    # Anchors
    print("  Detecting anchors...")
    anchors = find_anchor_points(label_map)
    print(f"  Found {anchors['contact_count']} contact pixels, "
          f"{len(anchors.get('regions', []))} regions")

    anchor_data = {
        "position": position_name,
        "source_file": os.path.basename(input_path),
        "image_size": {"width": arr.shape[1], "height": arr.shape[0]},
        "characters": {
            "marcus": {"sprite_file": f"{position_name}_marcus.png",
                       "sprite_full": f"{position_name}_marcus_full.png",
                       "role": "top/aggressor"},
            "yuki": {"sprite_file": f"{position_name}_yuki.png",
                     "sprite_full": f"{position_name}_yuki_full.png",
                     "role": "bottom/defender"}
        },
        "anchor_regions": anchors["regions"],
        "contact_center": anchors["center"],
        "contact_bounds": anchors["bounds"]
    }

    with open(os.path.join(output_dir, f"{position_name}_anchors.json"), "w") as f:
        json.dump(anchor_data, f, indent=2)

    # Debug vis
    debug_path = os.path.join(output_dir, f"{position_name}_debug.png")
    create_debug_visualization(arr, label_map, anchors, debug_path)
    print(f"  Debug saved: {debug_path}")

    return anchor_data


def batch_process(input_dir, output_dir):
    input_path = Path(input_dir)
    results = {}

    position_map = {
        "A1": "closed_guard", "A2": "open_guard", "A3": "half_guard",
        "A4": "side_control", "A5": "mount", "A6": "back_mount",
        "A7": "turtle", "A8": "standing_clinch"
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

    manifest_path = os.path.join(output_dir, "anchor_manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n{'='*60}")
    print(f"COMPLETE: {len(results)} positions processed")
    print(f"Manifest: {manifest_path}")
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LOCKDOWN Sprite Separator v3")
    parser.add_argument("input")
    parser.add_argument("--output-dir", "-o", default="./separated")
    parser.add_argument("--position", "-p", default="unknown")
    parser.add_argument("--batch", "-b", action="store_true")

    args = parser.parse_args()
    if args.batch or os.path.isdir(args.input):
        batch_process(args.input, args.output_dir)
    else:
        process_paired_sprite(args.input, args.output_dir, args.position)
