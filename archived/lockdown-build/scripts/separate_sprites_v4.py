#!/usr/bin/env python3
"""
LOCKDOWN Sprite Pipeline v4 — Spatial clustering + color verification.

Strategy:
1. Remove background
2. K-Means spatial clustering to split into 2 character blobs
3. Identify which blob = Marcus and which = Yuki based on navy blue content
4. Refine boundaries using color information at the overlap zone
5. Extract separated sprites + anchor points
"""

import argparse
import json
import os
from pathlib import Path

import numpy as np
from PIL import Image
from sklearn.cluster import KMeans, DBSCAN
from scipy.ndimage import distance_transform_edt, label as ndlabel


BG_THRESHOLD = 228


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


def is_navy_blue(r, g, b):
    """Check if pixel is in Yuki's navy/blue range."""
    h, s, v = rgb_to_hsv(r, g, b)
    return (190 <= h <= 290) and s > 20 and v > 8


def is_warm_skin(r, g, b):
    """Check if pixel is warm amber/orange (Marcus's dominant exposed skin)."""
    h, s, v = rgb_to_hsv(r, g, b)
    return (15 <= h <= 60) and s > 30 and v > 30


def is_red_accent(r, g, b):
    """Check if pixel is Marcus's red stripe."""
    h, s, v = rgb_to_hsv(r, g, b)
    return ((h < 15) or (h > 340)) and s > 40 and v > 15


def remove_background(arr):
    if arr.shape[2] == 3:
        alpha = np.full((*arr.shape[:2], 1), 255, dtype=np.uint8)
        arr = np.concatenate([arr, alpha], axis=2)
    is_bg = np.all(arr[:, :, :3] > BG_THRESHOLD, axis=2)
    arr[is_bg, 3] = 0
    return arr


def spatial_color_separate(arr, opaque_mask):
    """
    Main separation algorithm:
    1. K-Means on (x, y, color_features) to get 2 blobs
    2. Identify blobs by navy content
    3. Refine the boundary zone using color classification
    """
    h, w = arr.shape[:2]
    ys, xs = np.where(opaque_mask)

    if len(xs) < 100:
        return np.full((h, w), -1, dtype=int)

    # Build feature vectors: spatial (x,y) + color channel hints
    # Weight spatial more heavily to get good blob separation
    pixels = arr[ys, xs, :3].astype(float)

    # Compute per-pixel color features
    navy_scores = np.zeros(len(xs))
    warm_scores = np.zeros(len(xs))

    for i in range(len(xs)):
        r, g, b = int(pixels[i, 0]), int(pixels[i, 1]), int(pixels[i, 2])
        if is_navy_blue(r, g, b):
            navy_scores[i] = 1.0
        elif is_warm_skin(r, g, b):
            warm_scores[i] = 1.0
        elif is_red_accent(r, g, b):
            warm_scores[i] = 0.8  # Red stripe = Marcus indicator

    # Normalize spatial coords to 0-1 range
    x_norm = xs.astype(float) / w
    y_norm = ys.astype(float) / h

    # Feature vector: heavy spatial weight + color hint
    # The color hint helps separate overlapping regions
    spatial_weight = 3.0
    color_weight = 2.0

    features = np.column_stack([
        x_norm * spatial_weight,
        y_norm * spatial_weight,
        (warm_scores - navy_scores) * color_weight,  # +ve = Marcus-ish, -ve = Yuki-ish
    ])

    # K-Means into 2 clusters
    print("  Running K-Means spatial+color clustering...")
    kmeans = KMeans(n_clusters=2, n_init=10, random_state=42)
    cluster_labels = kmeans.fit_predict(features)

    # Build label map
    label_map = np.full((h, w), -1, dtype=int)
    for i in range(len(xs)):
        label_map[ys[i], xs[i]] = cluster_labels[i]

    # Determine which cluster is Marcus and which is Yuki
    # Count navy blue pixels in each cluster
    navy_in_0 = 0
    navy_in_1 = 0
    red_in_0 = 0
    red_in_1 = 0

    for i in range(len(xs)):
        r, g, b = int(pixels[i, 0]), int(pixels[i, 1]), int(pixels[i, 2])
        cl = cluster_labels[i]
        if is_navy_blue(r, g, b):
            if cl == 0: navy_in_0 += 1
            else: navy_in_1 += 1
        if is_red_accent(r, g, b):
            if cl == 0: red_in_0 += 1
            else: red_in_1 += 1

    print(f"  Cluster 0: navy={navy_in_0}, red={red_in_0}")
    print(f"  Cluster 1: navy={navy_in_1}, red={red_in_1}")

    # Yuki = cluster with more navy, Marcus = cluster with more red (or less navy)
    if navy_in_1 > navy_in_0:
        # Cluster 1 = Yuki, need to swap so Marcus=0, Yuki=1
        yuki_cluster = 1
    else:
        # Cluster 0 = Yuki, swap labels
        yuki_cluster = 0

    if yuki_cluster == 0:
        # Swap: 0->1 (Yuki), 1->0 (Marcus)
        swapped = label_map.copy()
        swapped[label_map == 0] = 1
        swapped[label_map == 1] = 0
        label_map = swapped
        print("  Cluster assignment: swapped (cluster 0 → Yuki, cluster 1 → Marcus)")
    else:
        print("  Cluster assignment: direct (cluster 0 → Marcus, cluster 1 → Yuki)")

    # Refine: In the boundary zone, use color to fix misclassified pixels
    print("  Refining boundary zone...")
    refinement_count = 0

    # Find boundary pixels (within N pixels of the other character)
    marcus_mask = (label_map == 0).astype(float)
    yuki_mask = (label_map == 1).astype(float)

    if marcus_mask.sum() > 0 and yuki_mask.sum() > 0:
        dist_to_marcus, _ = distance_transform_edt(marcus_mask == 0, return_indices=True)
        dist_to_yuki, _ = distance_transform_edt(yuki_mask == 0, return_indices=True)

        # Boundary zone: within 20px of the other character
        boundary_zone = opaque_mask & ((dist_to_marcus < 25) & (dist_to_yuki < 25))

        bys, bxs = np.where(boundary_zone)
        for y, x in zip(bys, bxs):
            r, g, b = int(arr[y, x, 0]), int(arr[y, x, 1]), int(arr[y, x, 2])

            # Strong navy blue in Marcus zone → should be Yuki
            if label_map[y, x] == 0 and is_navy_blue(r, g, b):
                label_map[y, x] = 1
                refinement_count += 1
            # Red accent in Yuki zone → should be Marcus
            elif label_map[y, x] == 1 and is_red_accent(r, g, b):
                label_map[y, x] = 0
                refinement_count += 1

    print(f"  Refined {refinement_count} boundary pixels")

    # Final stats
    marcus_final = (label_map == 0).sum()
    yuki_final = (label_map == 1).sum()
    total = marcus_final + yuki_final
    print(f"  Final: Marcus={marcus_final} ({100*marcus_final/max(total,1):.1f}%), "
          f"Yuki={yuki_final} ({100*yuki_final/max(total,1):.1f}%)")

    return label_map


def find_anchor_points(label_map, label_a=0, label_b=1):
    h, w = label_map.shape
    contact_pixels = []

    for y in range(1, h - 1):
        for x in range(1, w - 1):
            if label_map[y, x] == label_a:
                neighbors = label_map[y-1:y+2, x-1:x+2].flatten()
                if label_b in neighbors:
                    contact_pixels.append((x, y))

    if not contact_pixels:
        return {"center": {"x": w//2, "y": h//2},
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
        unique = sorted(set(labels) - {-1})

        regions = []
        for lbl in unique:
            rp = contact_arr[labels == lbl]
            regions.append({
                "center_x": int(np.mean(rp[:, 0])),
                "center_y": int(np.mean(rp[:, 1])),
                "pixel_count": int(len(rp)),
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


def extract_character(arr, label_map, label, crop=True):
    result = np.zeros_like(arr)
    mask = label_map == label
    result[mask] = arr[mask]
    img = Image.fromarray(result, "RGBA")
    if crop:
        bbox = img.getbbox()
        if bbox:
            pad = 2
            x1 = max(0, bbox[0] - pad)
            y1 = max(0, bbox[1] - pad)
            x2 = min(img.width, bbox[2] + pad)
            y2 = min(img.height, bbox[3] + pad)
            img = img.crop((x1, y1, x2, y2))
    return img


def create_debug(arr, label_map, anchors, path):
    debug = arr.copy()
    m0 = label_map == 0
    m1 = label_map == 1

    debug[m0, 0] = np.clip(debug[m0, 0].astype(int) + 50, 0, 255).astype(np.uint8)
    debug[m0, 1] = np.clip((debug[m0, 1] * 0.6).astype(int), 0, 255).astype(np.uint8)
    debug[m0, 2] = np.clip((debug[m0, 2] * 0.5).astype(int), 0, 255).astype(np.uint8)

    debug[m1, 2] = np.clip(debug[m1, 2].astype(int) + 60, 0, 255).astype(np.uint8)
    debug[m1, 0] = np.clip((debug[m1, 0] * 0.5).astype(int), 0, 255).astype(np.uint8)
    debug[m1, 1] = np.clip((debug[m1, 1] * 0.6).astype(int), 0, 255).astype(np.uint8)

    h, w = debug.shape[:2]
    for region in anchors.get("regions", []):
        cx, cy = region["center_x"], region["center_y"]
        for dy in range(-5, 6):
            for dx in range(-5, 6):
                ny, nx = cy + dy, cx + dx
                if 0 <= ny < h and 0 <= nx < w and (abs(dy) <= 1 or abs(dx) <= 1):
                    debug[ny, nx] = [0, 255, 0, 255]

    Image.fromarray(debug, "RGBA").save(path)


def process_sprite(input_path, output_dir, position_name="unknown"):
    print(f"\n{'='*60}")
    print(f"  {position_name} — {os.path.basename(input_path)}")
    print(f"{'='*60}")

    os.makedirs(output_dir, exist_ok=True)

    arr = np.array(Image.open(input_path).convert("RGBA"))
    arr = remove_background(arr)
    opaque = arr[:, :, 3] > 10
    print(f"  Image: {arr.shape[1]}x{arr.shape[0]}, opaque: {opaque.sum()}")

    if opaque.sum() < 100:
        print("  SKIP: too few pixels")
        return None

    label_map = spatial_color_separate(arr, opaque)

    marcus = extract_character(arr, label_map, 0)
    yuki = extract_character(arr, label_map, 1)
    marcus_full = extract_character(arr, label_map, 0, crop=False)
    yuki_full = extract_character(arr, label_map, 1, crop=False)

    for name, spr in [
        (f"{position_name}_marcus.png", marcus),
        (f"{position_name}_yuki.png", yuki),
        (f"{position_name}_marcus_full.png", marcus_full),
        (f"{position_name}_yuki_full.png", yuki_full),
    ]:
        spr.save(os.path.join(output_dir, name))

    print(f"  Marcus: {marcus.size[0]}x{marcus.size[1]}, Yuki: {yuki.size[0]}x{yuki.size[1]}")

    anchors = find_anchor_points(label_map)
    print(f"  Anchors: {anchors['contact_count']} px, {len(anchors['regions'])} regions")

    anchor_data = {
        "position": position_name,
        "source_file": os.path.basename(input_path),
        "image_size": {"width": arr.shape[1], "height": arr.shape[0]},
        "characters": {
            "marcus": {"sprite_file": f"{position_name}_marcus.png",
                       "sprite_full": f"{position_name}_marcus_full.png"},
            "yuki": {"sprite_file": f"{position_name}_yuki.png",
                     "sprite_full": f"{position_name}_yuki_full.png"}
        },
        "anchor_regions": anchors["regions"],
        "contact_center": anchors["center"],
        "contact_bounds": anchors["bounds"]
    }

    with open(os.path.join(output_dir, f"{position_name}_anchors.json"), "w") as f:
        json.dump(anchor_data, f, indent=2)

    create_debug(arr, label_map, anchors, os.path.join(output_dir, f"{position_name}_debug.png"))

    return anchor_data


def batch_process(input_dir, output_dir):
    results = {}
    pos_map = {
        "A1": "closed_guard", "A2": "open_guard", "A3": "half_guard",
        "A4": "side_control", "A5": "mount", "A6": "back_mount",
        "A7": "turtle", "A8": "standing_clinch"
    }

    for f in sorted(Path(input_dir).glob("A*.png")):
        pname = f.stem
        for prefix, pos in pos_map.items():
            if f.stem.upper().startswith(prefix):
                pname = pos
                break
        r = process_sprite(str(f), os.path.join(output_dir, pname), pname)
        if r: results[pname] = r

    manifest = os.path.join(output_dir, "anchor_manifest.json")
    with open(manifest, "w") as fp:
        json.dump(results, fp, indent=2)

    print(f"\n{'='*60}")
    print(f"DONE — {len(results)} positions → {manifest}")
    return results


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("-o", "--output-dir", default="./separated")
    p.add_argument("-p", "--position", default="unknown")
    p.add_argument("-b", "--batch", action="store_true")
    a = p.parse_args()

    if a.batch or os.path.isdir(a.input):
        batch_process(a.input, a.output_dir)
    else:
        process_sprite(a.input, a.output_dir, a.position)
