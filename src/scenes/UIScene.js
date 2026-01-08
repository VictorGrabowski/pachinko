import Phaser from "phaser";
import { DESIGN_CONSTANTS } from "../config/gameConfig.js";
import { formatScore } from "../utils/helpers.js";

/**
 * UI Scene - displays score, lives, and game info
 */
export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene" });
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    const padding = 30;

    // Score display
    this.scoreLabel = this.add.text(padding, padding, "得点", {
      fontSize: "20px",
      color: "#F4A460",
      fontFamily: "serif",
    });

    this.scoreText = this.add.text(padding, padding + 30, "0", {
      fontSize: "48px",
      color: "#FFD700",
      fontFamily: "serif",
      fontStyle: "bold",
    });

    // Lives display
    this.livesLabel = this.add
      .text(800 - padding, padding, "残機", {
        fontSize: "20px",
        color: "#F4A460",
        fontFamily: "serif",
      })
      .setOrigin(1, 0);

    this.livesContainer = this.add.container(800 - padding, padding + 35);
    this.updateLivesDisplay(DESIGN_CONSTANTS.MAX_LIVES);

    // Instructions at bottom
    this.add
      .text(400, 50, "クリックで玉を発射", {
        fontSize: "18px",
        color: "#F4A460",
        fontFamily: "serif",
        alpha: 0.7,
      })
      .setOrigin(0.5);

    // Listen for game events
    this.gameScene.events.on("scoreUpdate", this.updateScore, this);
    this.gameScene.events.on("livesUpdate", this.updateLives, this);
  }

  /**
   * Update score display
   */
  updateScore(newScore) {
    this.scoreText.setText(formatScore(newScore));

    // Pulse animation
    this.tweens.add({
      targets: this.scoreText,
      scale: 1.1,
      duration: 100,
      yoyo: true,
    });
  }

  /**
   * Update lives display
   */
  updateLives(newLives) {
    this.updateLivesDisplay(newLives);

    // Shake animation on life lost
    this.cameras.main.shake(200, 0.005);
  }

  /**
   * Create visual lives display (omamori charms)
   */
  updateLivesDisplay(lives) {
    this.livesContainer.removeAll(true);

    for (let i = 0; i < lives; i++) {
      const charm = this.add.circle(
        -i * 35,
        0,
        12,
        DESIGN_CONSTANTS.COLORS.GOLD
      );
      charm.setStrokeStyle(2, 0xffffff);
      this.livesContainer.add(charm);
    }
  }

  /**
   * Clean up event listeners
   */
  shutdown() {
    if (this.gameScene && this.gameScene.events) {
      this.gameScene.events.off("scoreUpdate", this.updateScore, this);
      this.gameScene.events.off("livesUpdate", this.updateLives, this);
    }
  }
}
