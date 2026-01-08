import Phaser from "phaser";
import { DESIGN_CONSTANTS, TRANSLATIONS } from "../config/gameConfig.js";

/**
 * Menu scene - main game menu
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create() {
    const centerX = 400; // Fixed game width / 2
    const centerY = 500; // Fixed game height / 2

    // Background
    this.add.rectangle(
      centerX,
      centerY,
      800,
      1000,
      DESIGN_CONSTANTS.COLORS.BACKGROUND
    );

    // Sakura petals
    this.createSakuraEffect();

    // Title with Japanese aesthetic
    this.add
      .text(centerX, 200, "パチンコ", {
        fontSize: "72px",
        color: "#F4A460",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 280, TRANSLATIONS.menu.title, {
        fontSize: "32px",
        color: "#FFD700",
        fontFamily: "serif",
        letterSpacing: 8,
      })
      .setOrigin(0.5);

    // Subtitle with haiku-inspired text
    this.add
      .text(centerX, 340, TRANSLATIONS.menu.subtitle, {
        fontSize: "18px",
        color: "#F4A460",
        fontFamily: "serif",
        align: "center",
        lineSpacing: 8,
        alpha: 0.8,
      })
      .setOrigin(0.5);

    // Start button
    const startButton = this.add
      .rectangle(centerX, 500, 300, 60, DESIGN_CONSTANTS.COLORS.ACCENT)
      .setInteractive({ useHandCursor: true });

    const startText = this.add
      .text(centerX, 500, TRANSLATIONS.menu.startButton, {
        fontSize: "32px",
        color: "#FFFFFF",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    // Button interactions
    startButton.on("pointerover", () => {
      startButton.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
      this.tweens.add({
        targets: startButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    startButton.on("pointerout", () => {
      startButton.setFillStyle(DESIGN_CONSTANTS.COLORS.ACCENT);
      this.tweens.add({
        targets: startButton,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    startButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => {
        this.scene.start("GameScene");
      });
    });

    // Instructions
    this.add
      .text(
        centerX,
        700,
        TRANSLATIONS.menu.instructions,
        {
          fontSize: "20px",
          color: "#F4A460",
          fontFamily: "serif",
          align: "center",
          lineSpacing: 10,
          alpha: 0.7,
        }
      )
      .setOrigin(0.5);
  }

  /**
   * Create sakura petal falling effect
   */
  createSakuraEffect() {
    this.add.particles(0, 0, "petal", {
      x: { min: 0, max: 800 },
      y: -50,
      lifespan: 8000,
      speedY: { min: 50, max: 100 },
      speedX: { min: -20, max: 20 },
      scale: { start: 0.4, end: 0.2 },
      alpha: { start: 0.8, end: 0.3 },
      rotate: { start: 0, end: 360 },
      frequency: 300,
    });
  }
}
