# GRIMDARK TCG — Design Document

## CORE CONCEPT

You are a **human summoner** who calls forth dark creatures to destroy your opponent. You're not a hero — you're a conduit for darkness, wielding undead, demons, vampires, and beasts as weapons.

This explains:
- Why you can mix creature types freely
- Why spending life/blood as a resource makes sense
- Why there's no "good" faction

---

## CREATURE CATEGORIES

### UNDEAD
Skeletons, zombies, wraiths, liches.
**Theme:** Inevitability, recursion, swarm.

### DEMONS  
Imps, pit fiends, tempters.
**Theme:** Pacts, power at a price, corruption.

### VAMPIRES
Thralls, blood lords, nosferatu.
**Theme:** Predation, drain, life manipulation.

### BEASTS
Werewolves, dire wolves, chimeras.
**Theme:** Aggression, transformation, savagery.

---

## CONFIRMED RULES

### Resource: Escalating Mana
- Start with 1 mana on turn 1
- Gain +1 maximum mana each turn
- Cap at 10
- Mana fully refills each turn

### Health
- Both players start at 20

### Turn Structure
1. Gain mana (+1 max, refill to max)
2. Draw 1 card
3. Play cards (spend mana)
4. Attack with creatures
5. End turn

### Combat
- Creatures have summoning sickness (can't attack turn they're played)
- Combat is simultaneous (both creatures deal damage)
- Can attack enemy creatures OR enemy face
- Creature dies when defense reaches 0

### Win Condition
- Reduce opponent's health to 0

---

## STAT BASELINE

Formula: Total stats ≈ (Cost × 2) + 1

| Cost | Total Stats | Examples |
|------|-------------|----------|
| 1 | 2-3 | 1/1, 1/2, 2/1 |
| 2 | 4-5 | 2/2, 2/3, 3/2 |
| 3 | 6-7 | 3/3, 3/4, 4/3 |
| 4 | 8-9 | 4/4, 4/5, 5/4 |
| 5 | 10-11 | 5/5, 5/6, 6/5 |
| 6+ | 12+ | Big finishers |

Keywords/abilities cost stats.

---

## OPEN QUESTIONS

- **Factions as mechanic:** Do creature types grant synergy bonuses? Or purely thematic?
- **Player archetypes:** Just flavor, or mechanical identity (hero powers)?
- **Keywords:** Which ones to implement first?

---

## DESIGN ROADMAP

1. ✅ Core rules (mana, turns, combat)
2. ✅ Stat baseline (16 vanilla creatures)
3. ⬜ Keywords and abilities
4. ⬜ Spell cards
5. ⬜ Deck building
6. ⬜ Balance testing
