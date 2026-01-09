import Phaser from "phaser";
import { DESIGN_CONSTANTS } from "../config/gameConfig.js";
import { formatScore } from "../utils/helpers.js";
import LanguageManager from "../managers/LanguageManager.js";

/**
 * UI Scene - displays score, lives, and game info
 */
export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene" });
    this.languageManager = LanguageManager;
  }

  init(data) {
    this.gameScene = data.gameScene;
    this.budgetManager = this.registry.get("budgetManager");
  }

  create() {
    const padding = 30;

    // Score display
    this.scoreLabel = this.add.text(padding, padding, this.languageManager.getText('ui.score'), {
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

    // Multiplier display
    const currentMultiplier = this.budgetManager ? this.budgetManager.getMultiplier() : 1;
    this.multiplierText = this.add.text(padding, padding + 90, `x${currentMultiplier}`, {
      fontSize: "28px",
      color: "#FF6B35",
      fontFamily: "serif",
      fontStyle: "bold",
    });

    // Lives display
    this.livesLabel = this.add
      .text(800 - padding, padding, this.languageManager.getText('ui.lives'), {
        fontSize: "20px",
        color: "#F4A460",
        fontFamily: "serif",
      })
      .setOrigin(1, 0);

    this.livesContainer = this.add.container(800 - padding, padding + 35);
    this.updateLivesDisplay(DESIGN_CONSTANTS.MAX_LIVES);

    // CASH OUT Button
    this.cashOutButton = this.add.rectangle(
      400, 950,
      300, 60,
      DESIGN_CONSTANTS.COLORS.GOLD
    );
    this.cashOutButton.setStrokeStyle(3, DESIGN_CONSTANTS.COLORS.PRIMARY);
    this.cashOutButton.setInteractive({ useHandCursor: true });
    this.cashOutButton.setAlpha(0.5); // Disabled by default

    this.cashOutText = this.add.text(400, 950, "CASH OUT", {
      fontSize: "28px",
      color: "#000000",
      fontFamily: "serif",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.cashOutText.setAlpha(0.5);

    this.cashOutButton.on("pointerover", () => {
      if (this.cashOutEnabled) {
        this.cashOutButton.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY);
        this.cashOutText.setColor("#FFD700");
      }
    });

    this.cashOutButton.on("pointerout", () => {
      if (this.cashOutEnabled) {
        this.cashOutButton.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
        this.cashOutText.setColor("#000000");
      }
    });

    this.cashOutButton.on("pointerdown", () => {
      if (this.cashOutEnabled) {
        this.gameScene.cashOut();
      }
    });

    // Listen for game events
    this.gameScene.events.on("scoreUpdate", this.updateScore, this);
    this.gameScene.events.on("livesUpdate", this.updateLives, this);
    this.gameScene.events.on("ballStateChange", this.updateCashOutButton, this);
    
    this.cashOutEnabled = true; // Enabled by default (no active balls at start)
  }

  /**
   * Update score display
   */
  updateScore(newScore) {
    this.scoreText.setText(formatScore(newScore));

    // Pulse animation - ENHANCED
    this.tweens.add({
      targets: this.scoreText,
      scale: 1.3,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeOut',
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
   * Update multiplier display
   */
  updateMultiplier(multiplier) {
    this.multiplierText.setText(`x${multiplier}`);
  }

  /**
   * Update cash out button state
   */
  updateCashOutButton(hasActiveBalls) {
    this.cashOutEnabled = !hasActiveBalls;
    
    if (this.cashOutEnabled) {
      this.cashOutButton.setAlpha(1);
      this.cashOutText.setAlpha(1);
    } else {
      this.cashOutButton.setAlpha(0.5);
      this.cashOutText.setAlpha(0.5);
    }
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
      this.gameScene.events.off("budgetUpdate", this.updateBudget, this);
    }
  }
}
