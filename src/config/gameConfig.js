// Game configuration
export const GAME_CONFIG = {
  type: Phaser.AUTO,
  width: 800,
  height: 1000,
  backgroundColor: "#1a1a2e",
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 1000,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 800 },
      debug: false,
    },
  },
  scene: [], // Populated in main.js
};

// Design constants inspired by Japanese aesthetics
export const DESIGN_CONSTANTS = {
  COLORS: {
    PRIMARY: 0xf4a460, // Warm amber
    ACCENT: 0xff6b35, // Sunset orange
    GOLD: 0xffd700, // Gold accent
    BACKGROUND: 0x2e3a59, // Deep indigo
    SAKURA: 0xffb7c5, // Cherry blossom pink
  },
  BALL_RADIUS: 12,
  PIN_SPACING: 60,
  BOUNCE_FACTOR: 0.55,
  MAX_LIVES: 5,
  COMBO_THRESHOLD: 3,
  MA_INTERVAL: 150, // Silence interval (ma concept)
};

// Bucket configuration with Japanese aesthetic (大中小 pattern)
export const BUCKET_CONFIG = [
  { value: 1, label: "小", color: 0x4a90e2 },
  { value: 3, label: "中", color: 0x7b68ee },
  { value: 5, label: "大", color: 0xff6b35 },
  { value: 10, label: "特", color: 0xffd700 },
  { value: 5, label: "大", color: 0xff6b35 },
  { value: 3, label: "中", color: 0x7b68ee },
  { value: 1, label: "小", color: 0x4a90e2 },
];

// Traductions du jeu - Format multilingue
export const TRANSLATIONS = {
  fr: {
    menu: {
      title: "PACHINKO",
      subtitle: "Le son des billes qui tombent\nRésonne dans le cœur\nBeauté japonaise",
      startButton: "Commencer",
      scoreboardButton: "Tableau des Scores",
      instructions: "Cliquez pour lancer une bille\nEnchaînez les combos pour un score élevé !",
      paletteTitle: "Palette de couleurs",
      settings: "Paramètres",
      language: "Langue",
      username: "Pseudo",
      change: "Modifier",
      resetScoreboard: "Réinitialiser Classement",
      resetScoreboardConfirm: "Êtes-vous sûr de vouloir effacer tous les scores ?",
      yes: "Oui",
      no: "Non",
    },
    ui: {
      score: "Score",
      lives: "Vies",
      instruction: "Cliquez pour lancer une bille",
    },
    game: {
      combo: "Combo",
    },
    creature: {
      eaten: "Mangé !",
    },
    gameOver: {
      title: "Partie Terminée",
      haiku: "Les billes tombent\nLe temps s'écoule\nEt revient encore",
      finalScore: "Score Final",
      restart: "Rejouer",
      menu: "Menu Principal",
      viewScoreboard: "Voir le Classement",
      yourRank: "Votre rang",
      notInTop10: "Non classé",
      newHighScore: "Nouveau record !",
    },
    scoreboard: {
      title: "Tableau des Scores",
      rank: "Rang",
      username: "Pseudo",
      score: "Score",
      date: "Date",
      noScores: "Aucun score enregistré",
      back: "Retour",
      top10: "Top 10",
    },
    betting: {
      title: "Placer votre mise",
      player: "Joueur",
      startGame: "Commencer la partie",
      changeUsername: "Changer de pseudo",
      backToMenu: "← Menu",
      invalidBet: "Mise invalide. Choisissez 100, 200, 1000 ou 2000 Yens.",
      insufficientBalance: "Balance insuffisante pour cette mise.",
      betMultiplierLabel: "Modificateur de mise",
    },
    malus: {
      title: "Configuration Aléatoire",
      subtitle: "Difficulté de la partie",
      reroll: "Relancer",
      rerollCost: "(-20% balance)",
      accept: "Accepter & Miser",
      multiplier: "Multiplicateur",
      insufficientReroll: "Balance insuffisante pour relancer.",
      noMalus: "Aucun malus",
      creature1: "1 Yokai",
      creature1Desc: "Une créature rôde sur le plateau",
      creature2: "2 Yokai",
      creature2Desc: "Deux créatures rôdent sur le plateau",
      creature3: "3 Yokai",
      creature3Desc: "Trois créatures rôdent sur le plateau",
      movingPins: "Pins Mouvants",
      movingPinsDesc: "Les pins oscillent de gauche à droite",
      randomPinSize: "Taille Aléatoire",
      randomPinSizeDesc: "Les pins ont des tailles variées",
      hardcoreMode: "Mode Hardcore",
      hardcoreModeDesc: "Contrôle de lancement avec curseurs oscillants",
      multiplierLabel: "Modificateur des malus",
      totalMultiplierLabel: "Modificateur total",
    },
    username: {
      title: "Bienvenue",
      prompt: "Entrez votre pseudo",
      placeholder: "Votre pseudo...",
      submit: "Commencer à jouer",
      validation: "3-12 caractères alphanumériques",
      error: "Pseudo invalide",
      notSet: "Non défini",
    },
    tutorial: {
      menuButton: "Comment jouer ?",
      title: "Tutoriel",
      next: "Suivant",
      prev: "Précédent",
      close: "Fermer",
      menu: "Sommaire",

      // Categories
      cat_mechanics: "Mécaniques de Base",
      cat_features: "Bonus & Événements",
      cat_powerups: "Power-Ups",
      cat_malus: "Malus & Dangers",
      cat_settings: "Paramètres & Modes",

      // Mechanics
      mech_launch_title: "1. Lancer la Bille",
      mech_launch_desc: "• Cliquez pour lancer une bille.\n• Maintenez pour augmenter la puissance.\n• La direction dépend de la position de la souris.",
      mech_score_title: "2. Score & Combos",
      mech_score_desc: "• Visez les paniers en bas.\n• Chaque rebond augmente le compteur de COMBO.\n• Les combos multiplient vos gains !",

      // Features
      feat_lucky_title: "Lucky Zone",
      feat_lucky_desc: "• Une zone verte clignotante apparaît parfois.\n• Si vous tombez dedans, le score est DOUBLÉ !",
      feat_mystery_title: "Panier Mystère",
      feat_mystery_desc: "• Un panier avec un '?' apparaît.\n• Rapporte un montant aléatoire élevé (jusqu'à 1000 pts) !",

      // Powerups
      pup_golden_title: "Bille Dorée",
      pup_golden_desc: "• Apparaît rarement (1/10).\n• Rapporte DOUBLE points sur tout son trajet.\n• Laisse une traînée d'étincelles.",
      pup_ghost_title: "Bille Fantôme",
      pup_ghost_desc: "• Une bille transparente.\n• Elle traverse les obstacles mineurs.\n• Idéale pour atteindre le centre.",
      pup_magnet_title: "Bille Aimant",
      pup_magnet_desc: "• Attirée par les zones à haute valeur.\n• Courbe sa trajectoire vers les gains.",
      pup_multiball_title: "Multi-Balle",
      pup_multiball_desc: "• Divise votre bille en 3 billes plus petites.\n• Triple vos chances de toucher des paniers !",
      pup_bigball_title: "Grosse Balle",
      pup_bigball_desc: "• Une bille énorme.\n• Elle bouscule tout sur son passage\net ne rentre que dans les grandes zones.",

      // Malus
      malus_yokai_title: "Yokais",
      malus_yokai_desc: "• Des fantômes qui patrouillent.\n• S'ils touchent votre bille, elle disparaît !\n• Évitez-les à tout prix.",
      malus_pins_title: "Pins Mouvants",
      malus_pins_desc: "• Certains clous bougent horizontalement.\n• Rendent les rebonds imprévisibles.",

      // Settings
      set_hardcore_title: "Mode Hardcore",
      set_hardcore_desc: "• Le curseur de visée tremble.\n• La puissance oscille.\n• Pour les experts qui veulent du défi !",
    },
    effects: {
      great: "SUPER !",
      amazing: "INCROYABLE !",
      legendary: "LÉGENDAIRE !",
      godlike: "DIVIN !",
      soClose: "SI PRÈS !",
      goldenBall: "BALLE DORÉE !",
      mysteryBucket: "MYSTÈRE !",
      luckyZone: "ZONE CHANCE !",
      combo: "COMBO",
      nearMiss: "SI PRÈS !",
    },
    achievements: {
      unlocked: "Succès débloqué !",
      comboStarter: "Combo Débutant",
      comboPro: "Combo Pro",
      comboMaster: "Maître du Combo",
      comboLegend: "Légende du Combo",
      firstSteps: "Premiers Pas",
      risingStar: "Étoile Montante",
      highRoller: "Grand Joueur",
      jackpotKing: "Roi du Jackpot",
      luckyShot: "Coup de Chance",
      tripleJackpot: "Triple Jackpot",
      survivor: "Survivant",
      immortal: "Immortel",
      goldenTouch: "Toucher Doré",
      midas: "Midas",
      mysterySolver: "Solveur de Mystère",
      fortuneSeeker: "Chercheur de Fortune",
      regularPlayer: "Joueur Régulier",
      dedicated: "Dévoué",
      dailyChallenge: "Défi Quotidien",
      challengeComplete: "Défi Complété !",
      reward: "Récompense",
    },
    powerups: {
      magnet: "Aimant",
      ghost: "Fantôme",
      multiBall: "Multi-Balle",
      bigBall: "Grosse Balle",
      goldenBall: "Balle Dorée",
      active: "Actif",
      remaining: "restants",
    },
    progress: {
      currentTier: "Niveau actuel",
      nextTier: "Prochain niveau",
      progress: "Progression",
      tierUnlocked: "Tier débloqué !",
    },
    comeback: {
      active: "BONUS RETOUR ACTIF !",
      multiplier: "Multiplicateur bonus",
    },
  },
  en: {
    menu: {
      title: "PACHINKO",
      subtitle: "The sound of falling balls\nResonates in the heart\nJapanese beauty",
      startButton: "Start",
      scoreboardButton: "Scoreboard",
      instructions: "Click to launch a ball\nChain combos for high score!",
      paletteTitle: "Color Palette",
      settings: "Settings",
      language: "Language",
      username: "Username",
      change: "Change",
      resetScoreboard: "Reset Scoreboard",
      resetScoreboardConfirm: "Are you sure you want to clear all scores?",
      yes: "Yes",
      no: "No",
    },
    ui: {
      score: "Score",
      lives: "Lives",
      instruction: "Click to launch a ball",
    },
    game: {
      combo: "Combo",
    },
    creature: {
      eaten: "Eaten!",
    },
    gameOver: {
      title: "Game Over",
      haiku: "The balls are falling\nTime flows away\nAnd comes back again",
      finalScore: "Final Score",
      restart: "Play Again",
      menu: "Main Menu",
      viewScoreboard: "View Scoreboard",
      yourRank: "Your rank",
      notInTop10: "Not ranked",
      newHighScore: "New high score!",
    },
    scoreboard: {
      title: "Scoreboard",
      rank: "Rank",
      username: "Username",
      score: "Score",
      date: "Date",
      noScores: "No scores recorded",
      back: "Back",
      top10: "Top 10",
    },
    betting: {
      title: "Place your bet",
      player: "Player",
      startGame: "Start game",
      changeUsername: "Change username",
      backToMenu: "← Menu",
      invalidBet: "Invalid bet. Choose 100, 200, 1000 or 2000 Yens.",
      insufficientBalance: "Insufficient balance for this bet.",
      betMultiplierLabel: "Bet Multiplier",
    },
    malus: {
      title: "Random Configuration",
      subtitle: "Game difficulty",
      reroll: "Reroll",
      rerollCost: "(-20% balance)",
      accept: "Accept & Bet",
      multiplier: "Multiplier",
      insufficientReroll: "Insufficient balance to reroll.",
      noMalus: "No malus",
      creature1: "1 Yokai",
      creature1Desc: "A creature roams the board",
      creature2: "2 Yokai",
      creature2Desc: "Two creatures roam the board",
      creature3: "3 Yokai",
      creature3Desc: "Three creatures roam the board",
      movingPins: "Moving Pins",
      movingPinsDesc: "Pins oscillate left and right",
      randomPinSize: "Random Size",
      randomPinSizeDesc: "Pins have varied sizes",
      hardcoreMode: "Hardcore Mode",
      hardcoreModeDesc: "Launch control with oscillating cursors",
      multiplierLabel: "Malus Multiplier",
      totalMultiplierLabel: "Total Multiplier",
    },
    username: {
      title: "Welcome",
      prompt: "Enter your username",
      placeholder: "Your username...",
      submit: "Start Playing",
      validation: "3-12 alphanumeric characters",
      error: "Invalid username",
      notSet: "Not set",
    },
    tutorial: {
      menuButton: "How to Play?",
      title: "Tutorial",
      next: "Next",
      prev: "Previous",
      close: "Close",
      menu: "Contents",

      // Categories
      cat_mechanics: "Basic Mechanics",
      cat_features: "Bonuses & Events",
      cat_powerups: "Power-Ups",
      cat_malus: "Malus & Dangers",
      cat_settings: "Settings & Modes",

      // Mechanics
      mech_launch_title: "1. Launching",
      mech_launch_desc: "• Click to launch a ball.\n• Hold to increase power.\n• Aim with your mouse cursor.",
      mech_score_title: "2. Scoring & Combos",
      mech_score_desc: "• Aim for the buckets at the bottom.\n• Rebounds increase your COMBO counter.\n• Combos multiply your earnings!",

      // Features
      feat_lucky_title: "Lucky Zone",
      feat_lucky_desc: "• A flashing green zone appears randomly.\n• Hitting it DOUBLES your score!",
      feat_mystery_title: "Mystery Bucket",
      feat_mystery_desc: "• A bucket with a '?' appears.\n• Awards a random high score (up to 1000 pts)!",

      // Powerups
      pup_golden_title: "Golden Ball",
      pup_golden_desc: "• Rare spawn (1/10).\n• DOUBLE points for its entire lifetime.\n• Sparkling visual effect.",
      pup_ghost_title: "Ghost Ball",
      pup_ghost_desc: "• Transparent ball.\n• Passes through minor obstacles.\n• Great for reaching the center.",
      pup_magnet_title: "Magnet Ball",
      pup_magnet_desc: "• Attracted to high-value zones.\n• Curves towards profits.",
      pup_multiball_title: "Multi-Ball",
      pup_multiball_desc: "• Splits into 3 smaller balls.\n• Triples your hitting chances!",
      pup_bigball_title: "Big Ball",
      pup_bigball_desc: "• A huge ball.\n• Pushes everything aside\nand only fits in large zones.",

      // Malus
      malus_yokai_title: "Yokais",
      malus_yokai_desc: "• Patrol ghosts.\n• If they touch your ball, it vanishes!\n• Avoid them at all costs.",
      malus_pins_title: "Moving Pins",
      malus_pins_desc: "• Some pins move horizontally.\n• Makes rebounds unpredictable.",

      // Settings
      set_hardcore_title: "Hardcore Mode",
      set_hardcore_desc: "• Aim cursor shakes.\n• Power oscillates.\n• For experts seeking a challenge!",
    },
    effects: {
      great: "GREAT!",
      amazing: "AMAZING!",
      legendary: "LEGENDARY!",
      godlike: "GODLIKE!",
      soClose: "SO CLOSE!",
      goldenBall: "GOLDEN BALL!",
      mysteryBucket: "MYSTERY!",
      luckyZone: "LUCKY ZONE!",
      combo: "COMBO",
      nearMiss: "SO CLOSE!",
    },
    achievements: {
      unlocked: "Achievement Unlocked!",
      comboStarter: "Combo Starter",
      comboPro: "Combo Pro",
      comboMaster: "Combo Master",
      comboLegend: "Combo Legend",
      firstSteps: "First Steps",
      risingStar: "Rising Star",
      highRoller: "High Roller",
      jackpotKing: "Jackpot King",
      luckyShot: "Lucky Shot",
      tripleJackpot: "Triple Jackpot",
      survivor: "Survivor",
      immortal: "Immortal",
      goldenTouch: "Golden Touch",
      midas: "Midas",
      mysterySolver: "Mystery Solver",
      fortuneSeeker: "Fortune Seeker",
      regularPlayer: "Regular Player",
      dedicated: "Dedicated",
      dailyChallenge: "Daily Challenge",
      challengeComplete: "Challenge Complete!",
      reward: "Reward",
    },
    powerups: {
      magnet: "Magnet",
      ghost: "Ghost",
      multiBall: "Multi-Ball",
      bigBall: "Big Ball",
      goldenBall: "Golden Ball",
      active: "Active",
      remaining: "remaining",
    },
    progress: {
      currentTier: "Current tier",
      nextTier: "Next tier",
      progress: "Progress",
      tierUnlocked: "Tier Unlocked!",
    },
    comeback: {
      active: "COMEBACK BONUS ACTIVE!",
      multiplier: "Bonus multiplier",
    },
  },
};

// Palettes de couleurs
export const COLOR_PALETTES = {
  classic: {
    name: "Classique",
    colors: {
      PRIMARY: 0xf4a460,
      ACCENT: 0xff6b35,
      GOLD: 0xffd700,
      BACKGROUND: 0x2e3a59,
      SAKURA: 0xffb7c5,
      BALL: 0xff6b35, // Red
    },
  },
  ocean: {
    name: "Océan",
    colors: {
      PRIMARY: 0x4fc3f7,
      ACCENT: 0x0277bd,
      GOLD: 0x00bcd4,
      BACKGROUND: 0x1a237e,
      SAKURA: 0x80deea,
      BALL: 0xff6b6b, // Yellow-orange
    },
  },
  forest: {
    name: "Forêt",
    colors: {
      PRIMARY: 0x8bc34a,
      ACCENT: 0x558b2f,
      GOLD: 0xcddc39,
      BACKGROUND: 0x1b5e20,
      SAKURA: 0xaed581,
      BALL: 0xff5722, // blue
    },
  },
  sunset: {
    name: "Coucher de soleil",
    colors: {
      PRIMARY: 0xff7043,
      ACCENT: 0xe91e63,
      GOLD: 0xffc107,
      BACKGROUND: 0x4a148c,
      SAKURA: 0xf48fb1,
      BALL: 0xffd700, // Gold
    },
  },
  midnight: {
    name: "Minuit",
    colors: {
      PRIMARY: 0x9575cd,
      ACCENT: 0x5e35b1,
      GOLD: 0xba68c8,
      BACKGROUND: 0x1a1a2e,
      SAKURA: 0xb39ddb,
      BALL: 0xff4081, // Pink accent
    },
  },
};

// Import EventBus for palette change notifications
import EventBus, { GameEvents } from '../core/EventBus.js';

// Gestion de la palette active
export function setActivePalette(paletteName) {
  if (COLOR_PALETTES[paletteName]) {
    Object.assign(DESIGN_CONSTANTS.COLORS, COLOR_PALETTES[paletteName].colors);
    localStorage.setItem('pachinko_active_palette', paletteName);
    // Emit event to notify all listeners of palette change
    EventBus.emit(GameEvents.PALETTE_CHANGED, { palette: paletteName });
  }
}

// Preview palette without saving (for hover preview)
export function previewPalette(paletteName) {
  if (COLOR_PALETTES[paletteName]) {
    Object.assign(DESIGN_CONSTANTS.COLORS, COLOR_PALETTES[paletteName].colors);
  }
}

export function getActivePalette() {
  return localStorage.getItem('pachinko_active_palette') || 'classic';
}

export function initPalette() {
  const savedPalette = getActivePalette();
  setActivePalette(savedPalette);
}

// Creature configuration (Yokai enemy)
export const CREATURE_CONFIG = {
  SPEED: 70, // Movement speed in pixels/second
  RADIUS: 18, // Collision radius
  COLOR: 0x4a0e4e, // Dark purple
  MIN_X: 180, // Left boundary (inside pin area)
  MAX_X: 620, // Right boundary (inside pin area)
  MIN_Y: 100, // Top boundary
  MAX_Y: 800, // Bottom boundary (above buckets)
};

export const BETTING_CONFIG = {
  exchangeRate: 0.1, // 100 yen -> 10 credits
  betOptions: [100, 500, 1000, 5000],
  initialYen: 500,
};

// Hardcore Launch Mode Configuration
export const HARDCORE_LAUNCH = {
  SIZE_MIN: 8,
  SIZE_MAX: 15,
  SIZE_SPEED: 1500, // ms pour un cycle complet
  ANGLE_MIN: -45, // degrés
  ANGLE_MAX: 45,
  ANGLE_SPEED: 2000,
  FORCE_MIN: 50,
  FORCE_MAX: 400,
  FORCE_SPEED: 1800,
  // Arrow scaling based on force
  ARROW_LENGTH_MIN: 35, // Longueur minimale de la flèche (force min)
  ARROW_LENGTH_MAX: 80, // Longueur maximale de la flèche (force max)
  ARROW_WIDTH_MIN: 2,   // Épaisseur minimale du trait
  ARROW_WIDTH_MAX: 6,   // Épaisseur maximale du trait
  ARROW_HEAD_MIN: 6,    // Taille minimale de la pointe
  ARROW_HEAD_MAX: 14,   // Taille maximale de la pointe
  ARROW_LENGTH: 60, // Deprecated - use ARROW_LENGTH_MIN/MAX
  GAUGE_WIDTH: 200,
  GAUGE_HEIGHT: 20,
  GAUGE_Y_OFFSET: 50, // Position Y relative en haut de l'écran
};
