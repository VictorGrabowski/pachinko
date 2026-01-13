import Phaser from 'phaser';
import { GAME_CONFIG, initPalette } from './config/gameConfig.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import BettingScene from './scenes/BettingScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import ScoreboardScene from './scenes/ScoreboardScene.js';
import AchievementsScene from './scenes/AchievementsScene.js';

// Initialiser la palette sauvegardée
initPalette();

// Populate game configuration with scenes
GAME_CONFIG.scene = [
  BootScene,
  PreloadScene,
  MenuScene,
  BettingScene,
  GameScene,
  UIScene,
  GameOverScene,
  ScoreboardScene,
  AchievementsScene
];

// Initialize the Phaser game
const game = new Phaser.Game(GAME_CONFIG);

// Export game instance for debugging
window.game = game;
