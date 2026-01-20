# Grimdark TCG

A dark fantasy trading card game where you play as a human summoner, calling forth undead, demons, vampires, and beasts to destroy your opponent.

## Quick Start

1. Double-click `Install.bat` (once, installs dependencies)
2. Double-click `Play.bat` (runs the game)

## How to Play

**Menu:** Click "Play vs AI"

**In Game:**
- Click a card in your hand to play it (costs mana)
- Click one of your creatures to select it (orange border = can attack)
- Click an enemy creature to attack it
- Click the enemy info bar to attack face directly
- Right-click to deselect
- Click "End Turn" when done

## Rules

- Both players start with **20 health**
- **Mana:** Start at 1, gain +1 per turn, max 10, refills each turn
- **Draw:** 1 card per turn (starting hand: 4)
- **Summoning sickness:** Creatures can't attack the turn they're played
- **Combat:** Simultaneous damage (both creatures hit each other)
- **Win:** Reduce enemy health to 0

## Folder Structure

```
grimdark_tcg/
├── Install.bat           # Run once to install
├── Play.bat              # Run to play
├── package.json          # Node.js config
├── main.js               # Electron entry point
├── DESIGN_DOC.md         # Game design decisions
├── KEYWORDS.md           # Keyword abilities reference
│
├── game/                 # The playable game
│   ├── index.html
│   ├── css/styles.css
│   ├── js/cards.js       # Card database
│   ├── js/game.js        # Game logic
│   ├── audio/            # Sound effects (empty)
│   └── images/           # UI images (empty)
│
├── cards/                # Card data
│   └── basic_creatures.json
│
└── card_system/          # Tools for generating card visuals
    ├── card_builder.py   # Python card generator
    └── README.md
```

## Current Cards (16 Vanilla Creatures)

| Category | Cards |
|----------|-------|
| **Undead** | Shambling Corpse, Rotting Ghoul, Skeletal Knight, Grave Hulk |
| **Demons** | Wretched Imp, Hellspawn, Pit Fiend, Bound Horror |
| **Vampires** | Thrall, Nightstalker, Blood Knight, Vampire Lord |
| **Beasts** | Dire Rat, Corrupted Wolf, Razorback, Hunting Horror |

## Development

**Refresh after code changes:** Close game window → Double-click `Play.bat`

**Game files to edit:**
- `game/js/cards.js` — Card database
- `game/js/game.js` — Game logic
- `game/css/styles.css` — Visual styling

## Requirements

- Node.js (https://nodejs.org)
