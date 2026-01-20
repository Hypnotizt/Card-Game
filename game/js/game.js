// ============================================================================
// GRIMDARK TCG - Game Engine v2.0
// With full spell mechanics, keywords, and deck builder support
// ============================================================================

// Constants
const STARTING_HEALTH = 30;
const STARTING_HAND = 4;
const MAX_HAND = 10;
const MAX_BOARD = 7;
const MANA_CAP = 10;

// Global deck storage
let playerDeck = null;

// Game State
const game = {
    player: null,
    enemy: null,
    currentTurn: null,
    turnNumber: 0,
    gameOver: false,
    winner: null,
    log: [],
    
    // Turn tracking
    creaturesDeadThisTurn: 0,
    
    // Selection & targeting
    selectedCard: null,
    selectionType: null,
    pendingSpell: null,
    
    // Drag state
    dragging: null,
    dragType: null,
    dragElement: null,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragOriginElement: null
};

// ============================================================================
// PLAYER
// ============================================================================

function createPlayer(name, isAI = false) {
    return {
        name,
        isAI,
        health: STARTING_HEALTH,
        maxHealth: STARTING_HEALTH,
        mana: 0,
        maxMana: 0,
        deck: [],
        hand: [],
        board: [],
        graveyard: [],
        fatigue: 0,
        curses: []
    };
}

function getOpponent(player) {
    return player === game.player ? game.enemy : game.player;
}

// ============================================================================
// GAME SETUP
// ============================================================================

function startGame() {
    game.player = createPlayer("You", false);
    game.enemy = createPlayer("Enemy", true);
    
    // Use custom deck or starter deck
    if (playerDeck && playerDeck.length > 0) {
        game.player.deck = playerDeck.map(id => createCard(id)).filter(c => c);
        shuffle(game.player.deck);
    } else {
        game.player.deck = buildStarterDeck();
    }
    game.enemy.deck = buildStarterDeck();
    
    // Draw starting hands
    for (let i = 0; i < STARTING_HAND; i++) {
        drawCard(game.player);
        drawCard(game.enemy);
    }
    
    // Reset state
    game.turnNumber = 0;
    game.gameOver = false;
    game.winner = null;
    game.log = [];
    game.creaturesDeadThisTurn = 0;
    clearSelection();
    
    game.currentTurn = game.player;
    startTurn();
    
    showScreen('game-screen');
    render();
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function showScreen(id) {
    ['menu-screen', 'game-screen', 'deckbuilder-screen'].forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.toggle('hidden', s !== id);
    });
    document.getElementById('game-over')?.classList.add('hidden');
}

// ============================================================================
// TURN MANAGEMENT
// ============================================================================

function startTurn() {
    game.turnNumber++;
    const player = game.currentTurn;
    game.creaturesDeadThisTurn = 0;
    
    // Start of turn effects
    processTorment(player);
    processCurses(player);
    
    // Gain mana
    if (player.maxMana < MANA_CAP) player.maxMana++;
    player.mana = player.maxMana;
    
    // Draw
    drawCard(player);
    
    // Refresh creatures
    for (const c of player.board) {
        c.canAttack = hasKeyword(c, 'rush') ? true : !c.summonedThisTurn;
        c.summonedThisTurn = false;
        c.hasAttacked = false;
        c.attacksThisTurn = 0;
    }
    
    addLog(`--- Turn ${game.turnNumber}: ${player.name} ---`);
    render();
    
    if (player.isAI && !game.gameOver) {
        setTimeout(doAITurn, 800);
    }
}

function endTurn() {
    if (game.gameOver || game.currentTurn !== game.player) return;
    
    processEndOfTurn(game.player);
    game.currentTurn = game.enemy;
    clearSelection();
    cancelDrag();
    startTurn();
}

function processTorment(player) {
    for (const c of player.board) {
        if (c.tormentDamage) {
            player.health -= c.tormentDamage;
            addLog(`${c.name} torments for ${c.tormentDamage}`);
        }
    }
    checkGameOver();
}

function processCurses(player) {
    // Hero curses
    for (const curse of [...player.curses]) {
        if (curse.id === 'soul_leech') {
            player.health -= 2;
            getOpponent(player).health = Math.min(getOpponent(player).maxHealth, getOpponent(player).health + 2);
            addLog(`Soul Leech drains 2`);
        }
    }
    
    // Creature curses
    for (const c of [...player.board]) {
        if (c.curses) {
            for (const curse of [...c.curses]) {
                if (curse.type === 'creeping_doom') {
                    c.currentDefense -= 2;
                    addLog(`Creeping Doom hits ${c.name}`);
                }
                if (curse.type === 'mark_of_doom') {
                    curse.turns--;
                    if (curse.turns <= 0) {
                        destroyCreature(player, c);
                        addLog(`Mark of Doom destroys ${c.name}`);
                    }
                }
            }
        }
    }
    removeDeadCreatures(player);
    checkGameOver();
}

function processEndOfTurn(player) {
    // Dark Prayer
    const cultists = player.board.filter(c => c.tribe === 'Cultist').length;
    if (player.board.some(c => hasKeyword(c, 'darkPrayer')) && cultists >= 3) {
        drawCard(player);
        addLog(`Dark Prayer draws a card`);
    }
    
    // Blood Frenzy deaths
    for (const c of [...player.board]) {
        if (c.diesEndOfTurn) {
            destroyCreature(player, c, true);
            addLog(`${c.name} dies from Blood Frenzy`);
        }
    }
}

// ============================================================================
// CARD DRAWING
// ============================================================================

function drawCard(player) {
    if (player.deck.length === 0) {
        player.fatigue++;
        player.health -= player.fatigue;
        addLog(`${player.name} takes ${player.fatigue} fatigue`);
        checkGameOver();
        return null;
    }
    if (player.hand.length >= MAX_HAND) {
        const burned = player.deck.pop();
        addLog(`${burned.name} burned (hand full)`);
        return null;
    }
    const card = player.deck.pop();
    player.hand.push(card);
    return card;
}

// ============================================================================
// PLAYING CARDS
// ============================================================================

function canPlayCard(player, card) {
    if (card.cost > player.mana) return false;
    if (card.hpCost && card.hpCost >= player.health) return false;
    if (card.type === 'Creature' && player.board.length >= MAX_BOARD) return false;
    return true;
}

function playCard(player, card, position = -1, target = null) {
    if (!canPlayCard(player, card)) return false;
    
    const idx = player.hand.indexOf(card);
    if (idx === -1) return false;
    player.hand.splice(idx, 1);
    
    player.mana -= card.cost;
    if (card.hpCost) {
        player.health -= card.hpCost;
        addLog(`${player.name} pays ${card.hpCost} HP`);
    }
    
    if (card.type === 'Creature') {
        playCreature(player, card, position);
    } else {
        playSpell(player, card, target);
    }
    
    clearSelection();
    render();
    checkGameOver();
    return true;
}

function playCreature(player, card, position) {
    card.currentAttack = card.attack;
    card.currentDefense = card.defense;
    card.canAttack = hasKeyword(card, 'rush');
    card.summonedThisTurn = true;
    card.hasAttacked = false;
    card.attacksThisTurn = 0;
    card.curses = [];
    
    // Grave Strength
    if (hasKeyword(card, 'graveStrength')) {
        const bonus = player.graveyard.filter(c => c.type === 'Creature').length;
        card.currentAttack += bonus;
    }
    
    // Pack Hunter
    if (hasKeyword(card, 'packHunter')) {
        const bonus = player.board.filter(c => c.tribe === 'Beast').length;
        card.currentAttack += bonus;
        card.currentDefense += bonus;
    }
    
    // Nightfall
    if (hasKeyword(card, 'nightfall') && getOpponent(player).health < 15) {
        card.currentAttack += 2;
        if (card.id === 'vampire_lord') card.canAttack = true;
    }
    
    // Place on board
    if (position >= 0 && position <= player.board.length) {
        player.board.splice(position, 0, card);
    } else {
        player.board.push(card);
    }
    
    addLog(`${player.name} plays ${card.name}`);
    
    // Battlecry
    processBattlecry(player, card);
    
    // Update other Pack Hunters
    updatePackHunters(player);
}

function processBattlecry(player, card) {
    const effect = card.battlecryEffect;
    if (!effect) return;
    
    const enemy = getOpponent(player);
    
    switch (effect.type) {
        case 'summon_per_graveyard':
            const count = Math.min(effect.max, player.graveyard.filter(c => c.type === 'Creature').length);
            for (let i = 0; i < count; i++) summonToken(player, effect.token);
            if (count) addLog(`  Summons ${count} ${effect.token}(s)`);
            break;
            
        case 'self_damage_draw':
            player.health -= effect.damage;
            for (let i = 0; i < effect.draw; i++) drawCard(player);
            addLog(`  Takes ${effect.damage}, draws ${effect.draw}`);
            break;
            
        case 'buff_tribe':
            for (const c of player.board) {
                if (c.tribe === effect.tribe && c !== card) {
                    c.currentAttack += effect.attack;
                    c.currentDefense += effect.defense;
                }
            }
            break;
            
        case 'damage_all_enemies':
            for (const c of enemy.board) c.currentDefense -= effect.amount;
            removeDeadCreatures(enemy);
            addLog(`  Deals ${effect.amount} to all enemies`);
            break;
            
        case 'buff_tribe_rush':
            for (const c of player.board) {
                if (c.tribe === effect.tribe && c !== card) {
                    c.currentAttack += effect.attack;
                    c.canAttack = true;
                }
            }
            break;
            
        case 'consume_all':
            let gained = 0;
            for (const c of [...player.board]) {
                if (c !== card) {
                    card.currentAttack += 2;
                    card.currentDefense += 2;
                    destroyCreature(player, c, true);
                    gained++;
                }
            }
            if (gained) addLog(`  Consumes ${gained}, gains +${gained*2}/+${gained*2}`);
            break;
            
        case 'summon_copies':
            for (let i = 0; i < effect.count && player.board.length < MAX_BOARD; i++) {
                const t = createToken('bat');
                t.canAttack = true;
                player.board.push(t);
            }
            addLog(`  Summons ${effect.count} Bats`);
            break;
    }
}

function updatePackHunters(player) {
    const beasts = player.board.filter(c => c.tribe === 'Beast').length;
    for (const c of player.board) {
        if (hasKeyword(c, 'packHunter')) {
            const bonus = beasts - 1;
            c.currentAttack = c.attack + bonus;
            c.currentDefense = c.defense + bonus;
        }
    }
}

// ============================================================================
// SPELL RESOLUTION
// ============================================================================

function playSpell(player, card, target) {
    const enemy = getOpponent(player);
    addLog(`${player.name} casts ${card.name}`);
    
    switch (card.id) {
        // DEATH
        case 'grasp_of_the_grave':
            if (target) {
                target.currentDefense -= 2;
                if (target.currentDefense <= 0) summonToken(player, 'shade');
                removeDeadCreatures(enemy);
                removeDeadCreatures(player);
            }
            break;
        case 'soul_harvest':
            for (let i = 0; i < game.creaturesDeadThisTurn; i++) drawCard(player);
            addLog(`  Draws ${game.creaturesDeadThisTurn}`);
            break;
        case 'raise_dead':
            if (player.graveyard.length) {
                const c = player.graveyard.pop();
                if (c.tribe === 'Undead') c.cost = Math.max(0, c.cost - 2);
                player.hand.push(c);
                addLog(`  Returns ${c.name}`);
            }
            break;
        case 'corpse_explosion':
            if (target && player.board.includes(target)) {
                const dmg = target.currentAttack;
                destroyCreature(player, target, true);
                for (const c of enemy.board) c.currentDefense -= dmg;
                removeDeadCreatures(enemy);
                addLog(`  Deals ${dmg} to all enemies`);
            }
            break;
        case 'deaths_embrace':
            if (target) {
                const owner = findOwner(target);
                if (target.currentAttack <= 4 && player.board.length < MAX_BOARD) {
                    const copy = createCard(target.id);
                    if (copy) {
                        copy.currentDefense = copy.defense;
                        copy.currentAttack = copy.attack;
                        copy.canAttack = false;
                        player.board.push(copy);
                        addLog(`  Copies ${target.name}`);
                    }
                }
                destroyCreature(owner, target);
            }
            break;
        case 'mass_resurrection':
            for (let i = 0; i < 3 && player.graveyard.length && player.board.length < MAX_BOARD; i++) {
                const idx = Math.floor(Math.random() * player.graveyard.length);
                const c = player.graveyard.splice(idx, 1)[0];
                c.currentDefense = 1;
                c.currentAttack = c.attack;
                c.canAttack = false;
                player.board.push(c);
            }
            break;
        case 'army_of_the_damned':
            const graves = player.graveyard.filter(c => c.type === 'Creature').length;
            for (let i = 0; i < graves && player.board.length < MAX_BOARD; i++) {
                summonToken(player, 'skeleton');
            }
            break;
        case 'consume_soul':
            if (target && player.board.includes(target)) {
                player.mana += target.cost;
                destroyCreature(player, target, true);
                addLog(`  Gains ${target.cost} mana`);
            }
            break;
            
        // BLOOD
        case 'blood_tithe':
            if (target) {
                target.currentDefense -= 3;
                removeDeadCreatures(enemy);
                removeDeadCreatures(player);
            }
            break;
        case 'sanguine_pact':
            player.health -= 3;
            if (target) {
                target.currentAttack += 3;
                target.currentDefense += 3;
            }
            break;
        case 'drain_life':
            if (target) {
                target.currentDefense -= 3;
                player.health = Math.min(player.maxHealth, player.health + 3);
                removeDeadCreatures(enemy);
                removeDeadCreatures(player);
            }
            break;
        case 'blood_frenzy':
            if (target) {
                target.currentAttack += 2;
                target.canAttack = true;
                target.diesEndOfTurn = true;
            }
            break;
        case 'feast_of_blood':
            for (const c of player.board.filter(x => x.tribe === 'Vampire')) {
                c.currentAttack += 2;
                c.currentDefense += 2;
                if (!c.keywords.includes('drain')) c.keywords.push('drain');
            }
            break;
        case 'dark_bargain':
            for (let i = 0; i < 3; i++) drawCard(player);
            break;
        case 'hemorrhage':
            const dmg = enemy.health < 15 ? 4 : 2;
            enemy.health -= dmg;
            addLog(`  Deals ${dmg}`);
            break;
        case 'bloodbath':
            for (const c of [...player.board, ...enemy.board]) c.currentDefense -= 4;
            removeDeadCreatures(player);
            removeDeadCreatures(enemy);
            break;
            
        // SHADOW
        case 'shadow_strike':
            if (target && !target.hasAttacked) {
                target.currentDefense -= 3;
                removeDeadCreatures(enemy);
                removeDeadCreatures(player);
            }
            break;
        case 'fade_to_black':
            if (target) {
                target.currentAttack++;
                target.currentDefense++;
                if (!target.keywords.includes('stealth')) target.keywords.push('stealth');
            }
            break;
        case 'ambush':
            if (target && target.tribe === 'Beast') {
                target.currentAttack += 2;
                target.canAttack = true;
            }
            break;
        case 'veil_of_shadows':
            for (const c of player.board) c.elusiveUntilNextTurn = true;
            break;
        case 'nightmare_spell':
            if (target) target.cantAttackNextTurn = true;
            drawCard(player);
            break;
        case 'hunting_pack':
            for (let i = 0; i < 2 && player.board.length < MAX_BOARD; i++) {
                const w = createToken('wolf');
                w.canAttack = true;
                player.board.push(w);
            }
            break;
        case 'vanish':
            if (target) {
                const owner = findOwner(target);
                const idx = owner.board.indexOf(target);
                if (idx !== -1) {
                    owner.board.splice(idx, 1);
                    resetCard(target);
                    owner.hand.push(target);
                    addLog(`  Bounces ${target.name}`);
                }
            }
            break;
        case 'eclipse':
            for (const c of [...player.board, ...enemy.board]) {
                if (!hasKeyword(c, 'stealth') && !hasKeyword(c, 'elusive')) {
                    destroyCreature(findOwner(c), c);
                }
            }
            break;
            
        // RITUAL
        case 'dark_ritual':
            if (target && player.board.includes(target)) {
                destroyCreature(player, target, true);
                player.mana += 2;
                addLog(`  Gains 2 mana`);
            }
            break;
        case 'summon_fiend':
            if (target && player.board.includes(target)) {
                destroyCreature(player, target, true);
                summonToken(player, 'fiend');
            }
            break;
        case 'forbidden_rite':
            let sacced = 0;
            for (const c of [...player.board]) {
                if (sacced >= 2) break;
                destroyCreature(player, c, true);
                sacced++;
            }
            if (sacced >= 2) {
                for (let i = 0; i < 3; i++) drawCard(player);
                enemy.health -= 3;
            }
            break;
        case 'demonic_transformation':
            if (target) {
                const owner = findOwner(target);
                const idx = owner.board.indexOf(target);
                if (idx !== -1) {
                    const demon = createToken('fiend');
                    demon.attack = demon.currentAttack = 5;
                    demon.defense = demon.currentDefense = 5;
                    demon.name = 'Demon';
                    owner.board[idx] = demon;
                }
            }
            break;
        case 'cult_gathering':
            for (let i = 0; i < 3 && player.board.length < MAX_BOARD; i++) {
                summonToken(player, 'cultist');
            }
            break;
        case 'infernal_summoning':
            if (target && player.board.includes(target)) {
                const atk = target.currentAttack * 2;
                const def = target.currentDefense * 2;
                destroyCreature(player, target, true);
                if (player.board.length < MAX_BOARD) {
                    const d = createToken('fiend');
                    d.attack = d.currentAttack = atk;
                    d.defense = d.currentDefense = def;
                    d.name = `${atk}/${def} Demon`;
                    player.board.push(d);
                }
            }
            break;
        case 'mass_sacrifice':
            const cultists = player.board.filter(c => c.tribe === 'Cultist');
            const num = cultists.length;
            for (const c of cultists) destroyCreature(player, c, true);
            enemy.health -= num * 2;
            addLog(`  Deals ${num * 2}`);
            break;
        case 'demonic_pact':
            for (let i = 0; i < 2 && player.board.length < MAX_BOARD; i++) {
                const d = createToken('pact_demon');
                d.canAttack = true;
                d.isPactDemon = true;
                player.board.push(d);
            }
            break;
            
        // AFFLICTION
        case 'wither':
            if (target) target.currentAttack = Math.max(0, target.currentAttack - 2);
            break;
        case 'curse_of_weakness':
            if (target) {
                target.currentAttack = Math.max(0, target.currentAttack - 2);
                target.currentDefense -= 2;
                removeDeadCreatures(enemy);
                removeDeadCreatures(player);
            }
            break;
        case 'creeping_doom':
            if (target) {
                target.curses = target.curses || [];
                target.curses.push({ type: 'creeping_doom' });
            }
            break;
        case 'soul_leech':
            enemy.curses.push({ id: 'soul_leech' });
            break;
        case 'enfeeble':
            for (const c of enemy.board) c.currentAttack = Math.max(0, c.currentAttack - 2);
            break;
        case 'mind_rot':
            for (let i = 0; i < 2 && enemy.hand.length; i++) {
                const idx = Math.floor(Math.random() * enemy.hand.length);
                enemy.hand.splice(idx, 1);
            }
            break;
        case 'plague':
            for (const c of enemy.board) {
                c.currentAttack = Math.max(0, c.currentAttack - 1);
                c.currentDefense--;
            }
            removeDeadCreatures(enemy);
            break;
        case 'mark_of_doom':
            if (target) {
                target.curses = target.curses || [];
                target.curses.push({ type: 'mark_of_doom', turns: 1 });
            }
            break;
            
        // GENERIC
        case 'dark_insight':
            drawCard(player);
            drawCard(player);
            break;
        case 'soul_rend':
            if (target && target.currentAttack <= 3) destroyCreature(findOwner(target), target);
            break;
        case 'execute':
            if (target && target.currentDefense < target.defense) destroyCreature(findOwner(target), target);
            break;
        case 'dark_bolt':
            if (target === 'enemy_hero') enemy.health -= 3;
            else if (target === 'player_hero') player.health -= 3;
            else if (target) {
                target.currentDefense -= 3;
                removeDeadCreatures(enemy);
                removeDeadCreatures(player);
            }
            break;
        case 'obliterate':
            if (target) destroyCreature(findOwner(target), target);
            break;
        case 'annihilate':
            for (const c of [...player.board]) destroyCreature(player, c);
            for (const c of [...enemy.board]) destroyCreature(enemy, c);
            break;
    }
    
    checkGameOver();
}

function findOwner(creature) {
    if (game.player.board.includes(creature)) return game.player;
    if (game.enemy.board.includes(creature)) return game.enemy;
    return null;
}

function resetCard(card) {
    const template = CARD_DATABASE[card.id];
    if (template) {
        card.currentAttack = template.attack;
        card.currentDefense = template.defense;
        card.keywords = [...(template.keywords || [])];
    }
}

function summonToken(player, tokenId) {
    if (player.board.length >= MAX_BOARD) return null;
    const t = createToken(tokenId);
    if (t) {
        t.canAttack = false;
        t.currentAttack = t.attack;
        t.currentDefense = t.defense;
        player.board.push(t);
    }
    return t;
}

function getSpellTargetType(card) {
    const friendly = ['sanguine_pact','blood_frenzy','fade_to_black','ambush','dark_ritual','summon_fiend','corpse_explosion','consume_soul','infernal_summoning'];
    const enemyOnly = ['grasp_of_the_grave','blood_tithe','drain_life','shadow_strike','nightmare_spell','wither','curse_of_weakness','creeping_doom','mark_of_doom'];
    const anyCreature = ['vanish','deaths_embrace','demonic_transformation','soul_rend','execute','obliterate'];
    const anyOrHero = ['dark_bolt'];
    const noTarget = ['soul_harvest','raise_dead','mass_resurrection','army_of_the_damned','feast_of_blood','dark_bargain','hemorrhage','bloodbath','veil_of_shadows','hunting_pack','eclipse','forbidden_rite','cult_gathering','mass_sacrifice','demonic_pact','enfeeble','mind_rot','plague','soul_leech','dark_insight','annihilate'];
    
    if (friendly.includes(card.id)) return 'friendly';
    if (enemyOnly.includes(card.id)) return 'enemy';
    if (anyCreature.includes(card.id)) return 'any';
    if (anyOrHero.includes(card.id)) return 'any_or_hero';
    if (noTarget.includes(card.id)) return 'none';
    return 'none';
}

// ============================================================================
// CREATURE DEATH & TRIGGERS
// ============================================================================

function destroyCreature(owner, creature, isSacrifice = false) {
    const idx = owner.board.indexOf(creature);
    if (idx === -1) return;
    
    owner.board.splice(idx, 1);
    game.creaturesDeadThisTurn++;
    
    // Undying
    if (hasKeyword(creature, 'undying') && !creature.undyingUsed) {
        creature.undyingUsed = true;
        creature.currentDefense = creature.defense;
        creature.currentAttack = creature.attack;
        owner.hand.push(creature);
        addLog(`  ${creature.name} returns to hand (Undying)`);
        return;
    }
    
    processDeathTriggers(owner, creature, isSacrifice);
    owner.graveyard.push(creature);
    addLog(`  ${creature.name} dies`);
}

function processDeathTriggers(owner, creature, isSacrifice) {
    const enemy = getOpponent(owner);
    
    // Soulchain
    if (hasKeyword(creature, 'soulchain')) {
        summonToken(owner, 'shade');
    }
    
    // Haunt
    if (creature.hauntEffect) {
        const e = creature.hauntEffect;
        switch (e.type) {
            case 'damage_enemy_hero':
                enemy.health -= e.amount;
                addLog(`  Haunt deals ${e.amount}`);
                break;
            case 'draw':
                for (let i = 0; i < e.count; i++) drawCard(owner);
                break;
            case 'summon_token':
                for (let i = 0; i < e.count; i++) summonToken(owner, e.token);
                break;
            case 'debuff_enemy':
                if (enemy.board.length) {
                    const t = enemy.board[Math.floor(Math.random() * enemy.board.length)];
                    t.currentAttack = Math.max(0, t.currentAttack + e.attack);
                    t.currentDefense += e.defense;
                }
                break;
            case 'damage_all_enemies':
                for (const c of enemy.board) c.currentDefense -= e.amount;
                removeDeadCreatures(enemy);
                break;
            case 'destroy_random_enemy':
                if (enemy.board.length) {
                    const t = enemy.board[Math.floor(Math.random() * enemy.board.length)];
                    destroyCreature(enemy, t);
                }
                break;
        }
    }
    
    // Doom
    if (creature.doomDamage) {
        owner.health -= creature.doomDamage;
        addLog(`  Doom deals ${creature.doomDamage}`);
    }
    
    // Zealot
    if (hasKeyword(creature, 'zealot')) {
        enemy.health -= 2;
        addLog(`  Zealot deals 2`);
    }
    
    // Martyr (sacrifice only)
    if (isSacrifice && hasKeyword(creature, 'martyr') && creature.martyrEffect) {
        const times = owner.board.some(c => c.id === 'doom_preacher') ? 2 : 1;
        for (let t = 0; t < times; t++) {
            const e = creature.martyrEffect;
            switch (e.type) {
                case 'damage_enemy_hero':
                    enemy.health -= e.amount;
                    addLog(`  Martyr deals ${e.amount}`);
                    break;
                case 'draw':
                    for (let i = 0; i < e.count; i++) drawCard(owner);
                    break;
                case 'summon_token':
                    for (let i = 0; i < e.count; i++) summonToken(owner, e.token);
                    break;
            }
        }
    }
    
    // Devoted
    if (creature.tribe === 'Cultist') {
        for (const c of owner.board) {
            if (hasKeyword(c, 'devoted')) {
                c.currentAttack++;
                c.currentDefense++;
            }
        }
    }
}

function removeDeadCreatures(player) {
    for (const c of [...player.board]) {
        if (c.currentDefense <= 0) destroyCreature(player, c);
    }
}

// ============================================================================
// COMBAT
// ============================================================================

function tryAttack(attacker, target) {
    if (game.gameOver || game.currentTurn !== game.player) return false;
    if (!attacker.canAttack) return false;
    
    const maxAttacks = hasKeyword(attacker, 'feral') ? 2 : 1;
    if (attacker.attacksThisTurn >= maxAttacks) return false;
    
    // Taunt check
    const taunts = game.enemy.board.filter(c => hasKeyword(c, 'taunt'));
    if (taunts.length && (target === null || !hasKeyword(target, 'taunt'))) {
        addLog(`Must attack Taunt first`);
        return false;
    }
    
    // Stealth check
    if (target && hasKeyword(target, 'stealth') && !hasKeyword(attacker, 'bloodScent')) {
        addLog(`Can't attack Stealth`);
        return false;
    }
    
    // Remove attacker's stealth
    if (hasKeyword(attacker, 'stealth')) {
        attacker.keywords = attacker.keywords.filter(k => k !== 'stealth');
    }
    
    attacker.attacksThisTurn++;
    attacker.hasAttacked = true;
    if (attacker.attacksThisTurn >= maxAttacks) {
        attacker.canAttack = false;
    }
    
    if (target === null) {
        // Face damage
        const dmg = attacker.currentAttack;
        game.enemy.health -= dmg;
        addLog(`${attacker.name} hits face for ${dmg}`);
        
        if (hasKeyword(attacker, 'drain')) {
            game.player.health = Math.min(game.player.maxHealth, game.player.health + dmg);
            addLog(`  Drains ${dmg}`);
        }
    } else {
        resolveCombat(attacker, target);
    }
    
    clearSelection();
    render();
    checkGameOver();
    return true;
}

function resolveCombat(attacker, defender) {
    // Phase
    if (hasKeyword(defender, 'phase') && Math.random() < 0.5) {
        addLog(`${defender.name} phases out!`);
        return;
    }
    
    let atkDmg = attacker.currentAttack;
    let defDmg = defender.currentAttack;
    
    // Incorporeal
    if (hasKeyword(defender, 'incorporeal')) atkDmg = Math.max(1, atkDmg - 1);
    if (hasKeyword(attacker, 'incorporeal')) defDmg = Math.max(1, defDmg - 1);
    
    attacker.currentDefense -= defDmg;
    defender.currentDefense -= atkDmg;
    
    addLog(`${attacker.name} (${atkDmg}) vs ${defender.name} (${defDmg})`);
    
    // Deathstrike
    if (hasKeyword(attacker, 'deathstrike') && defender.currentDefense > 0) {
        defender.currentDefense = 0;
        addLog(`  Deathstrike!`);
    }
    if (hasKeyword(defender, 'deathstrike') && attacker.currentDefense > 0) {
        attacker.currentDefense = 0;
        addLog(`  Deathstrike!`);
    }
    
    // Drain
    if (hasKeyword(attacker, 'drain')) {
        game.player.health = Math.min(game.player.maxHealth, game.player.health + atkDmg);
        addLog(`  Drains ${atkDmg}`);
    }
    
    // Siphon
    if (hasKeyword(attacker, 'siphon') && defender.currentDefense > 0) {
        attacker.currentAttack++;
        attacker.currentDefense++;
        defender.currentAttack = Math.max(0, defender.currentAttack - 1);
        addLog(`  Siphons 1/1`);
    }
    
    // Frenzy
    if (hasKeyword(attacker, 'frenzy') && !attacker.frenzyUsed && attacker.currentDefense > 0 && defDmg > 0) {
        attacker.frenzyUsed = true;
        attacker.currentAttack += 2;
        addLog(`  Frenzy +2 Attack`);
    }
    
    // Rampage
    if (hasKeyword(attacker, 'rampage') && defender.currentDefense <= 0) {
        attacker.currentAttack++;
        addLog(`  Rampage +1 Attack`);
    }
    
    removeDeadCreatures(game.player);
    removeDeadCreatures(game.enemy);
}

function checkGameOver() {
    if (game.player.health <= 0) {
        game.gameOver = true;
        game.winner = game.enemy;
        showGameOver(false);
    } else if (game.enemy.health <= 0) {
        game.gameOver = true;
        game.winner = game.player;
        showGameOver(true);
    }
}

// ============================================================================
// AI
// ============================================================================

function doAITurn() {
    if (game.gameOver) return;
    
    const enemy = game.enemy;
    const player = game.player;
    
    // Play cards
    const playable = enemy.hand.filter(c => canPlayCard(enemy, c)).sort((a, b) => b.cost - a.cost);
    for (const card of playable) {
        if (canPlayCard(enemy, card)) {
            if (card.type === 'Creature') {
                playCard(enemy, card, enemy.board.length);
            } else {
                playAISpell(enemy, card);
            }
            render();
        }
    }
    
    // Attack
    setTimeout(() => {
        for (const attacker of [...enemy.board]) {
            if (game.gameOver) break;
            
            const maxAtk = hasKeyword(attacker, 'feral') ? 2 : 1;
            while (attacker.canAttack && attacker.attacksThisTurn < maxAtk) {
                const taunts = player.board.filter(c => hasKeyword(c, 'taunt'));
                let target = taunts[0] || null;
                
                if (!target && player.board.length && attacker.currentAttack < player.health) {
                    // Look for good trades
                    for (const def of player.board) {
                        if (attacker.currentAttack >= def.currentDefense && def.currentAttack < attacker.currentDefense) {
                            target = def;
                            break;
                        }
                    }
                }
                
                // Remove stealth
                if (hasKeyword(attacker, 'stealth')) {
                    attacker.keywords = attacker.keywords.filter(k => k !== 'stealth');
                }
                
                attacker.attacksThisTurn++;
                attacker.hasAttacked = true;
                if (attacker.attacksThisTurn >= maxAtk) attacker.canAttack = false;
                
                if (!target) {
                    player.health -= attacker.currentAttack;
                    addLog(`Enemy ${attacker.name} hits you for ${attacker.currentAttack}`);
                    if (hasKeyword(attacker, 'drain')) {
                        enemy.health = Math.min(enemy.maxHealth, enemy.health + attacker.currentAttack);
                    }
                    checkGameOver();
                } else {
                    addLog(`Enemy ${attacker.name} attacks ${target.name}`);
                    resolveCombatAI(attacker, target);
                }
                render();
            }
        }
        
        if (!game.gameOver) {
            processEndOfTurn(enemy);
            setTimeout(() => {
                game.currentTurn = game.player;
                startTurn();
            }, 500);
        }
    }, 600);
}

function playAISpell(enemy, card) {
    const player = game.player;
    const targetType = getSpellTargetType(card);
    
    if (targetType === 'enemy' && player.board.length) {
        const target = player.board.reduce((a, b) => a.currentAttack > b.currentAttack ? a : b);
        playCard(enemy, card, -1, target);
    } else if (targetType === 'friendly' && enemy.board.length) {
        playCard(enemy, card, -1, enemy.board[0]);
    } else if (targetType === 'none') {
        playCard(enemy, card);
    }
}

function resolveCombatAI(attacker, defender) {
    if (hasKeyword(defender, 'phase') && Math.random() < 0.5) return;
    
    let atkDmg = attacker.currentAttack;
    let defDmg = defender.currentAttack;
    if (hasKeyword(defender, 'incorporeal')) atkDmg = Math.max(1, atkDmg - 1);
    if (hasKeyword(attacker, 'incorporeal')) defDmg = Math.max(1, defDmg - 1);
    
    attacker.currentDefense -= defDmg;
    defender.currentDefense -= atkDmg;
    
    if (hasKeyword(attacker, 'deathstrike') && defender.currentDefense > 0) defender.currentDefense = 0;
    if (hasKeyword(defender, 'deathstrike') && attacker.currentDefense > 0) attacker.currentDefense = 0;
    if (hasKeyword(attacker, 'drain')) game.enemy.health = Math.min(game.enemy.maxHealth, game.enemy.health + atkDmg);
    if (hasKeyword(attacker, 'rampage') && defender.currentDefense <= 0) attacker.currentAttack++;
    
    removeDeadCreatures(game.player);
    removeDeadCreatures(game.enemy);
}

// ============================================================================
// SELECTION & DRAG/DROP
// ============================================================================

function clearSelection() {
    game.selectedCard = null;
    game.selectionType = null;
    game.pendingSpell = null;
}

function startDrag(e, card, type, element) {
    if (game.currentTurn !== game.player || game.gameOver) return;
    e.preventDefault();
    
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;
    
    game.dragging = card;
    game.dragType = type;
    game.dragStartX = clientX;
    game.dragStartY = clientY;
    game.isDragging = false;
    game.dragOriginElement = element;
    element.classList.add('drag-origin');
}

function onDrag(e) {
    if (!game.dragging) return;
    e.preventDefault();
    
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;
    
    if (!game.isDragging && (Math.abs(clientX - game.dragStartX) > 5 || Math.abs(clientY - game.dragStartY) > 5)) {
        game.isDragging = true;
        createDragGhost(game.dragging, clientX, clientY);
        
        if (game.dragType === 'play') {
            document.getElementById('player-board').classList.add('drop-target');
        } else if (game.dragType === 'attack') {
            document.getElementById('enemy-hero').classList.add('targetable');
            document.querySelectorAll('#enemy-board .card').forEach(el => el.classList.add('targetable'));
        }
    }
    
    if (game.isDragging && game.dragElement) {
        game.dragElement.style.left = (clientX - 60) + 'px';
        game.dragElement.style.top = (clientY - 80) + 'px';
    }
}

function createDragGhost(card, x, y) {
    const el = document.createElement('div');
    el.className = 'card dragging';
    el.innerHTML = `<div class="card-cost">${card.hpCost ? card.cost+'+'+card.hpCost : card.cost}</div>
        <div class="card-name">${card.name}</div>`;
    document.body.appendChild(el);
    game.dragElement = el;
    el.style.left = (x - 60) + 'px';
    el.style.top = (y - 80) + 'px';
}

function endDrag(e) {
    if (!game.dragging) return;
    
    const card = game.dragging;
    const type = game.dragType;
    const clientX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? game.dragStartX;
    const clientY = e.clientY ?? e.changedTouches?.[0]?.clientY ?? game.dragStartY;
    
    if (game.isDragging) {
        const dropTarget = document.elementFromPoint(clientX, clientY);
        
        if (type === 'play') {
            const board = document.getElementById('player-board');
            if (board.contains(dropTarget) || dropTarget === board) {
                if (canPlayCard(game.player, card)) {
                    if (card.type === 'Creature') {
                        const pos = getDropPosition(clientX, board);
                        playCard(game.player, card, pos);
                    } else {
                        const targetType = getSpellTargetType(card);
                        if (targetType === 'none') {
                            playCard(game.player, card);
                        } else {
                            game.pendingSpell = card;
                            game.selectionType = 'target_' + targetType;
                            addLog(`Select target for ${card.name}`);
                            render();
                        }
                    }
                }
            }
        } else if (type === 'attack') {
            const heroEl = document.getElementById('enemy-hero');
            if (heroEl.contains(dropTarget) || dropTarget === heroEl) {
                tryAttack(card, null);
            } else {
                const cardEl = dropTarget?.closest?.('.card');
                if (cardEl?.dataset?.instanceId) {
                    const target = game.enemy.board.find(c => c.instanceId === cardEl.dataset.instanceId);
                    if (target) tryAttack(card, target);
                }
            }
        }
    }
    
    cancelDrag();
}

function cancelDrag() {
    game.dragElement?.remove();
    game.dragElement = null;
    document.querySelectorAll('.drag-origin').forEach(el => el.classList.remove('drag-origin'));
    document.getElementById('player-board')?.classList.remove('drop-target');
    document.getElementById('enemy-hero')?.classList.remove('targetable');
    document.querySelectorAll('#enemy-board .card').forEach(el => el.classList.remove('targetable'));
    game.dragging = null;
    game.dragType = null;
    game.isDragging = false;
}

function getDropPosition(clientX, board) {
    const cards = board.querySelectorAll('.card');
    for (let i = 0; i < cards.length; i++) {
        const rect = cards[i].getBoundingClientRect();
        if (clientX < rect.left + rect.width / 2) return i;
    }
    return cards.length;
}

// ============================================================================
// RENDERING
// ============================================================================

function render() {
    if (!game.player) return;
    
    // Heroes
    document.getElementById('enemy-hp').textContent = game.enemy.health;
    document.getElementById('enemy-mana').textContent = `${game.enemy.mana}/${game.enemy.maxMana}`;
    document.getElementById('player-hp').textContent = game.player.health;
    document.getElementById('player-mana').textContent = `${game.player.mana}/${game.player.maxMana}`;
    
    // Targeting
    const enemyHero = document.getElementById('enemy-hero');
    const canTargetHero = (game.selectedCard && game.selectionType === 'attack') ||
                         (game.pendingSpell && game.selectionType === 'target_any_or_hero');
    enemyHero.classList.toggle('targetable', canTargetHero);
    
    // Enemy hand with dynamic fan
    const enemyHand = document.getElementById('enemy-hand');
    enemyHand.innerHTML = '';
    const enemyHandSize = game.enemy.hand.length;
    for (let i = 0; i < enemyHandSize; i++) {
        const img = document.createElement('img');
        img.className = 'card-back';
        img.src = 'images/card_back.png';
        
        // Calculate fan position centered on hand (inverted for enemy)
        const centerIndex = (enemyHandSize - 1) / 2;
        const offset = i - centerIndex;
        
        // Rotation (inverted for top of screen)
        const maxRotation = Math.min(12, 4 + enemyHandSize);
        const rotationStep = enemyHandSize > 1 ? (maxRotation * 2) / (enemyHandSize - 1) : 0;
        const rotation = -offset * rotationStep;
        
        // Y offset for arc
        const yOffset = Math.abs(offset) * Math.abs(offset) * 5;
        
        img.style.transform = `rotate(${rotation}deg) translateY(${yOffset}px)`;
        
        enemyHand.appendChild(img);
    }
    
    // Boards
    renderBoard(game.enemy, 'enemy-board', true);
    renderBoard(game.player, 'player-board', false);
    
    // Player hand with dynamic fan
    const handEl = document.getElementById('player-hand');
    handEl.innerHTML = '';
    const handSize = game.player.hand.length;
    game.player.hand.forEach((card, index) => {
        // Create wrapper for hover zone (fixed size hit area)
        const wrapper = document.createElement('div');
        wrapper.className = 'card-slot';
        
        const cardEl = createCardElement(card, false, false, !canPlayCard(game.player, card));
        
        // Calculate fan position centered on hand
        const centerIndex = (handSize - 1) / 2;
        const offset = index - centerIndex;
        
        // Rotation: gentler, more consistent
        const maxRotation = Math.min(15, 5 + handSize * 0.8);
        const rotationStep = handSize > 1 ? (maxRotation * 2) / (handSize - 1) : 0;
        const rotation = offset * rotationStep;
        
        // Y offset: gentler linear curve instead of parabolic
        const yOffset = Math.abs(offset) * 6;
        
        // Z-index: rightmost cards on top (newer cards drawn land on top)
        const zIndex = 20 + index;
        
        wrapper.style.zIndex = zIndex;
        cardEl.style.transform = `rotate(${rotation}deg) translateY(${yOffset}px)`;
        cardEl.dataset.fanIndex = index;
        
        wrapper.appendChild(cardEl);
        handEl.appendChild(wrapper);
    });
    
    // Deck/Graveyard counts
    document.getElementById('player-deck-count').textContent = game.player.deck.length;
    document.getElementById('enemy-deck-count').textContent = game.enemy.deck.length;
    document.getElementById('player-grave-count').textContent = game.player.graveyard.length;
    document.getElementById('enemy-grave-count').textContent = game.enemy.graveyard.length;
    
    // Turn indicator
    const indicator = document.getElementById('turn-indicator');
    indicator.textContent = game.currentTurn === game.player ? 'Your Turn' : 'Enemy Turn';
    indicator.style.color = game.currentTurn === game.player ? '#c8aa64' : '#c85050';
    
    // End turn button
    const btn = document.getElementById('end-turn-btn');
    btn.classList.toggle('disabled', game.currentTurn !== game.player || game.gameOver);
    btn.textContent = game.currentTurn === game.player ? 'End Turn' : 'Enemy Turn...';
    
    // Log
    const log = document.getElementById('combat-log');
    log.innerHTML = game.log.slice(-10).map(m => `<p>${m}</p>`).join('');
    log.scrollTop = log.scrollHeight;
}

function renderBoard(player, containerId, isEnemy) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    for (const c of player.board) {
        container.appendChild(createCardElement(c, true, isEnemy));
    }
}

function createCardElement(card, isOnBoard, isEnemy, unplayable = false) {
    const el = document.createElement('div');
    el.className = 'card';
    el.dataset.instanceId = card.instanceId;
    
    const isCreature = card.type === 'Creature' || card.attack !== undefined;
    const isSpell = !isCreature;
    
    if (isOnBoard) el.classList.add('creature');
    if (isEnemy) el.classList.add('enemy-card');
    if (unplayable) el.classList.add('unplayable');
    if (isSpell && !isOnBoard) el.classList.add('spell-card');
    if (game.selectedCard === card) el.classList.add('selected');
    
    // Add tribe class for color
    if (card.tribe) {
        el.classList.add('tribe-' + card.tribe.toLowerCase());
    }
    
    const maxAtk = hasKeyword(card, 'feral') ? 2 : 1;
    if (isOnBoard && !isEnemy && card.canAttack && (card.attacksThisTurn || 0) < maxAtk) {
        el.classList.add('can-attack');
    }
    
    // Targeting highlights
    const targeting = game.pendingSpell && game.selectionType;
    if (isOnBoard && isEnemy && (game.selectionType === 'attack' || 
        targeting === 'target_enemy' || targeting === 'target_any' || targeting === 'target_any_or_hero')) {
        el.classList.add('targetable');
    }
    if (isOnBoard && !isEnemy && (targeting === 'target_friendly' || targeting === 'target_any')) {
        el.classList.add('targetable');
    }
    
    // Content
    const costStr = card.hpCost ? `${card.cost}<span class="hp-cost">+${card.hpCost}</span>` : card.cost;
    const typeStr = card.tribe ? `Creature — ${card.tribe}` : (card.school ? `${card.school} ${card.type}` : card.type);
    
    if (isCreature) {
        const atk = card.currentAttack ?? card.attack;
        const def = card.currentDefense ?? card.defense;
        const atkClass = atk > card.attack ? 'buffed' : atk < card.attack ? 'debuffed' : '';
        const defClass = def > card.defense ? 'buffed' : def < card.defense ? 'debuffed' : '';
        
        // Build keywords display
        const keywordsText = card.keywords?.length 
            ? card.keywords.slice(0,3).map(k => `<strong>${KEYWORDS[k]?.name || k}</strong>`).join(', ')
            : '';
        
        el.innerHTML = `
            <div class="card-cost">${costStr}</div>
            <div class="card-inner">
                <div class="card-name"><span>${card.name}</span></div>
                <div class="card-art"></div>
                <div class="card-type"><span>${typeStr}</span></div>
                <div class="card-textbox">
                    <div class="card-ability-wrapper">
                        <div class="card-ability">${keywordsText}</div>
                    </div>
                </div>
            </div>
            <div class="stat-orb stat-attack ${atkClass}">${atk}</div>
            <div class="stat-orb stat-life ${defClass}">${def}</div>
        `;
    } else {
        el.innerHTML = `
            <div class="card-cost">${costStr}</div>
            <div class="card-inner">
                <div class="card-name"><span>${card.name}</span></div>
                <div class="card-type"><span>${typeStr}</span></div>
                <div class="card-textbox">
                    <div class="card-ability-wrapper">
                        <div class="card-ability">${card.text || ''}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Event handlers
    if (!isOnBoard && !unplayable && game.currentTurn === game.player && !game.pendingSpell) {
        el.addEventListener('mousedown', e => startDrag(e, card, 'play', el));
        el.addEventListener('touchstart', e => startDrag(e, card, 'play', el));
    }
    
    if (isOnBoard && !isEnemy && card.canAttack && !game.pendingSpell) {
        el.addEventListener('mousedown', e => startDrag(e, card, 'attack', el));
        el.addEventListener('touchstart', e => startDrag(e, card, 'attack', el));
    }
    
    // Target click
    if (isOnBoard && game.pendingSpell) {
        el.addEventListener('click', e => {
            e.stopPropagation();
            const t = game.selectionType;
            const valid = (isEnemy && (t === 'target_enemy' || t === 'target_any' || t === 'target_any_or_hero')) ||
                         (!isEnemy && (t === 'target_friendly' || t === 'target_any'));
            if (valid) {
                playCard(game.player, game.pendingSpell, -1, card);
            }
        });
    }
    
    if (isOnBoard && isEnemy && game.selectedCard && game.selectionType === 'attack') {
        el.addEventListener('click', e => {
            e.stopPropagation();
            tryAttack(game.selectedCard, card);
        });
    }
    
    return el;
}

function showGameOver(victory) {
    const overlay = document.getElementById('game-over');
    const text = document.getElementById('game-over-text');
    overlay.classList.remove('hidden');
    text.textContent = victory ? 'VICTORY' : 'DEFEAT';
    text.className = victory ? 'victory' : 'defeat';
}

function addLog(msg) {
    game.log.push(msg);
    if (game.log.length > 50) game.log.shift();
    console.log(msg);
}

// ============================================================================
// DECK BUILDER
// ============================================================================

let deckBuilderDeck = [];

function openDeckBuilder() {
    showScreen('deckbuilder-screen');
    deckBuilderDeck = [];
    renderDeckBuilder();
}

function renderDeckBuilder() {
    const container = document.getElementById('card-pool');
    const deckList = document.getElementById('deck-list');
    const deckCount = document.getElementById('deck-count');
    
    if (!container) return;
    
    // Group by type then tribe/school
    const creatures = Object.entries(CARD_DATABASE).filter(([id, c]) => c.type === 'Creature');
    const spells = Object.entries(CARD_DATABASE).filter(([id, c]) => c.type !== 'Creature');
    
    container.innerHTML = '';
    
    // Creatures by tribe
    const tribes = ['Undead', 'Demon', 'Vampire', 'Beast', 'Spirit', 'Cultist'];
    for (const tribe of tribes) {
        const tribal = creatures.filter(([id, c]) => c.tribe === tribe).sort((a, b) => a[1].cost - b[1].cost);
        if (tribal.length === 0) continue;
        
        const section = document.createElement('div');
        section.className = 'card-section';
        section.innerHTML = `<h3>${tribe}</h3>`;
        const grid = document.createElement('div');
        grid.className = 'card-grid';
        
        for (const [id, card] of tribal) {
            grid.appendChild(createDeckBuilderCard(id, card));
        }
        section.appendChild(grid);
        container.appendChild(section);
    }
    
    // Spells by school
    const schools = ['Death', 'Blood', 'Shadow', 'Ritual', 'Affliction', 'Generic'];
    for (const school of schools) {
        const schoolCards = spells.filter(([id, c]) => c.school === school).sort((a, b) => a[1].cost - b[1].cost);
        if (schoolCards.length === 0) continue;
        
        const section = document.createElement('div');
        section.className = 'card-section';
        section.innerHTML = `<h3>${school} Magic</h3>`;
        const grid = document.createElement('div');
        grid.className = 'card-grid';
        
        for (const [id, card] of schoolCards) {
            grid.appendChild(createDeckBuilderCard(id, card));
        }
        section.appendChild(grid);
        container.appendChild(section);
    }
    
    // Deck list
    deckList.innerHTML = '';
    const grouped = {};
    for (const id of deckBuilderDeck) {
        grouped[id] = (grouped[id] || 0) + 1;
    }
    
    for (const [id, count] of Object.entries(grouped).sort((a, b) => {
        const ca = CARD_DATABASE[a[0]], cb = CARD_DATABASE[b[0]];
        return (ca?.cost || 0) - (cb?.cost || 0);
    })) {
        const card = CARD_DATABASE[id];
        if (!card) continue;
        
        const item = document.createElement('div');
        item.className = 'deck-item';
        item.innerHTML = `<span class="deck-item-cost">${card.cost}</span>
            <span class="deck-item-name">${card.name}</span>
            <span class="deck-item-count">×${count}</span>`;
        item.addEventListener('click', () => removeFromDeck(id));
        deckList.appendChild(item);
    }
    
    deckCount.textContent = deckBuilderDeck.length;
}

function createDeckBuilderCard(id, card) {
    const el = document.createElement('div');
    el.className = 'db-card';
    
    const count = deckBuilderDeck.filter(x => x === id).length;
    if (count >= 2) el.classList.add('maxed');
    
    const isCreature = card.type === 'Creature';
    const costStr = card.hpCost ? `${card.cost}+${card.hpCost}` : card.cost;
    
    if (isCreature) {
        el.innerHTML = `
            <div class="db-cost">${costStr}</div>
            <div class="db-name">${card.name}</div>
            <div class="db-tribe">${card.tribe}</div>
            <div class="db-stats">${card.attack}/${card.defense}</div>
            ${card.keywords?.length ? `<div class="db-keywords">${card.keywords.join(', ')}</div>` : ''}
            ${count > 0 ? `<div class="db-count">×${count}</div>` : ''}
        `;
    } else {
        el.innerHTML = `
            <div class="db-cost">${costStr}</div>
            <div class="db-name">${card.name}</div>
            <div class="db-school">${card.school} ${card.type}</div>
            <div class="db-text">${card.text}</div>
            ${count > 0 ? `<div class="db-count">×${count}</div>` : ''}
        `;
    }
    
    el.addEventListener('click', () => addToDeck(id));
    return el;
}

function addToDeck(id) {
    const count = deckBuilderDeck.filter(x => x === id).length;
    if (count >= 2) return;
    deckBuilderDeck.push(id);
    renderDeckBuilder();
}

function removeFromDeck(id) {
    const idx = deckBuilderDeck.indexOf(id);
    if (idx !== -1) {
        deckBuilderDeck.splice(idx, 1);
        renderDeckBuilder();
    }
}

function saveDeck() {
    if (deckBuilderDeck.length < 10) {
        alert('Deck must have at least 10 cards');
        return;
    }
    playerDeck = [...deckBuilderDeck];
    alert(`Deck saved! (${playerDeck.length} cards)`);
}

function clearDeck() {
    deckBuilderDeck = [];
    renderDeckBuilder();
}

function backToMenu() {
    showScreen('menu-screen');
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Track which card slot is being hovered
let hoveredSlotIndex = -1;

function updateHandHover(e) {
    const handEl = document.getElementById('player-hand');
    if (!handEl) return;
    
    const slots = handEl.querySelectorAll('.card-slot');
    if (slots.length === 0) return;
    
    const handRect = handEl.getBoundingClientRect();
    const mouseY = e.clientY;
    
    // Only track if mouse is in the lower portion of the screen (hand area)
    if (mouseY < handRect.top - 50) {
        if (hoveredSlotIndex !== -1) {
            slots.forEach(s => s.classList.remove('slot-hover'));
            hoveredSlotIndex = -1;
        }
        return;
    }
    
    const mouseX = e.clientX;
    let newHoveredIndex = -1;
    
    // Find which slot the mouse X position is closest to
    slots.forEach((slot, index) => {
        const rect = slot.getBoundingClientRect();
        const slotCenterX = rect.left + rect.width / 2;
        const slotWidth = rect.width;
        
        // Check if mouse X is within this slot's zone
        if (mouseX >= rect.left && mouseX <= rect.right) {
            newHoveredIndex = index;
        }
    });
    
    // If between slots, find closest
    if (newHoveredIndex === -1) {
        let closestDist = Infinity;
        slots.forEach((slot, index) => {
            const rect = slot.getBoundingClientRect();
            const slotCenterX = rect.left + rect.width / 2;
            const dist = Math.abs(mouseX - slotCenterX);
            if (dist < closestDist && mouseX >= rect.left - 20 && mouseX <= rect.right + 20) {
                closestDist = dist;
                newHoveredIndex = index;
            }
        });
    }
    
    if (newHoveredIndex !== hoveredSlotIndex) {
        slots.forEach(s => s.classList.remove('slot-hover'));
        if (newHoveredIndex !== -1) {
            slots[newHoveredIndex].classList.add('slot-hover');
        }
        hoveredSlotIndex = newHoveredIndex;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('play-btn')?.addEventListener('click', startGame);
    document.getElementById('end-turn-btn')?.addEventListener('click', endTurn);
    document.getElementById('menu-btn')?.addEventListener('click', () => showScreen('menu-screen'));
    document.getElementById('deckbuilder-btn')?.addEventListener('click', openDeckBuilder);
    document.getElementById('save-deck-btn')?.addEventListener('click', saveDeck);
    document.getElementById('clear-deck-btn')?.addEventListener('click', clearDeck);
    document.getElementById('back-to-menu-btn')?.addEventListener('click', backToMenu);
    
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mousemove', updateHandHover);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
    
    document.getElementById('player-board')?.addEventListener('click', e => {
        if (game.selectedCard && game.selectionType === 'play') {
            if (canPlayCard(game.player, game.selectedCard)) {
                playCard(game.player, game.selectedCard, getDropPosition(e.clientX, e.currentTarget));
            }
        }
    });
    
    document.getElementById('enemy-hero')?.addEventListener('click', () => {
        if (game.selectedCard && game.selectionType === 'attack') {
            tryAttack(game.selectedCard, null);
        }
        if (game.pendingSpell && game.selectionType === 'target_any_or_hero') {
            playCard(game.player, game.pendingSpell, -1, 'enemy_hero');
        }
    });
    
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        clearSelection();
        cancelDrag();
        render();
    });
    
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            clearSelection();
            cancelDrag();
            render();
        }
    });
});
