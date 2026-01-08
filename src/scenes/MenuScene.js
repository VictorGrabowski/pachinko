import Phaser from "phaser";
import { DESIGN_CONSTANTS, TRANSLATIONS, COLOR_PALETTES, getActivePalette, setActivePalette } from "../config/gameConfig.js";
import { CATEGORY_LABELS } from "../config/featureConfig.js";
import FeatureManager from "../managers/FeatureManager.js";
import ModalComponent from "../components/ModalComponent.js";

/**
 * Menu scene - main game menu
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
    this.settingsOverlay = null;
    this.modal = null;
  }

  create() {
    const centerX = 400; // Fixed game width / 2
    const centerY = 500; // Fixed game height / 2

    // Initialize FeatureManager
    FeatureManager.init();

    // Create modal component
    this.modal = new ModalComponent(this);

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
      .rectangle(centerX, 760, 300, 60, DESIGN_CONSTANTS.COLORS.ACCENT)
      .setInteractive({ useHandCursor: true });

    const startText = this.add
      .text(centerX, 760, TRANSLATIONS.menu.startButton, {
        fontSize: "32px",
        color: "#FFFFFF",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    // Settings button
    const settingsButton = this.add
      .rectangle(centerX, 590, 300, 60, 0x555555)
      .setInteractive({ useHandCursor: true });

    const settingsText = this.add
      .text(centerX, 590, "⚙️ SETTINGS", {
        fontSize: "28px",
        color: "#FFFFFF",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    // Start button interactions
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
        this.scene.start("BettingScene");
      });
    });

    // Settings button interactions
    settingsButton.on("pointerover", () => {
      settingsButton.setFillStyle(0x777777);
      this.tweens.add({
        targets: settingsButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    settingsButton.on("pointerout", () => {
      settingsButton.setFillStyle(0x555555);
      this.tweens.add({
        targets: settingsButton,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    settingsButton.on("pointerdown", () => {
      this.openSettingsOverlay();
    });

    // Instructions
    this.add
      .text(
        centerX,
        900,
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

  /**
   * Open settings overlay
   */
  openSettingsOverlay() {
    if (this.settingsOverlay) {
      return; // Already open
    }

    // Create container for settings
    this.settingsOverlay = this.add.container(0, 0);
    this.settingsOverlay.setDepth(999);

    // Background dimmer
    const dimmer = this.add.rectangle(400, 500, 800, 1000, 0x000000, 0.85);
    dimmer.setInteractive();
    this.settingsOverlay.add(dimmer);

    // Settings panel background
    const panelWidth = 700;
    const panelHeight = 800;
    const panelBg = this.add.rectangle(
      400, 500, panelWidth, panelHeight,
      DESIGN_CONSTANTS.COLORS.BACKGROUND
    );
    panelBg.setStrokeStyle(4, DESIGN_CONSTANTS.COLORS.GOLD);
    this.settingsOverlay.add(panelBg);

    // Title
    const title = this.add.text(400, 140, "⚙️ CONFIGURATION", {
      fontSize: "36px",
      fontFamily: "serif",
      color: "#ffd700",
      fontStyle: "bold"
    }).setOrigin(0.5);
    this.settingsOverlay.add(title);

    // Description
    const desc = this.add.text(400, 185, "Configurez les fonctionnalités du jeu", {
      fontSize: "18px",
      fontFamily: "serif",
      color: "#ffb7c5",
      alpha: 0.9
    }).setOrigin(0.5);
    this.settingsOverlay.add(desc);

    // Get features grouped by category
    const featuresByCategory = FeatureManager.getFeaturesByCategory();
    
    let yPos = 230;

    // Render features by category
    Object.keys(featuresByCategory).forEach(category => {
      // Category header
      const categoryLabel = CATEGORY_LABELS[category] || category;
      const categoryHeader = this.add.text(120, yPos, categoryLabel, {
        fontSize: "24px",
        fontFamily: "serif",
        color: "#f4a460",
        fontStyle: "bold"
      });
      this.settingsOverlay.add(categoryHeader);
      yPos += 40;

      // Features in this category
      featuresByCategory[category].forEach(feature => {
        const featureRow = this.createFeatureRow(feature, yPos, panelWidth);
        yPos += 80;
      });

      yPos += 10; // Extra space between categories
    });

    // Close button
    const closeBtn = this.add.rectangle(400, 850, 200, 50, DESIGN_CONSTANTS.COLORS.ACCENT);
    closeBtn.setStrokeStyle(2, 0xffffff);
    closeBtn.setInteractive({ useHandCursor: true });
    this.settingsOverlay.add(closeBtn);

    const closeText = this.add.text(400, 850, "FERMER", {
      fontSize: "24px",
      fontFamily: "serif",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5);
    this.settingsOverlay.add(closeText);

    // Close button interactions
    closeBtn.on('pointerover', () => {
      closeBtn.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
      this.tweens.add({
        targets: closeBtn,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100
      });
    });

    closeBtn.on('pointerout', () => {
      closeBtn.setFillStyle(DESIGN_CONSTANTS.COLORS.ACCENT);
      this.tweens.add({
        targets: closeBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
    });

    closeBtn.on('pointerdown', () => {
      this.closeSettingsOverlay();
    });

    // Fade in animation
    this.settingsOverlay.setAlpha(0);
    this.tweens.add({
      targets: this.settingsOverlay,
      alpha: 1,
      duration: 250,
      ease: 'Power2'
    });
  }

  /**
   * Create a feature row with toggle and configure button
   * @param {Object} feature - Feature definition
   * @param {number} y - Y position
   * @param {number} panelWidth - Panel width
   */
  createFeatureRow(feature, y, panelWidth) {
    const leftMargin = 120;

    // Checkbox/toggle
    const checkboxSize = 24;
    const checkbox = this.add.rectangle(
      leftMargin, y,
      checkboxSize, checkboxSize,
      feature.enabled ? DESIGN_CONSTANTS.COLORS.GOLD : 0x333333
    );
    checkbox.setStrokeStyle(2, feature.enabled ? DESIGN_CONSTANTS.COLORS.GOLD : 0x888888);
    checkbox.setInteractive({ useHandCursor: true });
    this.settingsOverlay.add(checkbox);

    // Checkmark
    let checkmark = null;
    if (feature.enabled) {
      checkmark = this.add.text(leftMargin, y, "✓", {
        fontSize: "20px",
        color: "#000000",
        fontStyle: "bold"
      }).setOrigin(0.5);
      this.settingsOverlay.add(checkmark);
    }

    // Feature name
    const nameText = this.add.text(leftMargin + 40, y - 8, feature.name, {
      fontSize: "20px",
      fontFamily: "serif",
      color: feature.enabled ? "#ffffff" : "#888888",
      fontStyle: feature.enabled ? "bold" : "normal"
    });
    this.settingsOverlay.add(nameText);

    // Feature description
    const descText = this.add.text(leftMargin + 40, y + 12, feature.description, {
      fontSize: "14px",
      fontFamily: "serif",
      color: "#aaaaaa",
      wordWrap: { width: 350 }
    });
    this.settingsOverlay.add(descText);

    // Configure button (only if feature has parameters)
    let configBtn = null;
    let configText = null;
    if (feature.parameters && feature.parameters.length > 0) {
      configBtn = this.add.rectangle(
        620, y,
        120, 40,
        feature.enabled ? DESIGN_CONSTANTS.COLORS.PRIMARY : 0x444444
      );
      configBtn.setStrokeStyle(2, feature.enabled ? 0xffffff : 0x666666);
      if (feature.enabled) {
        configBtn.setInteractive({ useHandCursor: true });
      }
      this.settingsOverlay.add(configBtn);

      configText = this.add.text(620, y, "Configurer", {
        fontSize: "16px",
        fontFamily: "serif",
        color: feature.enabled ? "#ffffff" : "#666666"
      }).setOrigin(0.5);
      this.settingsOverlay.add(configText);

      // Configure button click
      if (feature.enabled) {
        configBtn.on('pointerover', () => {
          configBtn.setFillStyle(DESIGN_CONSTANTS.COLORS.ACCENT);
          this.tweens.add({
            targets: configBtn,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 100
          });
        });

        configBtn.on('pointerout', () => {
          configBtn.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY);
          this.tweens.add({
            targets: configBtn,
            scaleX: 1,
            scaleY: 1,
            duration: 100
          });
        });

        configBtn.on('pointerdown', () => {
          this.openFeatureConfigModal(feature);
        });
      }
    }

    // Checkbox toggle click
    checkbox.on('pointerdown', () => {
      FeatureManager.toggleFeature(feature.id);
      feature.enabled = !feature.enabled;

      // Update visual
      checkbox.setFillStyle(feature.enabled ? DESIGN_CONSTANTS.COLORS.GOLD : 0x333333);
      checkbox.setStrokeStyle(2, feature.enabled ? DESIGN_CONSTANTS.COLORS.GOLD : 0x888888);
      
      if (feature.enabled && !checkmark) {
        checkmark = this.add.text(leftMargin, y, "✓", {
          fontSize: "20px",
          color: "#000000",
          fontStyle: "bold"
        }).setOrigin(0.5);
        this.settingsOverlay.add(checkmark);
      } else if (!feature.enabled && checkmark) {
        checkmark.destroy();
        checkmark = null;
      }

      // Update text colors
      nameText.setColor(feature.enabled ? "#ffffff" : "#888888");
      nameText.setFontStyle(feature.enabled ? "bold" : "normal");

      // Update configure button
      if (configBtn) {
        configBtn.setFillStyle(feature.enabled ? DESIGN_CONSTANTS.COLORS.PRIMARY : 0x444444);
        configBtn.setStrokeStyle(2, feature.enabled ? 0xffffff : 0x666666);
        configText.setColor(feature.enabled ? "#ffffff" : "#666666");

        if (feature.enabled) {
          configBtn.setInteractive({ useHandCursor: true });
        } else {
          configBtn.removeInteractive();
        }
      }

      // Save configuration
      FeatureManager.saveConfig();
    });
  }

  /**
   * Open modal to configure a feature's parameters
   * @param {Object} feature - Feature definition
   */
  openFeatureConfigModal(feature) {
    this.modal.show(feature, feature.parameterValues, (updatedValues) => {
      // Save updated values
      Object.keys(updatedValues).forEach(key => {
        FeatureManager.setParameter(feature.id, key, updatedValues[key]);
      });
      FeatureManager.saveConfig();
      
      console.log(`[MenuScene] Updated ${feature.name}:`, updatedValues);
    });
  }

  /**
   * Close settings overlay
   */
  closeSettingsOverlay() {
    if (!this.settingsOverlay) {
      return;
    }

    this.tweens.add({
      targets: this.settingsOverlay,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        if (this.settingsOverlay) {
          this.settingsOverlay.destroy();
          this.settingsOverlay = null;
        }
      }
    });
  }
}
