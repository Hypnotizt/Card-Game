# Grimdark TCG - Hero Portrait System

## Quick Start

To add a new hero:

1. Get artwork (any size, Midjourney works great)
2. Run the background remover on the frame if needed (removebg.io)
3. Use the script or manual process below

## Files

| File | Size | Purpose |
|------|------|---------|
| `hero_frame_1024.png` | 1024×1024 | High-res frame (transparent center) |
| `hero_frame.png` | 200×200 | Game-ready frame overlay |
| `hero_enemy.png` | 134×134 | Circular portrait (enemy) |
| `hero_player.png` | 134×134 | Circular portrait (player) |

## Dimensions

```
Frame:     200×200px (game size)
Portrait:  134×134px (circular)
Offset:    33px from frame edge
```

## Adding Heroes (Python Script)

```bash
python create_hero_portrait.py artwork.png hero_name --face-y 0.25 --zoom 1.4
```

**Parameters:**
- `--face-y`: Where the face is (0=top, 0.5=middle, 1=bottom). Most portraits: 0.20-0.35
- `--zoom`: How much to zoom in (1.0=fit, 1.5=150%, etc)

## Adding Heroes (Manual)

1. Open artwork in image editor
2. Crop to square, centered on face
3. Resize to 134×134px
4. Apply circular mask
5. Save as `hero_NAME.png`

## CSS Structure

```css
.hero-portrait {
    width: 200px;
    height: 200px;
}

.hero-portrait .portrait {
    width: 134px;
    height: 134px;
    top: 33px;
    left: 33px;
    /* Portrait goes BEHIND frame */
    z-index: 1;
}

.hero-portrait .frame {
    /* Frame goes ON TOP */
    z-index: 3;
}
```

## HTML Structure

```html
<div class="hero-portrait">
    <div class="portrait" style="background-image: url('images/hero_NAME.png');"></div>
    <div class="frame"></div>
    <div class="hp-container">...</div>
    <div class="mana-container">...</div>
</div>
```

## Midjourney Prompts

Good prompts for hero portraits:
- `[creature type] portrait, dark fantasy, dramatic lighting --ar 1:1 --v 7`
- Face should be in upper 30% of image for best results
- Higher contrast works better at small sizes

## Frame Specifications

The ornate frame was generated in Midjourney and has:
- Cardinal ornaments (N/S/E/W decorative elements)  
- Teal/red/gold color scheme
- Inner gold ring at radius 344px (in 1024px version)
