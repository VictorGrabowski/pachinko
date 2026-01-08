import Phaser from 'phaser';
import { GAME_CONFIG } from './config/gameConfig.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import GameOverScene from './scenes/GameOverScene.js';

// Populate game configuration with scenes
GAME_CONFIG.scene = [
  BootScene,
  PreloadScene,
  MenuScene,
  GameScene,
  UIScene,
  GameOverScene
];

// Initialize the Phaser game
const game = new Phaser.Game(GAME_CONFIG);

// Export game instance for debugging
window.game = game;
