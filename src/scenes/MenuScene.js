import Phaser from "phaser";
import { DESIGN_CONSTANTS, TRANSLATIONS, COLOR_PALETTES, getActivePalette, setActivePalette } from "../config/gameConfig.js";

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

    // Palette selector
    this.createPaletteSelector(centerX);
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

  /**
   * Create palette selector
   */
  createPaletteSelector(centerX) {
    // Titre
    this.add
      .text(centerX, 800, TRANSLATIONS.menu.paletteTitle, {
        fontSize: "18px",
        color: "#F4A460",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    // Boutons de palette
    const paletteKeys = Object.keys(COLOR_PALETTES);
    const activePalette = getActivePalette();
    const buttonWidth = 120;
    const spacing = 10;
    const totalWidth = paletteKeys.length * (buttonWidth + spacing) - spacing;
    const startX = centerX - totalWidth / 2;

    paletteKeys.forEach((key, index) => {
      const palette = COLOR_PALETTES[key];
      const x = startX + index * (buttonWidth + spacing) + buttonWidth / 2;
      const y = 850;
      const isActive = key === activePalette;

      // Bouton
      const button = this.add
        .rectangle(
          x,
          y,
          buttonWidth,
          50,
          palette.colors.PRIMARY,
          isActive ? 1 : 0.5
        )
        .setInteractive({ useHandCursor: true });

      if (isActive) {
        button.setStrokeStyle(3, palette.colors.GOLD);
      }

      // Label
      const label = this.add
        .text(x, y, palette.name, {
          fontSize: "14px",
          color: "#FFFFFF",
          fontFamily: "serif",
          align: "center",
        })
        .setOrigin(0.5);

      // Interactions
      button.on("pointerover", () => {
        if (key !== getActivePalette()) {
          button.setAlpha(0.8);
          this.tweens.add({
            targets: button,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 150,
          });
        }
      });

      button.on("pointerout", () => {
        button.setAlpha(key === getActivePalette() ? 1 : 0.5);
        this.tweens.add({
          targets: button,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
        });
      });

      button.on("pointerdown", () => {
        setActivePalette(key);
        // Recharger la scène pour appliquer les nouvelles couleurs
        this.scene.restart();
      });
    });
  }
}
