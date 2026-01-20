# Card Builder System

Python tool for generating card visuals from a template frame + custom art.

## Requirements

- Python 3.x
- Pillow (`pip install Pillow`)

## Usage

```python
from card_builder import CardBuilder

# Initialize with the card back/frame image
builder = CardBuilder("path/to/card_frame.png")

# Build a card
card = builder.build(
    art_image_path="path/to/art.png",
    card_name="VAMPIRE LORD",
    card_type="Creature — Vampire",
    abilities=["Drain — When this creature deals", "damage to the enemy, gain that much life."],
    flavor=["\"He has ruled longer than", "your kingdom has existed.\""],
    attack="5",
    defense="5"
)

# Save
card.save("vampire_lord.png")
```

## Features

- Automatic text centering
- Keyword bolding (detects "Keyword —" pattern)
- Auto-scaling for long text
- Proper color hierarchy (gold names, bronze types, warm white abilities)

## Art Recommendations

- Aspect ratio: 3:2 (e.g., 600×400, 900×600)
- Format: PNG with transparency works best
- Style: Midjourney images work great

## Output

- Size: 896×1344 pixels (2:3 ratio)
- Format: PNG with full quality
