#!/usr/bin/env python3
"""
LOCKDOWN Sprite Pipeline — Step 2: Visual Preview & Anchor Editor

Opens separated sprites and their anchor data, renders them overlaid
to verify alignment looks correct. Outputs a preview sheet showing
all positions side-by-side.

Usage:
    python preview_anchors.py ./separated/ --output preview_sheet.png

Requirements:
    pip install Pillow numpy
"""

import argparse
import json
import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


def load_position_data(position_dir: str) -> dict:
    """Load sprites and anchor data for a single position."""
    pos_path = Path(position_dir)
    data = {"path": str(pos_path), "sprites": {}, "anchors": None}

    # Find anchor JSON
    json_files = list(pos_path.glob("*_anchors.json"))
    if json_files:
        with open(json_files[0]) as f:
            data["anchors"] = json.load(f)

    # Find sprite PNGs (excluding debug)
    for png in pos_path.glob("*.png"):
        if "debug" not in png.stem:
            # Determine character from filename
            if "marcus" in png.stem.lower():
                data["sprites"]["marcus"] = Image.open(png).convert("RGBA")
            elif "yuki" in png.stem.lower():
                data["sprites"]["yuki"] = Image.open(png).convert("RGBA")

    return data


def render_overlay_preview(position_data: dict, cell_size: int = 256) -> Image.Image:
    """Render a single position's sprites overlaid with anchor points marked."""
    canvas = Image.new("RGBA", (cell_size, cell_size + 40), (30, 30, 40, 255))
    draw = ImageDraw.Draw(canvas)

    # Draw position name
    pos_name = position_data.get("anchors", {}).get("position", "unknown")
    draw.text((10, cell_size + 5), pos_name.replace("_", " ").upper(),
              fill=(255, 255, 255, 255))

    # Composite sprites
    sprites = position_data.get("sprites", {})
    if not sprites:
        draw.text((10, cell_size // 2), "NO SPRITES", fill=(255, 80, 80, 255))
        return canvas

    # Scale sprites to fit cell
    for char_key, sprite in sprites.items():
        # Scale to fit within cell
        aspect = sprite.width / sprite.height
        if aspect > 1:
            new_w = cell_size - 20
            new_h = int(new_w / aspect)
        else:
            new_h = cell_size - 20
            new_w = int(new_h * aspect)

        scaled = sprite.resize((new_w, new_h), Image.NEAREST)  # NEAREST for pixel art

        # Center in cell
        x_off = (cell_size - new_w) // 2
        y_off = (cell_size - new_h) // 2

        canvas.paste(scaled, (x_off, y_off), scaled)

    # Draw anchor points
    anchors = position_data.get("anchors")
    if anchors:
        img_w = anchors.get("image_size", {}).get("width", cell_size)
        img_h = anchors.get("image_size", {}).get("height", cell_size)
        scale_x = (cell_size - 20) / max(img_w, 1)
        scale_y = (cell_size - 20) / max(img_h, 1)

        for region in anchors.get("anchor_regions", []):
            cx = int(region["center_x"] * scale_x) + 10
            cy = int(region["center_y"] * scale_y) + 10

            # Green crosshair
            draw.ellipse([cx - 4, cy - 4, cx + 4, cy + 4],
                         outline=(0, 255, 0, 255), width=2)
            draw.line([cx - 8, cy, cx + 8, cy], fill=(0, 255, 0, 200), width=1)
            draw.line([cx, cy - 8, cx, cy + 8], fill=(0, 255, 0, 200), width=1)

            # Label
            name = region.get("suggested_name", "?")
            draw.text((cx + 6, cy - 6), name[:12],
                      fill=(0, 255, 0, 255))

    return canvas


def render_separated_comparison(position_data: dict, cell_size: int = 200) -> Image.Image:
    """Show side-by-side: original overlay, character A alone, character B alone."""
    total_w = cell_size * 3 + 20
    total_h = cell_size + 60
    canvas = Image.new("RGBA", (total_w, total_h), (20, 20, 30, 255))
    draw = ImageDraw.Draw(canvas)

    sprites = position_data.get("sprites", {})
    pos_name = position_data.get("anchors", {}).get("position", "unknown")

    # Title
    draw.text((10, 5), pos_name.replace("_", " ").upper(),
              fill=(255, 255, 255, 255))

    labels = ["OVERLAY", "MARCUS (Top)", "YUKI (Bottom)"]

    for i, (label, char_key) in enumerate(zip(
        labels, [None, "marcus", "yuki"]
    )):
        x_off = i * (cell_size + 10) + 5
        y_off = 25

        # Background cell
        draw.rectangle([x_off, y_off, x_off + cell_size, y_off + cell_size],
                       fill=(40, 40, 50, 255), outline=(80, 80, 90, 255))

        if char_key is None:
            # Overlay both sprites
            for key, sprite in sprites.items():
                scaled = sprite.resize((cell_size - 10, cell_size - 10), Image.NEAREST)
                canvas.paste(scaled, (x_off + 5, y_off + 5), scaled)
        elif char_key in sprites:
            sprite = sprites[char_key]
            scaled = sprite.resize((cell_size - 10, cell_size - 10), Image.NEAREST)
            canvas.paste(scaled, (x_off + 5, y_off + 5), scaled)

        # Label
        draw.text((x_off + 5, y_off + cell_size + 5), label,
                  fill=(200, 200, 200, 255))

    return canvas


def generate_preview_sheet(separated_dir: str, output_path: str):
    """Generate a full preview sheet showing all positions."""
    sep_path = Path(separated_dir)
    positions = []

    # Load all position directories
    for subdir in sorted(sep_path.iterdir()):
        if subdir.is_dir() and not subdir.name.startswith("."):
            pos_data = load_position_data(str(subdir))
            if pos_data["sprites"]:
                positions.append(pos_data)

    if not positions:
        print("No processed positions found. Run separate_sprites.py first.")
        return

    print(f"Found {len(positions)} positions to preview")

    # Layout: 2 columns of comparison strips
    cell_w = 200
    strip_w = cell_w * 3 + 20
    strip_h = cell_w + 60
    cols = 2
    rows = (len(positions) + cols - 1) // cols

    sheet_w = strip_w * cols + 30
    sheet_h = strip_h * rows + 80
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (15, 15, 25, 255))
    draw = ImageDraw.Draw(sheet)

    # Title
    draw.text((20, 15), "LOCKDOWN — SPRITE SEPARATION PREVIEW",
              fill=(255, 200, 50, 255))
    draw.text((20, 35), "Verify: Characters properly separated | Anchors at contact points",
              fill=(150, 150, 160, 255))

    for idx, pos_data in enumerate(positions):
        col = idx % cols
        row = idx // cols
        x = col * (strip_w + 10) + 15
        y = row * strip_h + 65

        strip = render_separated_comparison(pos_data, cell_w)
        sheet.paste(strip, (x, y), strip)

    sheet.save(output_path)
    print(f"Preview sheet saved: {output_path}")


def generate_anchor_overlay_sheet(separated_dir: str, output_path: str):
    """Generate a sheet showing just the overlaid sprites with anchor markers."""
    sep_path = Path(separated_dir)
    positions = []

    for subdir in sorted(sep_path.iterdir()):
        if subdir.is_dir() and not subdir.name.startswith("."):
            pos_data = load_position_data(str(subdir))
            if pos_data["sprites"]:
                positions.append(pos_data)

    if not positions:
        print("No processed positions found.")
        return

    cell_size = 256
    cols = 4
    rows = (len(positions) + cols - 1) // cols

    sheet_w = cell_size * cols + 20
    sheet_h = (cell_size + 40) * rows + 60
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (15, 15, 25, 255))
    draw = ImageDraw.Draw(sheet)

    draw.text((10, 10), "ANCHOR POINT VERIFICATION",
              fill=(0, 255, 0, 255))
    draw.text((10, 30), "Green markers = detected contact regions",
              fill=(100, 200, 100, 255))

    for idx, pos_data in enumerate(positions):
        col = idx % cols
        row = idx // cols
        x = col * cell_size + 10
        y = row * (cell_size + 40) + 55

        cell = render_overlay_preview(pos_data, cell_size)
        sheet.paste(cell, (x, y), cell)

    sheet.save(output_path)
    print(f"Anchor verification sheet saved: {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description="LOCKDOWN Sprite Preview — Verify separation and anchors"
    )
    parser.add_argument("separated_dir",
                        help="Directory containing separated sprite folders")
    parser.add_argument("--output", "-o", default="preview_sheet.png",
                        help="Output preview image path")
    parser.add_argument("--anchors-only", action="store_true",
                        help="Generate anchor overlay sheet instead of full comparison")

    args = parser.parse_args()

    if args.anchors_only:
        generate_anchor_overlay_sheet(args.separated_dir, args.output)
    else:
        generate_preview_sheet(args.separated_dir, args.output)


if __name__ == "__main__":
    main()
