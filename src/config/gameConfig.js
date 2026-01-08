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
      gravity: { y: 600 },
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
  BOUNCE_FACTOR: 0.8,
  MAX_LIVES: 5,
  COMBO_THRESHOLD: 3,
  MA_INTERVAL: 150, // Silence interval (ma concept)
};

// Bucket configuration with Japanese aesthetic (大中小 pattern)
export const BUCKET_CONFIG = [
  { value: 10, label: "小", color: 0x4a90e2 },
  { value: 30, label: "中", color: 0x7b68ee },
  { value: 50, label: "大", color: 0xff6b35 },
  { value: 100, label: "特", color: 0xffd700 },
  { value: 50, label: "大", color: 0xff6b35 },
  { value: 30, label: "中", color: 0x7b68ee },
  { value: 10, label: "小", color: 0x4a90e2 },
];

// Traductions du jeu en français
export const TRANSLATIONS = {
  menu: {
    title: "PACHINKO",
    subtitle: "Le son des billes qui tombent\nRésonne dans le cœur\nBeauté japonaise",
    startButton: "Commencer",
    instructions: "Cliquez pour lancer une bille\nEnchaînez les combos pour un score élevé !",
    paletteTitle: "Palette de couleurs",
  },
  ui: {
    score: "Score",
    lives: "Vies",
    instruction: "Cliquez pour lancer une bille",
  },
  game: {
    combo: "Combo",
  },
  gameOver: {
    title: "Partie Terminée",
    haiku: "Les billes tombent\nLe temps s'écoule\nEt revient encore",
    finalScore: "Score Final",
    restart: "Rejouer",
    menu: "Menu Principal",
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
    },
  },
};

// Gestion de la palette active
export function setActivePalette(paletteName) {
  if (COLOR_PALETTES[paletteName]) {
    Object.assign(DESIGN_CONSTANTS.COLORS, COLOR_PALETTES[paletteName].colors);
    localStorage.setItem('pachinko_active_palette', paletteName);
  }
}

export function getActivePalette() {
  return localStorage.getItem('pachinko_active_palette') || 'classic';
}

export function initPalette() {
  const savedPalette = getActivePalette();
  setActivePalette(savedPalette);
}
