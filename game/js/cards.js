// ============================================================================
// GRIMDARK TCG - Card Database
// ============================================================================
// Card Types: Creature, Spell, Relic, Curse, Pact
// Tribes: Undead, Demon, Vampire, Beast, Spirit, Cultist
// Magic Schools: Death, Blood, Shadow, Ritual, Affliction, Generic
// ============================================================================

let instanceCounter = 0;

// ============================================================================
// KEYWORD DEFINITIONS (for reference and tooltips)
// ============================================================================
const KEYWORDS = {
    // Universal Keywords
    rush: { name: "Rush", description: "Can attack the turn it's played." },
    drain: { name: "Drain", description: "Heals your hero for damage dealt." },
    deathstrike: { name: "Deathstrike", description: "Destroys any creature it damages." },
    taunt: { name: "Taunt", description: "Enemies must attack this first." },
    elusive: { name: "Elusive", description: "Can't be targeted by spells or abilities." },
    stealth: { name: "Stealth", description: "Can't be attacked until it attacks." },
    
    // Trigger Keywords
    battlecry: { name: "Battlecry", description: "Triggers when played from hand." },
    haunt: { name: "Haunt", description: "Triggers when this creature dies." },
    frenzy: { name: "Frenzy", description: "Triggers first time this takes damage and survives." },
    awakened: { name: "Awakened", description: "Active while your hero is below 15 HP." },
    
    // Undead Keywords
    undying: { name: "Undying", description: "The first time this dies, return it to your hand." },
    reassemble: { name: "Reassemble", description: "At end of turn, if this died, resummon it with 1 HP." },
    graveStrength: { name: "Grave Strength", description: "+1 Attack for each creature in your graveyard." },
    soulchain: { name: "Soulchain", description: "When this dies, summon a 1/1 Shade." },
    
    // Demon Keywords
    torment: { name: "Torment", description: "At start of your turn, take X damage." },
    consume: { name: "Consume", description: "Destroy a friendly creature to gain its stats." },
    offering: { name: "Offering", description: "Sacrifice a creature or take damage." },
    doom: { name: "Doom", description: "When this dies, deal X damage to your hero." },
    
    // Vampire Keywords
    siphon: { name: "Siphon", description: "Steal 1/1 from attacked creature." },
    nightfall: { name: "Nightfall", description: "+2 Attack while enemy hero is below 15 HP." },
    bloodScent: { name: "Blood Scent", description: "Can attack Stealthed creatures." },
    
    // Beast Keywords
    packHunter: { name: "Pack Hunter", description: "+1/+1 for each other Beast you control." },
    feral: { name: "Feral", description: "Can attack twice per turn." },
    rampage: { name: "Rampage", description: "Gains +1 Attack after killing a creature." },
    
    // Spirit Keywords
    incorporeal: { name: "Incorporeal", description: "Takes 1 less damage from all sources (min 1)." },
    phase: { name: "Phase", description: "50% chance to avoid attacks." },
    possess: { name: "Possess", description: "When this dies, take control of a random enemy creature with 2 or less Attack." },
    
    // Cultist Keywords
    martyr: { name: "Martyr", description: "Triggers when sacrificed (not just killed)." },
    devoted: { name: "Devoted", description: "Triggers when another friendly Cultist dies." },
    zealot: { name: "Zealot", description: "When this dies, deal 2 damage to enemy hero." },
    darkPrayer: { name: "Dark Prayer", description: "At end of turn, if 3+ Cultists, draw a card." }
};

// ============================================================================
// TOKEN DEFINITIONS
// ============================================================================
const TOKENS = {
    shade: {
        name: "Shade",
        type: "Creature",
        tribe: "Undead",
        cost: 0,
        attack: 1,
        defense: 1,
        keywords: [],
        text: "",
        flavor: "A fragment of a shattered soul."
    },
    skeleton: {
        name: "Skeleton",
        type: "Creature",
        tribe: "Undead",
        cost: 0,
        attack: 2,
        defense: 2,
        keywords: ["taunt"],
        text: "Taunt",
        flavor: "Bones bound by dark will."
    },
    demon_spawn: {
        name: "Demon Spawn",
        type: "Creature",
        tribe: "Demon",
        cost: 0,
        attack: 2,
        defense: 2,
        keywords: [],
        text: "",
        flavor: "A lesser fiend from the pits."
    },
    fiend: {
        name: "Fiend",
        type: "Creature",
        tribe: "Demon",
        cost: 0,
        attack: 3,
        defense: 3,
        keywords: [],
        text: "",
        flavor: "Summoned from the abyss."
    },
    pact_demon: {
        name: "Pact Demon",
        type: "Creature",
        tribe: "Demon",
        cost: 0,
        attack: 4,
        defense: 4,
        keywords: ["rush"],
        text: "Rush",
        flavor: "Bound by a bargain. Temporary."
    },
    bat: {
        name: "Bat",
        type: "Creature",
        tribe: "Beast",
        cost: 0,
        attack: 1,
        defense: 1,
        keywords: ["rush"],
        text: "Rush",
        flavor: "A tiny terror of the night."
    },
    wolf: {
        name: "Wolf",
        type: "Creature",
        tribe: "Beast",
        cost: 0,
        attack: 2,
        defense: 2,
        keywords: ["rush"],
        text: "Rush",
        flavor: "They hunt in packs."
    },
    cultist: {
        name: "Cultist",
        type: "Creature",
        tribe: "Cultist",
        cost: 0,
        attack: 1,
        defense: 1,
        keywords: [],
        text: "",
        flavor: "A nameless follower of darkness."
    }
};

// ============================================================================
// CARD DATABASE
// ============================================================================
const CARD_DATABASE = {
    
    // ========================================================================
    // UNDEAD CREATURES (10)
    // ========================================================================
    
    bone_walker: {
        name: "Bone Walker",
        type: "Creature",
        tribe: "Undead",
        cost: 1,
        hpCost: 0,
        attack: 1,
        defense: 2,
        keywords: [],
        text: "",
        flavor: "The first to rise. Never the last."
    },
    
    shambling_corpse: {
        name: "Shambling Corpse",
        type: "Creature",
        tribe: "Undead",
        cost: 1,
        hpCost: 0,
        attack: 2,
        defense: 1,
        keywords: ["soulchain"],
        text: "Soulchain: Summon a 1/1 Shade when this dies.",
        flavor: "Death splits the soul from the flesh."
    },
    
    tomb_guardian: {
        name: "Tomb Guardian",
        type: "Creature",
        tribe: "Undead",
        cost: 2,
        hpCost: 0,
        attack: 1,
        defense: 4,
        keywords: ["taunt"],
        text: "Taunt",
        flavor: "Eternal vigil requires no rest."
    },
    
    risen_soldier: {
        name: "Risen Soldier",
        type: "Creature",
        tribe: "Undead",
        cost: 2,
        hpCost: 0,
        attack: 2,
        defense: 2,
        keywords: ["haunt"],
        text: "Haunt: Deal 1 damage to the enemy hero.",
        flavor: "His hatred outlasted his flesh.",
        hauntEffect: { type: "damage_enemy_hero", amount: 1 }
    },
    
    crypt_crawler: {
        name: "Crypt Crawler",
        type: "Creature",
        tribe: "Undead",
        cost: 3,
        hpCost: 0,
        attack: 2,
        defense: 4,
        keywords: ["graveStrength"],
        text: "Grave Strength: +1 Attack for each creature in your graveyard.",
        flavor: "It feeds on the fallen."
    },
    
    relentless_revenant: {
        name: "Relentless Revenant",
        type: "Creature",
        tribe: "Undead",
        cost: 4,
        hpCost: 0,
        attack: 3,
        defense: 4,
        keywords: ["undying"],
        text: "Undying: Returns to your hand the first time it dies.",
        flavor: "You cannot kill what refuses to stay dead."
    },
    
    corpse_harvester: {
        name: "Corpse Harvester",
        type: "Creature",
        tribe: "Undead",
        cost: 4,
        hpCost: 0,
        attack: 3,
        defense: 3,
        keywords: ["battlecry"],
        text: "Battlecry: Summon a 1/1 Shade for each creature in your graveyard (max 3).",
        flavor: "The dead serve. Always.",
        battlecryEffect: { type: "summon_per_graveyard", token: "shade", max: 3 }
    },
    
    grave_knight: {
        name: "Grave Knight",
        type: "Creature",
        tribe: "Undead",
        cost: 5,
        hpCost: 0,
        attack: 4,
        defense: 5,
        keywords: ["taunt", "soulchain"],
        text: "Taunt. Soulchain: Summon a 1/1 Shade when this dies.",
        flavor: "In death, he found his true purpose."
    },
    
    eternal_executioner: {
        name: "Eternal Executioner",
        type: "Creature",
        tribe: "Undead",
        cost: 6,
        hpCost: 0,
        attack: 4,
        defense: 4,
        keywords: ["deathstrike", "reassemble"],
        text: "Deathstrike. Reassemble: If this died, resummon it at end of turn with 1 HP.",
        flavor: "He exists only to end others."
    },
    
    bone_colossus: {
        name: "Bone Colossus",
        type: "Creature",
        tribe: "Undead",
        cost: 8,
        hpCost: 0,
        attack: 6,
        defense: 8,
        keywords: ["taunt", "haunt"],
        text: "Taunt. Haunt: Summon two 2/2 Skeletons with Taunt.",
        flavor: "An army compressed into one.",
        hauntEffect: { type: "summon_token", token: "skeleton", count: 2 }
    },
    
    // ========================================================================
    // DEMON CREATURES (10)
    // ========================================================================
    
    shadow_imp: {
        name: "Shadow Imp",
        type: "Creature",
        tribe: "Demon",
        cost: 1,
        hpCost: 2,
        attack: 3,
        defense: 2,
        keywords: [],
        text: "Costs 2 HP to play.",
        flavor: "A small price for sharp claws."
    },
    
    flame_fiend: {
        name: "Flame Fiend",
        type: "Creature",
        tribe: "Demon",
        cost: 2,
        hpCost: 0,
        attack: 3,
        defense: 2,
        keywords: ["torment"],
        text: "Torment (1): At start of your turn, take 1 damage.",
        flavor: "Its flames burn friend and foe alike.",
        tormentDamage: 1
    },
    
    blood_cultist: {
        name: "Blood Cultist",
        type: "Creature",
        tribe: "Demon",
        cost: 2,
        hpCost: 0,
        attack: 2,
        defense: 3,
        keywords: ["battlecry"],
        text: "Battlecry: Deal 2 damage to your hero. Draw a card.",
        flavor: "Knowledge paid in blood.",
        battlecryEffect: { type: "self_damage_draw", damage: 2, draw: 1 }
    },
    
    reckless_destroyer: {
        name: "Reckless Destroyer",
        type: "Creature",
        tribe: "Demon",
        cost: 3,
        hpCost: 0,
        attack: 5,
        defense: 3,
        keywords: ["rush", "doom"],
        text: "Rush. Doom: Deal 2 damage to your hero when this dies.",
        flavor: "Born to destroy. Fated to fall.",
        doomDamage: 2
    },
    
    soul_glutton: {
        name: "Soul Glutton",
        type: "Creature",
        tribe: "Demon",
        cost: 4,
        hpCost: 0,
        attack: 3,
        defense: 3,
        keywords: ["consume"],
        text: "Battlecry: Destroy a friendly creature. Gain its Attack and Defense.",
        flavor: "It eats its own to grow stronger.",
        battlecryEffect: { type: "consume" }
    },
    
    hellfire_herald: {
        name: "Hellfire Herald",
        type: "Creature",
        tribe: "Demon",
        cost: 4,
        hpCost: 3,
        attack: 5,
        defense: 5,
        keywords: [],
        text: "Costs 3 HP to play.",
        flavor: "Pain is the currency of power."
    },
    
    pit_lord: {
        name: "Pit Lord",
        type: "Creature",
        tribe: "Demon",
        cost: 5,
        hpCost: 0,
        attack: 6,
        defense: 6,
        keywords: ["offering"],
        text: "Offering: Sacrifice a creature or take 4 damage.",
        flavor: "The pit demands tribute.",
        offeringDamage: 4
    },
    
    tormented_behemoth: {
        name: "Tormented Behemoth",
        type: "Creature",
        tribe: "Demon",
        cost: 5,
        hpCost: 0,
        attack: 7,
        defense: 5,
        keywords: ["torment"],
        text: "Torment (2): At start of your turn, take 2 damage.",
        flavor: "Its agony fuels its rage.",
        tormentDamage: 2
    },
    
    doom_bringer: {
        name: "Doom Bringer",
        type: "Creature",
        tribe: "Demon",
        cost: 6,
        hpCost: 0,
        attack: 8,
        defense: 6,
        keywords: ["doom"],
        text: "Doom: Deal 4 damage to your hero when this dies.",
        flavor: "Your death is only postponed.",
        doomDamage: 4
    },
    
    abyssal_overlord: {
        name: "Abyssal Overlord",
        type: "Creature",
        tribe: "Demon",
        cost: 8,
        hpCost: 5,
        attack: 10,
        defense: 10,
        keywords: ["rush"],
        text: "Rush. Costs 5 HP to play.",
        flavor: "From the deepest pit, absolute power rises."
    },
    
    // ========================================================================
    // VAMPIRE CREATURES (10)
    // ========================================================================
    
    blood_thrall: {
        name: "Blood Thrall",
        type: "Creature",
        tribe: "Vampire",
        cost: 1,
        hpCost: 0,
        attack: 1,
        defense: 2,
        keywords: ["drain"],
        text: "Drain",
        flavor: "Bound by blood, it serves eternally."
    },
    
    thirsting_shade: {
        name: "Thirsting Shade",
        type: "Creature",
        tribe: "Vampire",
        cost: 2,
        hpCost: 0,
        attack: 2,
        defense: 2,
        keywords: ["stealth", "drain"],
        text: "Stealth. Drain.",
        flavor: "You won't see it until you feel the bite."
    },
    
    nightstalker: {
        name: "Nightstalker",
        type: "Creature",
        tribe: "Vampire",
        cost: 2,
        hpCost: 0,
        attack: 3,
        defense: 2,
        keywords: ["bloodScent"],
        text: "Blood Scent: Can attack Stealthed creatures.",
        flavor: "No shadow hides the scent of blood."
    },
    
    sanguine_priest: {
        name: "Sanguine Priest",
        type: "Creature",
        tribe: "Vampire",
        cost: 3,
        hpCost: 0,
        attack: 2,
        defense: 4,
        keywords: [],
        text: "When you heal, deal that much damage to the enemy hero.",
        flavor: "Your suffering is our sacrament."
    },
    
    crimson_hunter: {
        name: "Crimson Hunter",
        type: "Creature",
        tribe: "Vampire",
        cost: 3,
        hpCost: 0,
        attack: 3,
        defense: 3,
        keywords: ["drain", "nightfall"],
        text: "Drain. Nightfall: +2 Attack while enemy below 15 HP.",
        flavor: "The weaker they grow, the stronger he becomes."
    },
    
    blood_knight: {
        name: "Blood Knight",
        type: "Creature",
        tribe: "Vampire",
        cost: 4,
        hpCost: 0,
        attack: 4,
        defense: 4,
        keywords: ["drain"],
        text: "Drain",
        flavor: "His blade drinks deep."
    },
    
    soul_drinker: {
        name: "Soul Drinker",
        type: "Creature",
        tribe: "Vampire",
        cost: 4,
        hpCost: 0,
        attack: 2,
        defense: 5,
        keywords: ["siphon"],
        text: "Siphon: Steal 1/1 from any creature this attacks.",
        flavor: "Each victim makes it stronger."
    },
    
    bloodlord_vasara: {
        name: "Bloodlord Vasara",
        type: "Creature",
        tribe: "Vampire",
        cost: 5,
        hpCost: 0,
        attack: 4,
        defense: 5,
        keywords: ["drain", "battlecry"],
        text: "Drain. Battlecry: Give all friendly Vampires +1/+1.",
        flavor: "The blood of the covenant runs thick.",
        battlecryEffect: { type: "buff_tribe", tribe: "Vampire", attack: 1, defense: 1 }
    },
    
    crimson_countess: {
        name: "Crimson Countess",
        type: "Creature",
        tribe: "Vampire",
        cost: 6,
        hpCost: 0,
        attack: 4,
        defense: 6,
        keywords: ["drain", "battlecry"],
        text: "Drain. Battlecry: Deal 3 damage to all enemy creatures.",
        flavor: "She arrives with thunder; they leave in silence.",
        battlecryEffect: { type: "damage_all_enemies", amount: 3 }
    },
    
    vampire_lord: {
        name: "Vampire Lord",
        type: "Creature",
        tribe: "Vampire",
        cost: 7,
        hpCost: 0,
        attack: 6,
        defense: 7,
        keywords: ["drain", "nightfall"],
        text: "Drain. Nightfall: +2 Attack and this has Rush.",
        flavor: "Ancient. Patient. Inevitable."
    },
    
    // ========================================================================
    // BEAST CREATURES (10)
    // ========================================================================
    
    carrion_rat: {
        name: "Carrion Rat",
        type: "Creature",
        tribe: "Beast",
        cost: 1,
        hpCost: 0,
        attack: 2,
        defense: 1,
        keywords: ["rush"],
        text: "Rush",
        flavor: "Where there's death, rats follow."
    },
    
    feral_hound: {
        name: "Feral Hound",
        type: "Creature",
        tribe: "Beast",
        cost: 1,
        hpCost: 0,
        attack: 1,
        defense: 2,
        keywords: ["packHunter"],
        text: "Pack Hunter: +1/+1 for each other Beast you control.",
        flavor: "Alone it's a nuisance. In a pack, it's death."
    },
    
    grave_hound: {
        name: "Grave Hound",
        type: "Creature",
        tribe: "Beast",
        cost: 2,
        hpCost: 0,
        attack: 2,
        defense: 3,
        keywords: [],
        text: "",
        flavor: "It smells death before it arrives."
    },
    
    swarm_of_bats: {
        name: "Swarm of Bats",
        type: "Creature",
        tribe: "Beast",
        cost: 2,
        hpCost: 0,
        attack: 1,
        defense: 1,
        keywords: ["rush", "battlecry"],
        text: "Rush. Battlecry: Summon two 1/1 Bat copies with Rush.",
        flavor: "The darkness spreads its wings.",
        battlecryEffect: { type: "summon_copies", count: 2 }
    },
    
    dire_wolf: {
        name: "Dire Wolf",
        type: "Creature",
        tribe: "Beast",
        cost: 3,
        hpCost: 0,
        attack: 2,
        defense: 3,
        keywords: ["packHunter"],
        text: "Pack Hunter: +1/+1 for each other Beast you control.",
        flavor: "The alpha's howl commands the pack."
    },
    
    rabid_werewolf: {
        name: "Rabid Werewolf",
        type: "Creature",
        tribe: "Beast",
        cost: 3,
        hpCost: 0,
        attack: 4,
        defense: 2,
        keywords: ["rush", "frenzy"],
        text: "Rush. Frenzy: Gain +2 Attack.",
        flavor: "Pain only makes it angrier.",
        frenzyEffect: { type: "buff_self", attack: 2, defense: 0 }
    },
    
    hunting_horror: {
        name: "Hunting Horror",
        type: "Creature",
        tribe: "Beast",
        cost: 4,
        hpCost: 0,
        attack: 4,
        defense: 3,
        keywords: ["rush", "rampage"],
        text: "Rush. Rampage: Gains +1 Attack after killing a creature.",
        flavor: "Its hunger grows with each kill."
    },
    
    packmother: {
        name: "Packmother",
        type: "Creature",
        tribe: "Beast",
        cost: 5,
        hpCost: 0,
        attack: 3,
        defense: 5,
        keywords: ["battlecry"],
        text: "Battlecry: Give all friendly Beasts +1 Attack and Rush.",
        flavor: "She leads the hunt. They follow.",
        battlecryEffect: { type: "buff_tribe_rush", tribe: "Beast", attack: 1 }
    },
    
    alpha_predator: {
        name: "Alpha Predator",
        type: "Creature",
        tribe: "Beast",
        cost: 6,
        hpCost: 0,
        attack: 5,
        defense: 5,
        keywords: ["feral"],
        text: "Feral: Can attack twice per turn.",
        flavor: "One kill is never enough."
    },
    
    nightmare_beast: {
        name: "Nightmare Beast",
        type: "Creature",
        tribe: "Beast",
        cost: 7,
        hpCost: 0,
        attack: 7,
        defense: 6,
        keywords: ["rush", "packHunter"],
        text: "Rush. Pack Hunter: +1/+1 for each other Beast you control.",
        flavor: "When it arrives, the hunt is over."
    },
    
    // ========================================================================
    // SPIRIT CREATURES (10)
    // ========================================================================
    
    wisp: {
        name: "Wisp",
        type: "Creature",
        tribe: "Spirit",
        cost: 1,
        hpCost: 0,
        attack: 1,
        defense: 1,
        keywords: ["elusive", "haunt"],
        text: "Elusive. Haunt: Draw a card.",
        flavor: "A fleeting thought given form.",
        hauntEffect: { type: "draw", count: 1 }
    },
    
    flickering_phantom: {
        name: "Flickering Phantom",
        type: "Creature",
        tribe: "Spirit",
        cost: 2,
        hpCost: 0,
        attack: 2,
        defense: 2,
        keywords: ["phase"],
        text: "Phase: 50% chance to avoid attacks.",
        flavor: "Now you see it. Now you don't."
    },
    
    tormented_soul: {
        name: "Tormented Soul",
        type: "Creature",
        tribe: "Spirit",
        cost: 2,
        hpCost: 0,
        attack: 2,
        defense: 2,
        keywords: ["haunt"],
        text: "Haunt: Deal 2 damage to the enemy hero.",
        flavor: "Its pain becomes yours.",
        hauntEffect: { type: "damage_enemy_hero", amount: 2 }
    },
    
    wailing_specter: {
        name: "Wailing Specter",
        type: "Creature",
        tribe: "Spirit",
        cost: 3,
        hpCost: 0,
        attack: 2,
        defense: 3,
        keywords: ["elusive"],
        text: "Elusive",
        flavor: "Its screams pierce the veil between worlds."
    },
    
    haunting_wraith: {
        name: "Haunting Wraith",
        type: "Creature",
        tribe: "Spirit",
        cost: 3,
        hpCost: 0,
        attack: 3,
        defense: 2,
        keywords: ["stealth", "haunt"],
        text: "Stealth. Haunt: Give an enemy creature -2/-2.",
        flavor: "It weakens the living as it passes.",
        hauntEffect: { type: "debuff_enemy", attack: -2, defense: -2 }
    },
    
    phantom_knight: {
        name: "Phantom Knight",
        type: "Creature",
        tribe: "Spirit",
        cost: 4,
        hpCost: 0,
        attack: 3,
        defense: 4,
        keywords: ["elusive"],
        text: "Elusive",
        flavor: "Death did not end his oath."
    },
    
    lingering_horror: {
        name: "Lingering Horror",
        type: "Creature",
        tribe: "Spirit",
        cost: 4,
        hpCost: 0,
        attack: 3,
        defense: 3,
        keywords: ["possess"],
        text: "Possess: When this dies, take control of a random enemy creature with 2 or less Attack.",
        flavor: "It doesn't die. It moves."
    },
    
    void_specter: {
        name: "Void Specter",
        type: "Creature",
        tribe: "Spirit",
        cost: 5,
        hpCost: 0,
        attack: 4,
        defense: 4,
        keywords: ["elusive", "incorporeal"],
        text: "Elusive. Incorporeal: Takes 1 less damage (min 1).",
        flavor: "Neither spell nor blade finds purchase."
    },
    
    banshee: {
        name: "Banshee",
        type: "Creature",
        tribe: "Spirit",
        cost: 5,
        hpCost: 0,
        attack: 4,
        defense: 3,
        keywords: ["haunt"],
        text: "Haunt: Deal 2 damage to ALL enemy creatures.",
        flavor: "Her death cry destroys all who hear it.",
        hauntEffect: { type: "damage_all_enemies", amount: 2 }
    },
    
    dread_phantom: {
        name: "Dread Phantom",
        type: "Creature",
        tribe: "Spirit",
        cost: 7,
        hpCost: 0,
        attack: 5,
        defense: 6,
        keywords: ["elusive", "haunt"],
        text: "Elusive. Haunt: Destroy a random enemy creature.",
        flavor: "Even in death, it claims another.",
        hauntEffect: { type: "destroy_random_enemy" }
    },
    
    // ========================================================================
    // CULTIST CREATURES (10)
    // ========================================================================
    
    willing_sacrifice: {
        name: "Willing Sacrifice",
        type: "Creature",
        tribe: "Cultist",
        cost: 1,
        hpCost: 0,
        attack: 1,
        defense: 1,
        keywords: ["martyr"],
        text: "Martyr: Deal 3 damage to the enemy hero.",
        flavor: "Her death was always the plan.",
        martyrEffect: { type: "damage_enemy_hero", amount: 3 }
    },
    
    fanatic: {
        name: "Fanatic",
        type: "Creature",
        tribe: "Cultist",
        cost: 1,
        hpCost: 0,
        attack: 2,
        defense: 1,
        keywords: ["zealot"],
        text: "Zealot: Deal 2 damage to enemy hero when this dies.",
        flavor: "Even death serves the cause."
    },
    
    dark_acolyte: {
        name: "Dark Acolyte",
        type: "Creature",
        tribe: "Cultist",
        cost: 2,
        hpCost: 0,
        attack: 1,
        defense: 3,
        keywords: ["martyr"],
        text: "Martyr: Draw 2 cards.",
        flavor: "His knowledge was the final offering.",
        martyrEffect: { type: "draw", count: 2 }
    },
    
    blood_ritualist: {
        name: "Blood Ritualist",
        type: "Creature",
        tribe: "Cultist",
        cost: 2,
        hpCost: 0,
        attack: 2,
        defense: 2,
        keywords: ["devoted"],
        text: "Devoted: When another Cultist dies, gain +1/+1.",
        flavor: "Each death makes him stronger."
    },
    
    doom_preacher: {
        name: "Doom Preacher",
        type: "Creature",
        tribe: "Cultist",
        cost: 3,
        hpCost: 0,
        attack: 2,
        defense: 4,
        keywords: [],
        text: "Your Martyr effects trigger twice.",
        flavor: "One death is never enough for the dark gods."
    },
    
    frenzied_zealot: {
        name: "Frenzied Zealot",
        type: "Creature",
        tribe: "Cultist",
        cost: 3,
        hpCost: 0,
        attack: 3,
        defense: 3,
        keywords: ["zealot", "rush"],
        text: "Rush. Zealot: Deal 2 damage to enemy hero when this dies.",
        flavor: "He ran screaming into the enemy lines."
    },
    
    ritual_master: {
        name: "Ritual Master",
        type: "Creature",
        tribe: "Cultist",
        cost: 4,
        hpCost: 0,
        attack: 3,
        defense: 4,
        keywords: ["battlecry"],
        text: "Battlecry: Sacrifice a friendly creature. Deal damage equal to its Attack to any target.",
        flavor: "The ritual requires blood. Preferably not his own.",
        battlecryEffect: { type: "sacrifice_deal_damage" }
    },
    
    blood_oracle: {
        name: "Blood Oracle",
        type: "Creature",
        tribe: "Cultist",
        cost: 4,
        hpCost: 0,
        attack: 2,
        defense: 5,
        keywords: ["darkPrayer"],
        text: "Dark Prayer: At end of turn, if you have 3+ Cultists, draw a card.",
        flavor: "The whispers reveal all."
    },
    
    high_priestess: {
        name: "High Priestess",
        type: "Creature",
        tribe: "Cultist",
        cost: 5,
        hpCost: 0,
        attack: 3,
        defense: 5,
        keywords: ["martyr"],
        text: "Martyr: Summon three 1/1 Cultists.",
        flavor: "In death, she births an army.",
        martyrEffect: { type: "summon_token", token: "cultist", count: 3 }
    },
    
    doomsayer: {
        name: "Doomsayer",
        type: "Creature",
        tribe: "Cultist",
        cost: 6,
        hpCost: 0,
        attack: 5,
        defense: 5,
        keywords: ["battlecry"],
        text: "Battlecry: Sacrifice all other friendly creatures. Gain +2/+2 for each.",
        flavor: "The end comes. He alone will witness it.",
        battlecryEffect: { type: "consume_all" }
    },
    
    // ========================================================================
    // DEATH SPELLS (8)
    // ========================================================================
    
    grasp_of_the_grave: {
        name: "Grasp of the Grave",
        type: "Spell",
        school: "Death",
        cost: 1,
        hpCost: 0,
        text: "Deal 2 damage to a creature. If it dies, summon a 1/1 Shade.",
        flavor: "The grave always claims its due."
    },
    
    soul_harvest: {
        name: "Soul Harvest",
        type: "Spell",
        school: "Death",
        cost: 2,
        hpCost: 0,
        text: "Draw a card for each creature that died this turn.",
        flavor: "Every death feeds the darkness."
    },
    
    raise_dead: {
        name: "Raise Dead",
        type: "Spell",
        school: "Death",
        cost: 3,
        hpCost: 0,
        text: "Return a creature from your graveyard to your hand. If it's Undead, it costs 2 less.",
        flavor: "Death is merely an inconvenience."
    },
    
    corpse_explosion: {
        name: "Corpse Explosion",
        type: "Spell",
        school: "Death",
        cost: 3,
        hpCost: 0,
        text: "Destroy a friendly creature. Deal its Attack as damage to all enemy creatures.",
        flavor: "In death, they serve one final purpose."
    },
    
    deaths_embrace: {
        name: "Death's Embrace",
        type: "Spell",
        school: "Death",
        cost: 4,
        hpCost: 0,
        text: "Destroy a creature. If it had 4 or less Attack, summon a copy of it for yourself.",
        flavor: "Why destroy what you can claim?"
    },
    
    mass_resurrection: {
        name: "Mass Resurrection",
        type: "Spell",
        school: "Death",
        cost: 6,
        hpCost: 0,
        text: "Summon three random creatures from your graveyard. They have 1 Defense.",
        flavor: "The dead rise. All of them."
    },
    
    army_of_the_damned: {
        name: "Army of the Damned",
        type: "Spell",
        school: "Death",
        cost: 7,
        hpCost: 0,
        text: "Summon a 2/2 Skeleton with Taunt for each creature in your graveyard.",
        flavor: "An army that grows with every battle."
    },
    
    consume_soul: {
        name: "Consume Soul",
        type: "Spell",
        school: "Death",
        cost: 2,
        hpCost: 0,
        text: "Destroy a friendly creature. Gain mana equal to its cost this turn only.",
        flavor: "A soul is just another resource."
    },
    
    // ========================================================================
    // BLOOD SPELLS (8)
    // ========================================================================
    
    blood_tithe: {
        name: "Blood Tithe",
        type: "Spell",
        school: "Blood",
        cost: 1,
        hpCost: 2,
        text: "Deal 3 damage to a creature.",
        flavor: "Pain is the purest currency."
    },
    
    sanguine_pact: {
        name: "Sanguine Pact",
        type: "Spell",
        school: "Blood",
        cost: 2,
        hpCost: 0,
        text: "Deal 3 damage to your hero. Give a creature +3/+3.",
        flavor: "Blood given. Power gained."
    },
    
    drain_life: {
        name: "Drain Life",
        type: "Spell",
        school: "Blood",
        cost: 3,
        hpCost: 0,
        text: "Deal 3 damage to a creature. Heal your hero for 3.",
        flavor: "Your life becomes mine."
    },
    
    blood_frenzy: {
        name: "Blood Frenzy",
        type: "Spell",
        school: "Blood",
        cost: 2,
        hpCost: 0,
        text: "Give a creature +2 Attack and Rush. It dies at end of turn.",
        flavor: "A glorious moment. A final moment."
    },
    
    feast_of_blood: {
        name: "Feast of Blood",
        type: "Spell",
        school: "Blood",
        cost: 4,
        hpCost: 0,
        text: "Give all friendly Vampires +2/+2 and Drain.",
        flavor: "Tonight, we drink deep."
    },
    
    dark_bargain: {
        name: "Dark Bargain",
        type: "Spell",
        school: "Blood",
        cost: 2,
        hpCost: 4,
        text: "Draw 3 cards.",
        flavor: "Knowledge has a price. Always."
    },
    
    hemorrhage: {
        name: "Hemorrhage",
        type: "Spell",
        school: "Blood",
        cost: 3,
        hpCost: 0,
        text: "Deal 2 damage to the enemy hero. If they're below 15 HP, deal 4 instead.",
        flavor: "The wounded bleed faster."
    },
    
    bloodbath: {
        name: "Bloodbath",
        type: "Spell",
        school: "Blood",
        cost: 5,
        hpCost: 3,
        text: "Deal 4 damage to ALL creatures.",
        flavor: "When the blood rains, none are spared."
    },
    
    // ========================================================================
    // SHADOW SPELLS (8)
    // ========================================================================
    
    shadow_strike: {
        name: "Shadow Strike",
        type: "Spell",
        school: "Shadow",
        cost: 1,
        hpCost: 0,
        text: "Deal 3 damage to a creature that hasn't attacked this turn.",
        flavor: "Strike before they see you coming."
    },
    
    fade_to_black: {
        name: "Fade to Black",
        type: "Spell",
        school: "Shadow",
        cost: 2,
        hpCost: 0,
        text: "Give a creature Stealth and +1/+1.",
        flavor: "Disappear into the darkness."
    },
    
    ambush: {
        name: "Ambush",
        type: "Spell",
        school: "Shadow",
        cost: 2,
        hpCost: 0,
        text: "Give a Beast Rush and +2 Attack this turn.",
        flavor: "The prey never sees the predator."
    },
    
    veil_of_shadows: {
        name: "Veil of Shadows",
        type: "Spell",
        school: "Shadow",
        cost: 3,
        hpCost: 0,
        text: "Give all friendly creatures Elusive until your next turn.",
        flavor: "The shadows protect their own."
    },
    
    nightmare_spell: {
        name: "Nightmare",
        type: "Spell",
        school: "Shadow",
        cost: 3,
        hpCost: 0,
        text: "A creature can't attack next turn. Draw a card.",
        flavor: "Sleep brings only terror."
    },
    
    hunting_pack: {
        name: "Hunting Pack",
        type: "Spell",
        school: "Shadow",
        cost: 4,
        hpCost: 0,
        text: "Summon two 2/2 Wolves with Rush.",
        flavor: "They hunt as one."
    },
    
    vanish: {
        name: "Vanish",
        type: "Spell",
        school: "Shadow",
        cost: 4,
        hpCost: 0,
        text: "Return a creature to its owner's hand.",
        flavor: "Gone. As if it never existed."
    },
    
    eclipse: {
        name: "Eclipse",
        type: "Spell",
        school: "Shadow",
        cost: 6,
        hpCost: 0,
        text: "Destroy all creatures without Stealth or Elusive.",
        flavor: "When darkness falls, only shadows survive."
    },
    
    // ========================================================================
    // RITUAL SPELLS (8)
    // ========================================================================
    
    dark_ritual: {
        name: "Dark Ritual",
        type: "Spell",
        school: "Ritual",
        cost: 0,
        hpCost: 0,
        text: "Sacrifice a creature. Gain 2 mana this turn only.",
        flavor: "Blood fuels the ritual."
    },
    
    summon_fiend: {
        name: "Summon Fiend",
        type: "Spell",
        school: "Ritual",
        cost: 2,
        hpCost: 0,
        text: "Sacrifice a creature. Summon a 3/3 Demon.",
        flavor: "Flesh offered. Demon received."
    },
    
    forbidden_rite: {
        name: "Forbidden Rite",
        type: "Spell",
        school: "Ritual",
        cost: 3,
        hpCost: 0,
        text: "Sacrifice two creatures. Draw 3 cards and deal 3 damage to the enemy hero.",
        flavor: "Two souls for power untold."
    },
    
    demonic_transformation: {
        name: "Demonic Transformation",
        type: "Spell",
        school: "Ritual",
        cost: 3,
        hpCost: 0,
        text: "Transform a creature into a 5/5 Demon.",
        flavor: "Embrace the darkness within."
    },
    
    cult_gathering: {
        name: "Cult Gathering",
        type: "Spell",
        school: "Ritual",
        cost: 3,
        hpCost: 0,
        text: "Summon three 1/1 Cultists.",
        flavor: "They come from everywhere. They serve the same god."
    },
    
    infernal_summoning: {
        name: "Infernal Summoning",
        type: "Spell",
        school: "Ritual",
        cost: 5,
        hpCost: 0,
        text: "Sacrifice a creature. Summon a Demon with double its stats.",
        flavor: "The greater the sacrifice, the greater the beast."
    },
    
    mass_sacrifice: {
        name: "Mass Sacrifice",
        type: "Spell",
        school: "Ritual",
        cost: 4,
        hpCost: 0,
        text: "Sacrifice all friendly Cultists. Deal 2 damage to the enemy hero for each.",
        flavor: "Their deaths are the final offering."
    },
    
    demonic_pact: {
        name: "Demonic Pact",
        type: "Pact",
        school: "Ritual",
        cost: 4,
        hpCost: 0,
        text: "Summon two 4/4 Demons with Rush. At start of next turn, sacrifice them and take 4 damage.",
        flavor: "Power now. Payment later."
    },
    
    // ========================================================================
    // AFFLICTION SPELLS (8)
    // ========================================================================
    
    wither: {
        name: "Wither",
        type: "Spell",
        school: "Affliction",
        cost: 1,
        hpCost: 0,
        text: "Give an enemy creature -2/-0.",
        flavor: "Strength fades. Always."
    },
    
    curse_of_weakness: {
        name: "Curse of Weakness",
        type: "Curse",
        school: "Affliction",
        cost: 2,
        hpCost: 0,
        text: "Give an enemy creature -2/-2.",
        flavor: "The curse eats at body and soul."
    },
    
    creeping_doom: {
        name: "Creeping Doom",
        type: "Curse",
        school: "Affliction",
        cost: 2,
        hpCost: 0,
        text: "Attach to a creature. At the start of its controller's turn, it takes 2 damage.",
        flavor: "Death comes slowly, but it comes."
    },
    
    soul_leech: {
        name: "Soul Leech",
        type: "Curse",
        school: "Affliction",
        cost: 3,
        hpCost: 0,
        text: "Attach to enemy hero. At start of their turn, they take 2 damage and you heal 2.",
        flavor: "A bond that only death can break."
    },
    
    enfeeble: {
        name: "Enfeeble",
        type: "Spell",
        school: "Affliction",
        cost: 3,
        hpCost: 0,
        text: "Give all enemy creatures -2 Attack this turn.",
        flavor: "Their arms grow heavy. Their weapons, heavier."
    },
    
    mind_rot: {
        name: "Mind Rot",
        type: "Spell",
        school: "Affliction",
        cost: 3,
        hpCost: 0,
        text: "Your opponent discards 2 random cards.",
        flavor: "What was I thinking? I can't remember..."
    },
    
    plague: {
        name: "Plague",
        type: "Spell",
        school: "Affliction",
        cost: 4,
        hpCost: 0,
        text: "Give all enemy creatures -1/-1.",
        flavor: "It spreads. It always spreads."
    },
    
    mark_of_doom: {
        name: "Mark of Doom",
        type: "Curse",
        school: "Affliction",
        cost: 5,
        hpCost: 0,
        text: "Destroy a creature at the end of its controller's next turn.",
        flavor: "The mark appears. Then the end."
    },
    
    // ========================================================================
    // GENERIC SPELLS (6)
    // ========================================================================
    
    dark_insight: {
        name: "Dark Insight",
        type: "Spell",
        school: "Generic",
        cost: 2,
        hpCost: 0,
        text: "Draw 2 cards.",
        flavor: "Knowledge from beyond the veil."
    },
    
    soul_rend: {
        name: "Soul Rend",
        type: "Spell",
        school: "Generic",
        cost: 3,
        hpCost: 0,
        text: "Destroy a creature with 3 or less Attack.",
        flavor: "The weak are easily broken."
    },
    
    execute: {
        name: "Execute",
        type: "Spell",
        school: "Generic",
        cost: 2,
        hpCost: 0,
        text: "Destroy a damaged creature.",
        flavor: "Finish what was started."
    },
    
    dark_bolt: {
        name: "Dark Bolt",
        type: "Spell",
        school: "Generic",
        cost: 2,
        hpCost: 0,
        text: "Deal 3 damage to any target.",
        flavor: "Pure darkness, given form."
    },
    
    obliterate: {
        name: "Obliterate",
        type: "Spell",
        school: "Generic",
        cost: 5,
        hpCost: 0,
        text: "Destroy a creature.",
        flavor: "Nothing remains."
    },
    
    annihilate: {
        name: "Annihilate",
        type: "Spell",
        school: "Generic",
        cost: 8,
        hpCost: 0,
        text: "Destroy all creatures.",
        flavor: "Start again. From nothing."
    }
};

// ============================================================================
// CARD CREATION FUNCTIONS
// ============================================================================

/**
 * Create a card instance from the database
 */
function createCard(cardId) {
    const template = CARD_DATABASE[cardId];
    if (!template) {
        console.error(`Card not found: ${cardId}`);
        return null;
    }
    
    return {
        id: cardId,
        instanceId: `${cardId}_${++instanceCounter}`,
        name: template.name,
        type: template.type,
        tribe: template.tribe || null,
        cost: template.cost,
        hpCost: template.hpCost || 0,
        attack: template.attack,
        defense: template.defense,
        currentAttack: template.attack,
        currentDefense: template.defense,
        keywords: [...(template.keywords || [])],
        text: template.text || "",
        flavor: template.flavor || "",
        canAttack: false,
        hasAttacked: false,
        isTapped: false,
        isToken: false,
        // Copy special effect data
        hauntEffect: template.hauntEffect || null,
        battlecryEffect: template.battlecryEffect || null,
        tormentDamage: template.tormentDamage || 0,
        doomDamage: template.doomDamage || 0,
        offeringDamage: template.offeringDamage || 0,
        // Tracking flags
        undyingTriggered: false,
        frenzyTriggered: false
    };
}

/**
 * Create a token instance
 */
function createToken(tokenId) {
    const template = TOKENS[tokenId];
    if (!template) {
        console.error(`Token not found: ${tokenId}`);
        return null;
    }
    
    return {
        id: tokenId,
        instanceId: `${tokenId}_${++instanceCounter}`,
        name: template.name,
        type: template.type,
        tribe: template.tribe || null,
        cost: template.cost,
        hpCost: 0,
        attack: template.attack,
        defense: template.defense,
        currentAttack: template.attack,
        currentDefense: template.defense,
        keywords: [...(template.keywords || [])],
        text: template.text || "",
        flavor: template.flavor || "",
        canAttack: false,
        hasAttacked: false,
        isTapped: false,
        isToken: true,
        undyingTriggered: false,
        frenzyTriggered: false
    };
}

/**
 * Check if a card has a specific keyword
 */
function hasKeyword(card, keyword) {
    return card.keywords && card.keywords.includes(keyword);
}

/**
 * Get all cards of a specific tribe
 */
function getCardsByTribe(tribe) {
    return Object.entries(CARD_DATABASE)
        .filter(([id, card]) => card.tribe === tribe)
        .map(([id, card]) => id);
}

/**
 * Get all cards of a specific type
 */
function getCardsByType(type) {
    return Object.entries(CARD_DATABASE)
        .filter(([id, card]) => card.type === type)
        .map(([id, card]) => id);
}

/**
 * Get all spells of a specific school
 */
function getCardsBySchool(school) {
    return Object.entries(CARD_DATABASE)
        .filter(([id, card]) => card.school === school)
        .map(([id, card]) => id);
}

/**
 * Get all magic schools in the game
 */
function getAllSchools() {
    return ["Death", "Blood", "Shadow", "Ritual", "Affliction", "Generic"];
}

// ============================================================================
// DECK BUILDING
// ============================================================================

/**
 * Build a starter deck with all available cards (2 copies each)
 */
function buildStarterDeck() {
    const deck = [];
    const cardIds = Object.keys(CARD_DATABASE);
    
    // Add 2 copies of each card
    for (const cardId of cardIds) {
        deck.push(createCard(cardId));
        deck.push(createCard(cardId));
    }
    
    // Shuffle using Fisher-Yates
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
}

/**
 * Build a tribal deck (only cards from specified tribes)
 */
function buildTribalDeck(tribes, copies = 2) {
    const deck = [];
    
    for (const tribe of tribes) {
        const cardIds = getCardsByTribe(tribe);
        for (const cardId of cardIds) {
            for (let i = 0; i < copies; i++) {
                deck.push(createCard(cardId));
            }
        }
    }
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get formatted cost string (includes HP cost if any)
 */
function getFormattedCost(card) {
    if (card.hpCost > 0) {
        return `${card.cost}+${card.hpCost}HP`;
    }
    return `${card.cost}`;
}

/**
 * Get list of all tribes in the game
 */
function getAllTribes() {
    return ["Undead", "Demon", "Vampire", "Beast", "Spirit", "Cultist"];
}

/**
 * Get keyword tooltip text
 */
function getKeywordTooltip(keyword) {
    const kw = KEYWORDS[keyword];
    return kw ? `${kw.name}: ${kw.description}` : keyword;
}

// ============================================================================
// DEBUG / INFO
// ============================================================================

console.log("Cards.js loaded");
console.log(`Total cards in database: ${Object.keys(CARD_DATABASE).length}`);
console.log(`Total tokens: ${Object.keys(TOKENS).length}`);
console.log(`Tribes available: ${getAllTribes().join(", ")}`);
console.log(`Magic schools: ${getAllSchools().join(", ")}`);

// List creatures by tribe
console.log("\nCreatures by tribe:");
for (const tribe of getAllTribes()) {
    const cards = getCardsByTribe(tribe);
    if (cards.length > 0) {
        console.log(`  ${tribe}: ${cards.length} cards`);
    }
}

// List spells by school
console.log("\nSpells by school:");
for (const school of getAllSchools()) {
    const cards = getCardsBySchool(school);
    if (cards.length > 0) {
        console.log(`  ${school}: ${cards.length} cards`);
    }
}

// List by type
console.log("\nCards by type:");
for (const type of ["Creature", "Spell", "Curse", "Pact", "Relic"]) {
    const cards = getCardsByType(type);
    if (cards.length > 0) {
        console.log(`  ${type}: ${cards.length} cards`);
    }
}
