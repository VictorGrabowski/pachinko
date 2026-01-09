import Phaser from "phaser";
import { DESIGN_CONSTANTS, TRANSLATIONS, COLOR_PALETTES, getActivePalette, setActivePalette } from "../config/gameConfig.js";
import { CATEGORY_LABELS } from "../config/featureConfig.js";
import FeatureManager from "../managers/FeatureManager.js";
import LanguageManager from "../managers/LanguageManager.js";
import StateManager from "../managers/StateManager.js";
import ModalComponent from "../components/ModalComponent.js";

/**
 * Menu scene - main game menu
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
    this.settingsOverlay = null;
    this.modal = null;
    this.languageManager = LanguageManager;
    this.stateManager = new StateManager();
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
      .text(centerX, 280, this.languageManager.getText('menu.title'), {
        fontSize: "32px",
        color: "#FFD700",
        fontFamily: "serif",
        letterSpacing: 8,
      })
      .setOrigin(0.5);

    // Subtitle with haiku-inspired text
    this.add
      .text(centerX, 340, this.languageManager.getText('menu.subtitle'), {
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
      .rectangle(centerX, 500, 400, 70, DESIGN_CONSTANTS.COLORS.ACCENT)
      .setInteractive({ useHandCursor: true });
    startButton.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.GOLD, 0.5);

    const startText = this.add
      .text(centerX, 500, this.languageManager.getText('menu.startButton'), {
        fontSize: "32px",
        color: "#FFFFFF",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Settings button
    const settingsButton = this.add
      .rectangle(centerX, 590, 400, 60, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.3)
      .setInteractive({ useHandCursor: true });
    settingsButton.setStrokeStyle(1, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.8);

    const settingsText = this.add
      .text(centerX, 590, this.languageManager.getText('menu.settings'), {
        fontSize: "24px",
        color: "#F4A460",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    // Scoreboard button
    const scoreboardButton = this.add
      .rectangle(centerX, 665, 400, 60, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.3)
      .setInteractive({ useHandCursor: true });
    scoreboardButton.setStrokeStyle(1, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.8);

    const scoreboardText = this.add
      .text(centerX, 665, this.languageManager.getText('menu.scoreboardButton'), {
        fontSize: "24px",
        color: "#F4A460",
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

    // Scoreboard button interactions
    scoreboardButton.on("pointerover", () => {
      scoreboardButton.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
      this.tweens.add({
        targets: scoreboardButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    scoreboardButton.on("pointerout", () => {
      scoreboardButton.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY);
      this.tweens.add({
        targets: scoreboardButton,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    scoreboardButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => {
        this.scene.start("ScoreboardScene");
      });
    });

    // Instructions
    this.add
      .text(
        centerX,
        900,
        this.languageManager.getText('menu.instructions'),
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

  /**
   * Create palette selector
   */
  createPaletteSelector(container, leftMargin, yPos) {
    // Titre
    const title = this.add.text(leftMargin, yPos, this.languageManager.getText('menu.paletteTitle'), {
      fontSize: "20px",
      color: "#f4a460",
      fontFamily: "serif",
      fontStyle: "bold"
    });
    container.add(title);

    // Boutons de palette
    const paletteKeys = Object.keys(COLOR_PALETTES);
    const activePalette = getActivePalette();
    const buttonWidth = 100;
    const spacing = 8;

    paletteKeys.forEach((key, index) => {
      const palette = COLOR_PALETTES[key];
      const x = leftMargin + index * (buttonWidth + spacing) + buttonWidth / 2;
      const y = yPos + 40;
      const isActive = key === activePalette;

      // Bouton
      const button = this.add
        .rectangle(
          x,
          y,
          buttonWidth,
          45,
          palette.colors.PRIMARY,
          isActive ? 1 : 0.5
        )
        .setInteractive({ useHandCursor: true });

      if (isActive) {
        button.setStrokeStyle(3, palette.colors.GOLD);
      }

      container.add(button);

      // Label
      const label = this.add
        .text(x, y, palette.name, {
          fontSize: "13px",
          color: "#FFFFFF",
          fontFamily: "serif",
          align: "center",
        })
        .setOrigin(0.5);

      container.add(label);

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
        // Destroy overlay immediately then restart scene
        if (this.settingsOverlay) {
          this.settingsOverlay.destroy();
          this.settingsOverlay = null;
        }
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

    // Calculate panel height dynamically based on content
    const featuresByCategory = FeatureManager.getFeaturesByCategory();
    const numCategories = Object.keys(featuresByCategory).length;
    const numFeatures = Object.values(featuresByCategory).reduce((sum, features) => sum + features.length, 0);
    
    // Base height: title(80) + lang(60) + palette(90) + reset(80) + closeBtn(70) = 380
    // Categories: header(50) * numCategories + features(80) * numFeatures + spacing(10) * (numCategories-1)
    const baseHeight = 380;
    const contentHeight = baseHeight + (50 * numCategories) + (80 * numFeatures) + (10 * Math.max(0, numCategories - 1));
    const panelHeight = Math.min(900, Math.max(600, contentHeight));
    
    // Settings panel background
    const panelWidth = 700;
    const panelCenterY = 500;
    const panelTop = panelCenterY - panelHeight / 2;
    const panelBottom = panelCenterY + panelHeight / 2;
    
    const panelBg = this.add.rectangle(
      400, panelCenterY, panelWidth, panelHeight,
      DESIGN_CONSTANTS.COLORS.BACKGROUND
    );
    panelBg.setStrokeStyle(4, DESIGN_CONSTANTS.COLORS.GOLD);
    this.settingsOverlay.add(panelBg);
    
    // Add subtle inner shadow effect
    const shadowTop = this.add.rectangle(400, panelTop + 2, panelWidth - 8, 4, 0x000000, 0.3);
    this.settingsOverlay.add(shadowTop);

    // Title
    const title = this.add.text(400, panelTop + 50, "CONFIGURATION", {
      fontSize: "42px",
      fontFamily: "serif",
      color: DESIGN_CONSTANTS.COLORS.GOLD,
      fontStyle: "bold",
      letterSpacing: 6
    }).setOrigin(0.5);
    this.settingsOverlay.add(title);

    // Decorative lines (double)
    const lineLeft = this.add.rectangle(300, panelTop + 78, 80, 2, DESIGN_CONSTANTS.COLORS.GOLD, 0.6);
    const lineRight = this.add.rectangle(500, panelTop + 78, 80, 2, DESIGN_CONSTANTS.COLORS.GOLD, 0.6);
    this.settingsOverlay.add(lineLeft);
    this.settingsOverlay.add(lineRight);

    // Description
    const desc = this.add.text(400, panelTop + 105, "Configurez les fonctionnalités du jeu", {
      fontSize: "16px",
      fontFamily: "serif",
      color: DESIGN_CONSTANTS.COLORS.SAKURA,
      alpha: 0.9
    }).setOrigin(0.5);
    this.settingsOverlay.add(desc);

    let yPos = panelTop + 145;

    // Language selector
    this.createLanguageSelector(this.settingsOverlay, yPos);
    yPos += 70;

    // Palette selector
    this.createPaletteSelector(this.settingsOverlay, 120, yPos);
    yPos += 95;
    
    // Separator line
    const separator1 = this.add.rectangle(400, yPos, panelWidth - 100, 1, DESIGN_CONSTANTS.COLORS.GOLD, 0.2);
    this.settingsOverlay.add(separator1);
    yPos += 20;

    // Reset scoreboard button
    this.createResetScoreboardButton(this.settingsOverlay, yPos);
    yPos += 70;
    
    // Separator line
    const separator2 = this.add.rectangle(400, yPos, panelWidth - 100, 1, DESIGN_CONSTANTS.COLORS.GOLD, 0.2);
    this.settingsOverlay.add(separator2);
    yPos += 25;

    // Store start position for features section
    const featuresStartY = yPos;
    const maxFeaturesHeight = panelBottom - yPos - 80; // Leave space for close button
    
    // Create scrollable container for features
    const featuresContainer = this.add.container(0, 0);
    this.settingsOverlay.add(featuresContainer);
    
    // Create mask for features container
    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(50, featuresStartY, 700, maxFeaturesHeight);
    const mask = maskShape.createGeometryMask();
    featuresContainer.setMask(mask);
    
    let featuresYPos = 0; // Relative Y position within features container

    // Render features by category (already retrieved above)
    Object.keys(featuresByCategory).forEach(category => {
      // Category header with background
      const categoryLabel = CATEGORY_LABELS[category] || category;
      
      // Background for category
      const categoryBg = this.add.rectangle(400, featuresStartY + featuresYPos + 5, panelWidth - 60, 35, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.15);
      categoryBg.setStrokeStyle(1, DESIGN_CONSTANTS.COLORS.GOLD, 0.3);
      featuresContainer.add(categoryBg);
      
      const categoryHeader = this.add.text(400, featuresStartY + featuresYPos + 5, categoryLabel, {
        fontSize: "22px",
        fontFamily: "serif",
        color: DESIGN_CONSTANTS.COLORS.GOLD,
        fontStyle: "bold",
        letterSpacing: 3
      }).setOrigin(0.5);
      featuresContainer.add(categoryHeader);
      
      featuresYPos += 55;

      // Features in this category
      featuresByCategory[category].forEach(feature => {
        const featureRow = this.createFeatureRow(feature, featuresStartY + featuresYPos, panelWidth, featuresContainer);
        featuresYPos += 85;
      });

      featuresYPos += 15; // Extra space between categories
    });
    
    // Total height of features content
    const totalFeaturesHeight = featuresYPos;
    const needsScroll = totalFeaturesHeight > maxFeaturesHeight;
    
    // Add scroll functionality if needed
    if (needsScroll) {
      let scrollY = 0;
      const maxScroll = totalFeaturesHeight - maxFeaturesHeight;
      
      // Scroll indicators
      const scrollUpIndicator = this.add.text(750, featuresStartY + 10, "▲", {
        fontSize: "20px",
        color: DESIGN_CONSTANTS.COLORS.GOLD,
        alpha: 0
      }).setOrigin(0.5);
      this.settingsOverlay.add(scrollUpIndicator);
      
      const scrollDownIndicator = this.add.text(750, featuresStartY + maxFeaturesHeight - 10, "▼", {
        fontSize: "20px",
        color: DESIGN_CONSTANTS.COLORS.GOLD
      }).setOrigin(0.5);
      this.settingsOverlay.add(scrollDownIndicator);
      
      // Add pulsing animation to down indicator
      this.tweens.add({
        targets: scrollDownIndicator,
        alpha: 0.3,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
      
      // Mouse wheel scroll
      this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
        if (!this.settingsOverlay) return;
        
        scrollY = Phaser.Math.Clamp(scrollY + deltaY * 0.5, 0, maxScroll);
        
        // Move features container
        featuresContainer.y = -scrollY;
        
        // Update indicators
        scrollUpIndicator.setAlpha(scrollY > 0 ? 1 : 0);
        scrollDownIndicator.setAlpha(scrollY < maxScroll ? 1 : 0);
      });
    }

    // Close button - positioned at bottom of panel with better styling
    const closeBtnY = panelBottom - 40;
    const closeBtn = this.add.rectangle(400, closeBtnY, 240, 55, DESIGN_CONSTANTS.COLORS.ACCENT);
    closeBtn.setStrokeStyle(3, DESIGN_CONSTANTS.COLORS.GOLD, 0.8);
    closeBtn.setInteractive({ useHandCursor: true });
    this.settingsOverlay.add(closeBtn);

    const closeText = this.add.text(400, closeBtnY, "FERMER", {
      fontSize: "26px",
      fontFamily: "serif",
      color: "#ffffff",
      fontStyle: "bold",
      letterSpacing: 2
    }).setOrigin(0.5);
    this.settingsOverlay.add(closeText);

    // Close button interactions
    closeBtn.on('pointerover', () => {
      closeBtn.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
      closeText.setColor("#000000");
      this.tweens.add({
        targets: [closeBtn, closeText],
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });

    closeBtn.on('pointerout', () => {
      closeBtn.setFillStyle(DESIGN_CONSTANTS.COLORS.ACCENT);
      closeText.setColor("#ffffff");
      this.tweens.add({
        targets: [closeBtn, closeText],
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Back.easeIn'
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
   * @param {Phaser.GameObjects.Container} targetContainer - Container to add elements to (defaults to settingsOverlay)
   */
  createFeatureRow(feature, y, panelWidth, targetContainer = null) {
    const container = targetContainer || this.settingsOverlay;
    const panelCenterX = 400;
    const leftMargin = panelCenterX - panelWidth / 2 + 70;

    // Checkbox/toggle
    const checkboxSize = 24;
    const checkbox = this.add.circle(
      leftMargin, y,
      checkboxSize / 2,
      feature.enabled ? DESIGN_CONSTANTS.COLORS.GOLD : 0x333333
    );
    checkbox.setStrokeStyle(3, feature.enabled ? DESIGN_CONSTANTS.COLORS.GOLD : 0x666666);
    checkbox.setInteractive({ useHandCursor: true });
    container.add(checkbox);

    // Inner circle for enabled state
    let checkmark = null;
    if (feature.enabled) {
      checkmark = this.add.circle(leftMargin, y, 7, DESIGN_CONSTANTS.COLORS.PRIMARY);
      container.add(checkmark);
    }

    // Feature name
    const nameText = this.add.text(leftMargin + 45, y - 10, feature.name, {
      fontSize: "21px",
      fontFamily: "serif",
      color: feature.enabled ? "#ffffff" : "#888888",
      fontStyle: feature.enabled ? "bold" : "normal",
      letterSpacing: 0.5
    });
    container.add(nameText);

    // Feature description
    const descText = this.add.text(leftMargin + 45, y + 13, feature.description, {
      fontSize: "14px",
      fontFamily: "serif",
      color: feature.enabled ? "#bbbbbb" : "#777777",
      wordWrap: { width: 350 }
    });
    container.add(descText);

    // Configure button (only if feature has parameters)
    let configBtn = null;
    let configText = null;
    if (feature.parameters && feature.parameters.length > 0) {
      const configBtnX = panelCenterX + panelWidth / 2 - 80;
      configBtn = this.add.rectangle(
        configBtnX, y,
        130, 45,
        feature.enabled ? DESIGN_CONSTANTS.COLORS.PRIMARY : 0x444444
      );
      configBtn.setStrokeStyle(2, feature.enabled ? DESIGN_CONSTANTS.COLORS.GOLD : 0x666666);
      if (feature.enabled) {
        configBtn.setInteractive({ useHandCursor: true });
      }
      container.add(configBtn);

      configText = this.add.text(configBtnX, y, "Configurer", {
        fontSize: "17px",
        fontFamily: "serif",
        color: feature.enabled ? "#ffffff" : "#666666",
        letterSpacing: 0.5
      }).setOrigin(0.5);
      container.add(configText);

      // Configure button click
      if (feature.enabled) {
        configBtn.on('pointerover', () => {
          configBtn.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
          configText.setColor("#000000");
          this.tweens.add({
            targets: [configBtn, configText],
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 120,
            ease: 'Back.easeOut'
          });
        });

        configBtn.on('pointerout', () => {
          configBtn.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY);
          configText.setColor("#ffffff");
          this.tweens.add({
            targets: [configBtn, configText],
            scaleX: 1,
            scaleY: 1,
            duration: 120
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
        container.add(checkmark);
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
    // Get current parameter values from FeatureManager
    const currentValues = {};
    if (feature.parameters && feature.parameters.length > 0) {
      feature.parameters.forEach(param => {
        currentValues[param.key] = FeatureManager.getParameter(feature.id, param.key);
      });
    }
    
    this.modal.show(feature, currentValues, (updatedValues) => {
      // Save updated values
      Object.keys(updatedValues).forEach(key => {
        FeatureManager.setParameter(feature.id, key, updatedValues[key]);
      });
      FeatureManager.saveConfig();
      
      // Update AudioSystem if sound overlap setting changed
      if (feature.id === 'sounds' && updatedValues.allowOverlap !== undefined) {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.audioSystem) {
          gameScene.audioSystem.setAllowOverlap(updatedValues.allowOverlap);
        }
      }
      
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

    // Kill any tweens on the overlay
    this.tweens.killTweensOf(this.settingsOverlay);

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

  /**
   * Create language selector in settings
   * @param {Phaser.GameObjects.Container} container - Settings container
   * @param {number} y - Y position
   */
  createLanguageSelector(container, y) {
    const leftMargin = 120;

    // Label
    const label = this.add.text(leftMargin, y, this.languageManager.getText('menu.language'), {
      fontSize: "24px",
      fontFamily: "serif",
      color: "#f4a460",
      fontStyle: "bold"
    });
    container.add(label);

    // Language buttons
    const languages = [
      { code: 'fr', abbr: 'FR', name: 'Français' },
      { code: 'en', abbr: 'EN', name: 'English' }
    ];

    const currentLang = this.languageManager.getCurrentLanguage();
    const buttonWidth = 120;
    const buttonSpacing = 20;
    const startX = leftMargin + 180;

    languages.forEach((lang, index) => {
      const x = startX + index * (buttonWidth + buttonSpacing);
      const isActive = lang.code === currentLang;

      // Button
      const button = this.add.rectangle(
        x, y,
        buttonWidth, 40,
        isActive ? DESIGN_CONSTANTS.COLORS.GOLD : 0x555555
      );
      button.setStrokeStyle(2, isActive ? DESIGN_CONSTANTS.COLORS.GOLD : 0x888888);
      button.setInteractive({ useHandCursor: true });
      container.add(button);

      // Abbreviation and name
      const abbr = this.add.text(x, y - 8, lang.abbr, {
        fontSize: "18px",
        fontFamily: "serif",
        color: isActive ? DESIGN_CONSTANTS.COLORS.GOLD : DESIGN_CONSTANTS.COLORS.PRIMARY,
        fontStyle: "bold"
      }).setOrigin(0.5);
      container.add(abbr);
      
      const name = this.add.text(x, y + 10, lang.name, {
        fontSize: "12px",
        fontFamily: "serif",
        color: isActive ? "#000000" : "#AAAAAA"
      }).setOrigin(0.5);
      container.add(name);

      // Hover effect
      button.on('pointerover', () => {
        if (!isActive) {
          button.setFillStyle(0x777777);
        }
      });

      button.on('pointerout', () => {
        if (!isActive) {
          button.setFillStyle(0x555555);
        }
      });

      // Click handler
      button.on('pointerdown', () => {
        if (!isActive) {
          this.languageManager.setLanguage(lang.code);
          // Destroy overlay immediately then restart scene
          if (this.settingsOverlay) {
            this.settingsOverlay.destroy();
            this.settingsOverlay = null;
          }
          this.scene.restart();
        }
      });
    });
  }

  /**
   * Create reset scoreboard button in settings
   * @param {Phaser.GameObjects.Container} container - Settings container
   * @param {number} y - Y position
   */
  createResetScoreboardButton(container, y) {
    const leftMargin = 120;

    // Button with softer red
    const button = this.add.rectangle(
      350, y,
      520, 55,
      0xb91c1c
    );
    button.setStrokeStyle(2, 0xdc2626, 0.8);
    button.setInteractive({ useHandCursor: true });
    container.add(button);

    // Button text
    const text = this.add.text(350, y, this.languageManager.getText('menu.resetScoreboard'), {
      fontSize: "21px",
      fontFamily: "serif",
      color: "#FFFFFF",
      fontStyle: "bold",
      letterSpacing: 1
    }).setOrigin(0.5);
    container.add(text);

    // Hover effects
    button.on('pointerover', () => {
      button.setFillStyle(0xdc2626);
      this.tweens.add({
        targets: [button, text],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });

    button.on('pointerout', () => {
      button.setFillStyle(0xb91c1c);
      this.tweens.add({
        targets: [button, text],
        scaleX: 1,
        scaleY: 1,
        duration: 150
      });
    });

    // Click handler - show confirmation
    button.on('pointerdown', () => {
      this.showResetConfirmation();
    });
  }

  /**
   * Show confirmation modal for scoreboard reset
   */
  showResetConfirmation() {
    // Create confirmation overlay
    const confirmOverlay = this.add.container(0, 0);
    confirmOverlay.setDepth(1000);

    // Background
    const bg = this.add.rectangle(400, 500, 800, 1000, 0x000000, 0.7);
    bg.setInteractive();
    confirmOverlay.add(bg);

    // Modal panel
    const panel = this.add.rectangle(400, 400, 500, 250, DESIGN_CONSTANTS.COLORS.BACKGROUND);
    panel.setStrokeStyle(4, DESIGN_CONSTANTS.COLORS.GOLD);
    confirmOverlay.add(panel);

    // Question
    const question = this.add.text(400, 330, this.languageManager.getText('menu.resetScoreboardConfirm'), {
      fontSize: "20px",
      fontFamily: "serif",
      color: "#FFD700",
      align: "center",
      wordWrap: { width: 450 }
    }).setOrigin(0.5);
    confirmOverlay.add(question);

    // Yes button
    const yesBtn = this.add.rectangle(310, 450, 120, 50, 0xcc0000);
    yesBtn.setStrokeStyle(2, 0xff0000);
    yesBtn.setInteractive({ useHandCursor: true });
    confirmOverlay.add(yesBtn);

    const yesText = this.add.text(310, 450, this.languageManager.getText('menu.yes'), {
      fontSize: "22px",
      fontFamily: "serif",
      color: "#FFFFFF",
      fontStyle: "bold"
    }).setOrigin(0.5);
    confirmOverlay.add(yesText);

    // No button
    const noBtn = this.add.rectangle(490, 450, 120, 50, DESIGN_CONSTANTS.COLORS.PRIMARY);
    noBtn.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.GOLD);
    noBtn.setInteractive({ useHandCursor: true });
    confirmOverlay.add(noBtn);

    const noText = this.add.text(490, 450, this.languageManager.getText('menu.no'), {
      fontSize: "22px",
      fontFamily: "serif",
      color: "#FFFFFF",
      fontStyle: "bold"
    }).setOrigin(0.5);
    confirmOverlay.add(noText);

    // Yes button handlers
    yesBtn.on('pointerover', () => {
      yesBtn.setFillStyle(0xff0000);
    });
    yesBtn.on('pointerout', () => {
      yesBtn.setFillStyle(0xcc0000);
    });
    yesBtn.on('pointerdown', () => {
      this.stateManager.clearScoreboard();
      confirmOverlay.destroy();
      
      // Show success message
      const success = this.add.text(400, 500, '✓ Scoreboard cleared', {
        fontSize: "24px",
        fontFamily: "serif",
        color: "#00FF00",
        fontStyle: "bold"
      }).setOrigin(0.5);
      success.setDepth(1001);
      
      this.tweens.add({
        targets: success,
        alpha: 0,
        y: 450,
        duration: 2000,
        onComplete: () => success.destroy()
      });
    });

    // No button handlers
    noBtn.on('pointerover', () => {
      noBtn.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
    });
    noBtn.on('pointerout', () => {
      noBtn.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY);
    });
    noBtn.on('pointerdown', () => {
      confirmOverlay.destroy();
    });

    // Fade in
    confirmOverlay.setAlpha(0);
    this.tweens.add({
      targets: confirmOverlay,
      alpha: 1,
      duration: 200
    });
  }
}

