import Phaser from "phaser";
import { DESIGN_CONSTANTS } from "../config/gameConfig.js";
import { formatScore } from "../utils/helpers.js";

/**
 * Game Over Scene - displays final score and restart option
 */
export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Background with fade in
    this.add.rectangle(
      centerX,
      centerY,
      800,
      1000,
      DESIGN_CONSTANTS.COLORS.BACKGROUND,
      0.95
    );

    // Sakura petals (slower, more melancholic)
    this.add.particles(0, 0, "petal", {
      x: { min: 0, max: 800 },
      y: -50,
      lifespan: 12000,
      speedY: { min: 30, max: 60 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.5, end: 0.2 },
      alpha: { start: 0.5, end: 0.1 },
      rotate: { start: 0, end: 360 },
      frequency: 600,
    });

    // Game Over text
    this.add
      .text(centerX, 200, "終了", {
        fontSize: "72px",
        color: "#F4A460",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Haiku-inspired message (mono no aware)
    const haiku = this.add
      .text(centerX, 280, "玉は落ち\n時は流れて\nまた巡る", {
        fontSize: "20px",
        color: "#F4A460",
        fontFamily: "serif",
        align: "center",
        lineSpacing: 10,
        alpha: 0,
      })
      .setOrigin(0.5);

    // Score display
    this.add
      .text(centerX, 420, "最終得点", {
        fontSize: "24px",
        color: "#F4A460",
        fontFamily: "serif",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const scoreText = this.add
      .text(centerX, 480, formatScore(this.finalScore), {
        fontSize: "64px",
        color: "#FFD700",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Restart button
    const restartButton = this.add
      .rectangle(centerX, 650, 300, 60, DESIGN_CONSTANTS.COLORS.ACCENT)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0);

    const restartText = this.add
      .text(centerX, 650, "もう一度", {
        fontSize: "28px",
        color: "#FFFFFF",
        fontFamily: "serif",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Menu button
    const menuButton = this.add
      .rectangle(centerX, 740, 300, 60, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0);

    const menuText = this.add
      .text(centerX, 740, "メニューへ", {
        fontSize: "28px",
        color: "#FFFFFF",
        fontFamily: "serif",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Fade in animations
    this.fadeInElements([
      {
        target: this.add
          .text(centerX, 200, "終了", {
            fontSize: "72px",
            color: "#F4A460",
            fontFamily: "serif",
            fontStyle: "bold",
          })
          .setOrigin(0.5)
          .setAlpha(0),
        delay: 0,
      },
      { target: haiku, delay: 500 },
      {
        target: this.add
          .text(centerX, 420, "最終得点", {
            fontSize: "24px",
            color: "#F4A460",
            fontFamily: "serif",
          })
          .setOrigin(0.5)
          .setAlpha(0),
        delay: 1000,
      },
      { target: scoreText, delay: 1200 },
      { target: restartButton, delay: 1800 },
      { target: restartText, delay: 1800 },
      { target: menuButton, delay: 2000 },
      { target: menuText, delay: 2000 },
    ]);

    // Button interactions
    restartButton.on("pointerover", () => {
      restartButton.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
      this.tweens.add({
        targets: restartButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    restartButton.on("pointerout", () => {
      restartButton.setFillStyle(DESIGN_CONSTANTS.COLORS.ACCENT);
      this.tweens.add({
        targets: restartButton,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    restartButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => {
        this.scene.start("GameScene");
      });
    });

    menuButton.on("pointerover", () => {
      menuButton.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 0.5);
      this.tweens.add({
        targets: menuButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    menuButton.on("pointerout", () => {
      menuButton.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.5);
      this.tweens.add({
        targets: menuButton,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    menuButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => {
        this.scene.start("MenuScene");
      });
    });
  }

  /**
   * Fade in UI elements sequentially
   */
  fadeInElements(elements) {
    elements.forEach(({ target, delay }) => {
      this.tweens.add({
        targets: target,
        alpha: 1,
        duration: 800,
        delay: delay,
        ease: "Sine.easeInOut",
      });
    });
  }
}
