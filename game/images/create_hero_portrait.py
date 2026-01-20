#!/usr/bin/env python3
"""
GRIMDARK TCG - Hero Portrait Creator
=====================================

Usage:
    python create_hero_portrait.py <artwork.png> <hero_name> [--face-y 0.25] [--zoom 1.4]

Examples:
    python create_hero_portrait.py vampire_art.png hero_vampire --face-y 0.22 --zoom 1.4
    python create_hero_portrait.py demon_art.png hero_demon --face-y 0.30 --zoom 1.2

Arguments:
    artwork.png  - Source artwork (any size, will be cropped/scaled)
    hero_name    - Output filename (without .png)
    --face-y     - Vertical position of face (0.0=top, 1.0=bottom, default=0.25)
    --zoom       - Zoom factor (1.0=fit to circle, >1=zoom in, default=1.0)

Outputs:
    {hero_name}_full.png  - High resolution (1024x1024)
    {hero_name}.png       - Game-ready (200x200)

Requirements:
    - hero_frame_clean.png (frame with transparent center) must be in same directory
    - PIL/Pillow: pip install Pillow
"""

from PIL import Image, ImageDraw
import argparse
import os

# === CONFIGURATION ===
# These values are calibrated for the Grimdark TCG frame
FRAME_SIZE = 1024          # Frame image dimensions
PORTRAIT_RADIUS = 344      # Inner circle radius (calibrated to frame)
PORTRAIT_DIAMETER = 688    # Inner circle diameter
PORTRAIT_CENTER = 512      # Center of frame
GAME_SIZE = 200            # Final game UI size


def create_hero_portrait(frame_path, artwork_path, output_name, face_y=0.25, zoom=1.0):
    """
    Create a hero portrait with the artwork placed inside the frame.
    
    Args:
        frame_path: Path to hero_frame_clean.png
        artwork_path: Path to source artwork
        output_name: Base name for output files
        face_y: Vertical position of face in artwork (0=top, 1=bottom)
        zoom: Zoom factor (1.0=fit, higher=zoom in)
    
    Returns:
        Tuple of (full_path, game_path) for created files
    """
    # Load images
    frame = Image.open(frame_path).convert("RGBA")
    artwork = Image.open(artwork_path).convert("RGBA")
    
    art_w, art_h = artwork.size
    
    # Calculate crop region
    crop_size = int(min(art_w, art_h) / zoom)
    half = crop_size // 2
    
    # Center horizontally, position vertically at face_y
    center_x = art_w // 2
    center_y = int(art_h * face_y)
    
    # Calculate crop bounds with edge handling
    left = max(0, center_x - half)
    top = max(0, center_y - half)
    right = min(art_w, left + crop_size)
    bottom = min(art_h, top + crop_size)
    
    # Ensure square crop
    actual_size = min(right - left, bottom - top)
    right = left + actual_size
    bottom = top + actual_size
    
    # Crop and resize to fit frame
    cropped = artwork.crop((left, top, right, bottom))
    resized = cropped.resize((PORTRAIT_DIAMETER, PORTRAIT_DIAMETER), Image.Resampling.LANCZOS)
    
    # Create circular mask
    mask = Image.new("L", (PORTRAIT_DIAMETER, PORTRAIT_DIAMETER), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([0, 0, PORTRAIT_DIAMETER - 1, PORTRAIT_DIAMETER - 1], fill=255)
    
    # Apply circular mask to portrait
    circular_portrait = Image.new("RGBA", (PORTRAIT_DIAMETER, PORTRAIT_DIAMETER), (0, 0, 0, 0))
    circular_portrait.paste(resized, (0, 0))
    circular_portrait.putalpha(mask)
    
    # Composite: portrait behind frame
    result = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    offset = PORTRAIT_CENTER - PORTRAIT_RADIUS
    result.paste(circular_portrait, (offset, offset), circular_portrait)
    result.paste(frame, (0, 0), frame)
    
    # Determine output directory
    output_dir = os.path.dirname(artwork_path) or "."
    
    # Save high-res version
    full_path = os.path.join(output_dir, f"{output_name}_full.png")
    result.save(full_path, "PNG")
    
    # Save game-ready version
    game_result = result.resize((GAME_SIZE, GAME_SIZE), Image.Resampling.LANCZOS)
    game_path = os.path.join(output_dir, f"{output_name}.png")
    game_result.save(game_path, "PNG")
    
    return full_path, game_path


def main():
    parser = argparse.ArgumentParser(
        description="Create hero portraits for Grimdark TCG",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument("artwork", help="Source artwork file")
    parser.add_argument("name", help="Output name (without .png)")
    parser.add_argument("--face-y", type=float, default=0.25,
                        help="Vertical position of face (0=top, 1=bottom)")
    parser.add_argument("--zoom", type=float, default=1.0,
                        help="Zoom factor (1.0=fit, >1=zoom in)")
    parser.add_argument("--frame", default="hero_frame_clean.png",
                        help="Path to frame image")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.artwork):
        print(f"Error: Artwork file not found: {args.artwork}")
        return 1
    
    if not os.path.exists(args.frame):
        print(f"Error: Frame file not found: {args.frame}")
        print("Make sure hero_frame_clean.png is in the current directory")
        return 1
    
    print(f"Creating hero portrait: {args.name}")
    print(f"  Artwork: {args.artwork}")
    print(f"  Face position: {args.face_y:.0%} from top")
    print(f"  Zoom: {args.zoom}x")
    
    full_path, game_path = create_hero_portrait(
        args.frame,
        args.artwork,
        args.name,
        face_y=args.face_y,
        zoom=args.zoom
    )
    
    print(f"\nCreated:")
    print(f"  {full_path} (1024x1024)")
    print(f"  {game_path} (200x200)")
    
    return 0


if __name__ == "__main__":
    exit(main())
