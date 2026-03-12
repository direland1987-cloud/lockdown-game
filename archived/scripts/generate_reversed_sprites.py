#!/usr/bin/env python3
"""
Generate reversed (horizontally flipped) versions of BJJ grappling sprites.

This script takes the separated marcus and yuki sprites for each grappling position
and creates mirrored versions with a _rev suffix. This is used for showing characters
on opposite sides of the screen using the same sprite art (a common fighting game technique).
"""

import os
from pathlib import Path
from PIL import Image

# Define the positions and their directories
POSITIONS = [
    "closed_guard",
    "open_guard",
    "half_guard",
    "side_control",
    "mount",
    "back_mount",
    "turtle",
    "standing_clinch"
]

# Define the base directory
BASE_DIR = "/sessions/fervent-nice-sagan/mnt/BJJ 16bit game/separated"

def flip_image_horizontally(input_path, output_path):
    """
    Load a PNG image, flip it horizontally, and save it.

    Args:
        input_path: Path to the input PNG file
        output_path: Path to save the flipped image
    """
    try:
        # Open the image (should be RGBA with transparency)
        img = Image.open(input_path)

        # Flip horizontally (mirror left-to-right)
        flipped = img.transpose(Image.FLIP_LEFT_RIGHT)

        # Save as PNG preserving transparency
        flipped.save(output_path, 'PNG')

        print(f"✓ Created: {output_path}")
        return True
    except Exception as e:
        print(f"✗ Error processing {input_path}: {e}")
        return False

def main():
    """Generate reversed sprites for all positions."""

    processed = 0
    failed = 0

    print("=" * 70)
    print("BJJ Sprite Reversal Generator")
    print("=" * 70)
    print()

    for position in POSITIONS:
        position_dir = os.path.join(BASE_DIR, position)

        if not os.path.isdir(position_dir):
            print(f"✗ Directory not found: {position_dir}")
            failed += 1
            continue

        print(f"Processing: {position}")
        print("-" * 70)

        # Process marcus sprite
        marcus_input = os.path.join(position_dir, f"{position}_marcus.png")
        marcus_output = os.path.join(position_dir, f"{position}_marcus_rev.png")

        if os.path.exists(marcus_input):
            if flip_image_horizontally(marcus_input, marcus_output):
                processed += 1
            else:
                failed += 1
        else:
            print(f"✗ Not found: {marcus_input}")
            failed += 1

        # Process yuki sprite
        yuki_input = os.path.join(position_dir, f"{position}_yuki.png")
        yuki_output = os.path.join(position_dir, f"{position}_yuki_rev.png")

        if os.path.exists(yuki_input):
            if flip_image_horizontally(yuki_input, yuki_output):
                processed += 1
            else:
                failed += 1
        else:
            print(f"✗ Not found: {yuki_input}")
            failed += 1

        # Process full marcus sprite
        marcus_full_input = os.path.join(position_dir, f"{position}_marcus_full.png")
        marcus_full_output = os.path.join(position_dir, f"{position}_marcus_full_rev.png")

        if os.path.exists(marcus_full_input):
            if flip_image_horizontally(marcus_full_input, marcus_full_output):
                processed += 1
            else:
                failed += 1
        else:
            print(f"✗ Not found: {marcus_full_input}")
            failed += 1

        # Process full yuki sprite
        yuki_full_input = os.path.join(position_dir, f"{position}_yuki_full.png")
        yuki_full_output = os.path.join(position_dir, f"{position}_yuki_full_rev.png")

        if os.path.exists(yuki_full_input):
            if flip_image_horizontally(yuki_full_input, yuki_full_output):
                processed += 1
            else:
                failed += 1
        else:
            print(f"✗ Not found: {yuki_full_input}")
            failed += 1

        print()

    # Summary
    print("=" * 70)
    print("Summary")
    print("=" * 70)
    print(f"Successfully processed: {processed} images")
    print(f"Failed or skipped: {failed} images")
    print(f"Total positions: {len(POSITIONS)}")
    print()

    if failed == 0:
        print("All reversed sprites generated successfully!")
    else:
        print(f"Warning: {failed} issues encountered during processing.")

if __name__ == "__main__":
    main()
