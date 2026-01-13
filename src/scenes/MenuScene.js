import Phaser from "phaser";
import { DESIGN_CONSTANTS, TRANSLATIONS, COLOR_PALETTES, getActivePalette, setActivePalette, previewPalette } from "../config/gameConfig.js";
import { CATEGORY_LABELS } from "../config/featureConfig.js";
import FeatureManager from "../managers/FeatureManager.js";
import LanguageManager from "../managers/LanguageManager.js";
import stateManager from "../managers/StateManager.js";
import ModalComponent from "../components/ModalComponent.js";
import UsernameInputOverlay from "../ui/UsernameInputOverlay.js";
import TutorialOverlay from "../ui/TutorialOverlay.js";
import EventBus, { GameEvents } from "../core/EventBus.js";

/**
 * Menu scene - main game menu
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
    this.settingsOverlay = null;
    this.modal = null;
    this.usernameOverlay = null;
    this.languageManager = LanguageManager;
    this.stateManager = stateManager;
    this.tutorialOverlay = null; // Tutorial overlay instance

    // Store references to colored UI elements for dynamic theme updates
    this.menuBackground = null;
    this.startButton = null;
    this.settingsButton = null;
    this.scoreboardButton = null;
    this.tutorialButton = null;
  }

  create() {
    const centerX = 400; // Fixed game width / 2
    const centerY = 500; // Fixed game height / 2

    // Initialize FeatureManager
    FeatureManager.init();

    // Ensure saved palette is applied (in case we're coming back from another scene)
    setActivePalette(getActivePalette());

    // Subscribe to palette changes for instant theme updates
    EventBus.on(GameEvents.PALETTE_CHANGED, this.onPaletteChanged, this);

    // Load saved username from localStorage
    const savedUsername = this.stateManager.getUsername();
    if (savedUsername) {
      this.registry.set("currentUsername", savedUsername);
    }

    // Create modal component
    this.modal = new ModalComponent(this);

    // Background
    this.menuBackground = this.add.rectangle(
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
    this.startButton = this.add
      .rectangle(centerX, 500, 400, 70, DESIGN_CONSTANTS.COLORS.ACCENT)
      .setInteractive({ useHandCursor: true });
    this.startButton.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.GOLD, 0.5);

    const startText = this.add
      .text(centerX, 500, this.languageManager.getText('menu.startButton'), {
        fontSize: "32px",
        color: "#FFFFFF",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Settings button
    this.settingsButton = this.add
      .rectangle(centerX, 590, 400, 60, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.3)
      .setInteractive({ useHandCursor: true });
    this.settingsButton.setStrokeStyle(1, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.8);

    const settingsText = this.add
      .text(centerX, 590, this.languageManager.getText('menu.settings'), {
        fontSize: "24px",
        color: "#F4A460",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    // Scoreboard button
    this.scoreboardButton = this.add
      .rectangle(centerX, 665, 400, 60, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.3)
      .setInteractive({ useHandCursor: true });
    this.scoreboardButton.setStrokeStyle(1, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.8);

    const scoreboardText = this.add
      .text(centerX, 665, this.languageManager.getText('menu.scoreboardButton'), {
        fontSize: "24px",
        color: "#F4A460",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    // Start button interactions
    this.startButton.on("pointerover", () => {
      this.startButton.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
      this.tweens.add({
        targets: this.startButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    this.startButton.on("pointerout", () => {
      this.startButton.setFillStyle(DESIGN_CONSTANTS.COLORS.ACCENT);
      this.tweens.add({
        targets: this.startButton,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    this.startButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => {
        this.scene.start("BettingScene");
      });
    });

    // Settings button interactions
    this.settingsButton.on("pointerover", () => {
      this.settingsButton.setFillStyle(0x777777);
      this.tweens.add({
        targets: this.settingsButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    this.settingsButton.on("pointerout", () => {
      this.settingsButton.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.3);
      this.tweens.add({
        targets: this.settingsButton,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    this.settingsButton.on("pointerdown", () => {
      this.openSettingsOverlay();
    });

    // Scoreboard button interactions
    this.scoreboardButton.on("pointerover", () => {
      this.scoreboardButton.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
      this.tweens.add({
        targets: this.scoreboardButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    this.scoreboardButton.on("pointerout", () => {
      this.scoreboardButton.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.3);
      this.tweens.add({
        targets: this.scoreboardButton,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    this.scoreboardButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => {
        this.scene.start("ScoreboardScene");
      });
    });

    // Tutorial button
    this.tutorialButton = this.add
      .rectangle(centerX, 740, 400, 60, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.3)
      .setInteractive({ useHandCursor: true });
    this.tutorialButton.setStrokeStyle(1, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.8);

    const tutorialText = this.add
      .text(centerX, 740, this.languageManager.getText('tutorial.menuButton'), {
        fontSize: "24px",
        color: "#F4A460",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    // Tutorial button interactions
    this.tutorialButton.on("pointerover", () => {
      this.tutorialButton.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
      this.tweens.add({
        targets: this.tutorialButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    this.tutorialButton.on("pointerout", () => {
      this.tutorialButton.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.3);
      this.tweens.add({
        targets: this.tutorialButton,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    this.tutorialButton.on("pointerdown", () => {
      if (!this.tutorialOverlay) {
        this.tutorialOverlay = new TutorialOverlay(this);
      }
      this.tutorialOverlay.show();
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

    // Show username prompt if no saved username exists
    if (!savedUsername) {
      this.showUsernamePrompt();
    }
  }

  /**
   * Show the username input overlay
   * @param {Function} onComplete - Optional callback to execute after username is submitted
   */
  showUsernamePrompt(onComplete = null) {
    this.usernameOverlay = new UsernameInputOverlay(this, (username) => {
      this.registry.set("currentUsername", username);
      this.stateManager.saveUsername(username);

      // Execute callback if provided (e.g., reopen settings)
      if (onComplete) {
        this.time.delayedCall(100, () => {
          onComplete();
        });
      }
    });
    this.usernameOverlay.show();
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
  createPaletteSelector(container, leftMargin, yPos, panelWidth) {
    // Titre - smaller, more subtle
    const title = this.add.text(leftMargin + 20, yPos, this.languageManager.getText('menu.paletteTitle'), {
      fontSize: "16px",
      color: "#aaaaaa",
      fontFamily: "serif"
    });
    container.add(title);

    // Boutons de palette - pill shaped
    const paletteKeys = Object.keys(COLOR_PALETTES);
    let confirmedPalette = getActivePalette();
    const buttonWidth = 90;
    const buttonHeight = 36;
    const spacing = 8;

    // Store button references for updating active states
    const paletteButtons = [];

    // Function to update all button states
    const updateButtonStates = () => {
      paletteButtons.forEach(({ key, buttonGraphics, label, x, y }) => {
        const palette = COLOR_PALETTES[key];
        const isActive = key === confirmedPalette;
        buttonGraphics.clear();
        buttonGraphics.fillStyle(palette.colors.PRIMARY, isActive ? 1 : 0.4);
        buttonGraphics.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 18);
        if (isActive) {
          buttonGraphics.lineStyle(2, palette.colors.GOLD, 0.8);
          buttonGraphics.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 18);
        }
        label.setColor(isActive ? "#ffffff" : "#cccccc");
      });
    };

    paletteKeys.forEach((key, index) => {
      const palette = COLOR_PALETTES[key];
      const x = leftMargin + 20 + index * (buttonWidth + spacing) + buttonWidth / 2;
      const y = yPos + 38;
      const isActive = key === confirmedPalette;

      // Bouton - rounded pill
      const buttonGraphics = this.add.graphics();
      buttonGraphics.fillStyle(palette.colors.PRIMARY, isActive ? 1 : 0.4);
      buttonGraphics.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 18);
      if (isActive) {
        buttonGraphics.lineStyle(2, palette.colors.GOLD, 0.8);
        buttonGraphics.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 18);
      }
      container.add(buttonGraphics);

      // Hit area
      const hitArea = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      container.add(hitArea);

      // Label
      const label = this.add
        .text(x, y, palette.name, {
          fontSize: "12px",
          color: isActive ? "#ffffff" : "#cccccc",
          fontFamily: "serif",
          align: "center",
        })
        .setOrigin(0.5);
      container.add(label);

      // Store button reference
      paletteButtons.push({ key, buttonGraphics, label, x, y });

      // Interactions - hover to preview
      hitArea.on("pointerover", () => {
        if (key !== confirmedPalette) {
          // Preview this palette
          previewPalette(key);
          this.refreshSettingsOverlayColors();
          // Highlight this button
          buttonGraphics.clear();
          buttonGraphics.fillStyle(palette.colors.PRIMARY, 0.85);
          buttonGraphics.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 18);
          buttonGraphics.lineStyle(2, palette.colors.GOLD, 0.5);
          buttonGraphics.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 18);
          label.setColor("#ffffff");
        }
      });

      hitArea.on("pointerout", () => {
        if (key !== confirmedPalette) {
          // Revert to confirmed palette
          previewPalette(confirmedPalette);
          this.refreshSettingsOverlayColors();
          // Reset button state
          buttonGraphics.clear();
          buttonGraphics.fillStyle(palette.colors.PRIMARY, 0.4);
          buttonGraphics.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 18);
          label.setColor("#cccccc");
        }
      });

      hitArea.on("pointerdown", () => {
        // Confirm the selection
        setActivePalette(key);
        confirmedPalette = key;
        // Update all button states to reflect new selection
        updateButtonStates();
        // Refresh colors to match confirmed palette
        this.refreshSettingsOverlayColors();
      });
    });
  }

  /**
   * Helper function to draw a rounded rectangle
   */
  drawRoundedRect(graphics, x, y, width, height, radius, fillColor, fillAlpha = 1, strokeColor = null, strokeWidth = 0, strokeAlpha = 1) {
    graphics.fillStyle(fillColor, fillAlpha);
    graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    if (strokeColor !== null && strokeWidth > 0) {
      graphics.lineStyle(strokeWidth, strokeColor, strokeAlpha);
      graphics.strokeRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    }
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

    // Reset stored references for color refresh
    this.settingsCategoryElements = [];
    this.settingsFeatureToggles = [];
    this.settingsCloseBtnHovered = false;

    // Background dimmer with subtle gradient feel
    const dimmer = this.add.rectangle(400, 500, 800, 1000, 0x000000, 0.8);
    dimmer.setInteractive();
    this.settingsOverlay.add(dimmer);

    // Calculate panel height dynamically based on content
    const featuresByCategory = FeatureManager.getFeaturesByCategory();
    const numCategories = Object.keys(featuresByCategory).length;
    const numFeatures = Object.values(featuresByCategory).reduce((sum, features) => sum + features.length, 0);

    // Base height: title(70) + lang(55) + palette(85) + reset(65) + closeBtn(60) = 335
    const baseHeight = 335;
    const contentHeight = baseHeight + (45 * numCategories) + (70 * numFeatures) + (8 * Math.max(0, numCategories - 1));
    const panelHeight = Math.min(880, Math.max(580, contentHeight));

    // Store panel dimensions for refresh
    this.settingsPanelHeight = panelHeight;

    // Settings panel with rounded corners
    const panelWidth = 680;
    const panelCenterY = 500;
    const panelTop = panelCenterY - panelHeight / 2;
    const panelBottom = panelCenterY + panelHeight / 2;
    const panelRadius = 24;

    // Store panelTop for refresh
    this.settingsPanelTop = panelTop;

    // Main panel background with rounded corners
    const panelGraphics = this.add.graphics();
    this.drawRoundedRect(panelGraphics, 400, panelCenterY, panelWidth, panelHeight, panelRadius, DESIGN_CONSTANTS.COLORS.BACKGROUND, 0.97, DESIGN_CONSTANTS.COLORS.GOLD, 2, 0.6);
    this.settingsOverlay.add(panelGraphics);

    // Store reference for refresh
    this.settingsPanelGraphics = panelGraphics;

    // Subtle inner glow effect
    const innerGlow = this.add.graphics();
    innerGlow.fillStyle(0xffffff, 0.03);
    innerGlow.fillRoundedRect(400 - panelWidth / 2 + 4, panelTop + 4, panelWidth - 8, 60, { tl: panelRadius - 2, tr: panelRadius - 2, bl: 0, br: 0 });
    this.settingsOverlay.add(innerGlow);

    // Title - cleaner, smaller
    const title = this.add.text(400, panelTop + 40, "Configuration", {
      fontSize: "32px",
      fontFamily: "serif",
      color: "#ffffff",
      fontStyle: "bold",
      letterSpacing: 2
    }).setOrigin(0.5);
    this.settingsOverlay.add(title);

    // Subtle decorative line
    const lineGraphics = this.add.graphics();
    lineGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 0.4);
    lineGraphics.fillRoundedRect(300, panelTop + 65, 200, 2, 1);
    this.settingsOverlay.add(lineGraphics);

    // Store reference for refresh
    this.settingsLineGraphics = lineGraphics;

    let yPos = panelTop + 90;

    // Username section
    this.createUsernameSection(this.settingsOverlay, yPos, panelWidth);
    yPos += 55;

    // Language selector
    this.createLanguageSelector(this.settingsOverlay, yPos, panelWidth);
    yPos += 55;

    // Palette selector
    this.createPaletteSelector(this.settingsOverlay, 100, yPos, panelWidth);
    yPos += 80;

    // Separator - subtle rounded line
    const sep1Graphics = this.add.graphics();
    sep1Graphics.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 0.15);
    sep1Graphics.fillRoundedRect(400 - (panelWidth - 120) / 2, yPos, panelWidth - 120, 2, 1);
    this.settingsOverlay.add(sep1Graphics);

    // Store reference for refresh
    this.settingsSep1Graphics = sep1Graphics;
    this.settingsSep1Y = yPos;
    yPos += 16;

    // Reset scoreboard button
    this.createResetScoreboardButton(this.settingsOverlay, yPos, panelWidth);
    yPos += 55;

    // Separator - subtle rounded line
    const sep2Graphics = this.add.graphics();
    sep2Graphics.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 0.15);
    sep2Graphics.fillRoundedRect(400 - (panelWidth - 120) / 2, yPos, panelWidth - 120, 2, 1);
    this.settingsOverlay.add(sep2Graphics);

    // Store reference for refresh
    this.settingsSep2Graphics = sep2Graphics;
    this.settingsSep2Y = yPos;
    yPos += 18;

    // Store start position for features section
    const featuresStartY = yPos;
    const maxFeaturesHeight = panelBottom - yPos - 70; // Leave space for close button

    // Create scrollable container for features
    const featuresContainer = this.add.container(0, 0);
    this.settingsOverlay.add(featuresContainer);

    // Create mask for features container with rounded corners
    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRoundedRect(70, featuresStartY, 660, maxFeaturesHeight, 12);
    const mask = maskShape.createGeometryMask();
    featuresContainer.setMask(mask);

    let featuresYPos = 0; // Relative Y position within features container

    // Render features by category (already retrieved above)
    Object.keys(featuresByCategory).forEach(category => {
      // Category header - minimal, clean design
      const categoryLabel = CATEGORY_LABELS[category] || category;

      // Subtle rounded background for category
      const categoryBgGraphics = this.add.graphics();
      categoryBgGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.12);
      categoryBgGraphics.fillRoundedRect(400 - (panelWidth - 80) / 2, featuresStartY + featuresYPos - 12, panelWidth - 80, 30, 8);
      featuresContainer.add(categoryBgGraphics);

      const categoryHeader = this.add.text(400, featuresStartY + featuresYPos + 3, categoryLabel, {
        fontSize: "16px",
        fontFamily: "serif",
        color: Phaser.Display.Color.IntegerToColor(DESIGN_CONSTANTS.COLORS.SAKURA).rgba,
        fontStyle: "bold",
        letterSpacing: 2
      }).setOrigin(0.5);
      featuresContainer.add(categoryHeader);

      // Store reference for refresh
      this.settingsCategoryElements.push({
        bgGraphics: categoryBgGraphics,
        header: categoryHeader,
        yPos: featuresStartY + featuresYPos
      });

      featuresYPos += 40;

      // Features in this category
      featuresByCategory[category].forEach(feature => {
        const featureRow = this.createFeatureRow(feature, featuresStartY + featuresYPos, panelWidth, featuresContainer);
        featuresYPos += 70;
      });

      featuresYPos += 10; // Extra space between categories
    });

    // Total height of features content
    const totalFeaturesHeight = featuresYPos;
    const needsScroll = totalFeaturesHeight > maxFeaturesHeight;

    // Add scroll functionality if needed
    if (needsScroll) {
      let scrollY = 0;
      const maxScroll = totalFeaturesHeight - maxFeaturesHeight;

      // Scroll track - subtle rounded bar
      const scrollTrackGraphics = this.add.graphics();
      scrollTrackGraphics.fillStyle(0xffffff, 0.1);
      scrollTrackGraphics.fillRoundedRect(735, featuresStartY + 5, 6, maxFeaturesHeight - 10, 3);
      this.settingsOverlay.add(scrollTrackGraphics);

      // Scroll thumb
      const thumbHeight = Math.max(30, (maxFeaturesHeight / totalFeaturesHeight) * (maxFeaturesHeight - 10));
      const scrollThumb = this.add.graphics();
      scrollThumb.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 0.6);
      scrollThumb.fillRoundedRect(735, featuresStartY + 5, 6, thumbHeight, 3);
      this.settingsOverlay.add(scrollThumb);

      // Store references for refresh
      this.settingsScrollThumb = scrollThumb;
      this.settingsScrollThumbY = featuresStartY + 5;
      this.settingsScrollThumbHeight = thumbHeight;

      // Mouse wheel scroll
      this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
        if (!this.settingsOverlay) return;

        scrollY = Phaser.Math.Clamp(scrollY + deltaY * 0.5, 0, maxScroll);

        // Move features container
        featuresContainer.y = -scrollY;

        // Update scroll thumb position
        const thumbY = featuresStartY + 5 + (scrollY / maxScroll) * (maxFeaturesHeight - 10 - thumbHeight);
        scrollThumb.clear();
        scrollThumb.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 0.6);
        scrollThumb.fillRoundedRect(735, thumbY, 6, thumbHeight, 3);
      });
    }

    // Close button - rounded pill shape
    const closeBtnY = panelBottom - 38;
    const closeBtnWidth = 180;
    const closeBtnHeight = 44;

    const closeBtnGraphics = this.add.graphics();
    closeBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.ACCENT, 1);
    closeBtnGraphics.fillRoundedRect(400 - closeBtnWidth / 2, closeBtnY - closeBtnHeight / 2, closeBtnWidth, closeBtnHeight, 22);
    this.settingsOverlay.add(closeBtnGraphics);

    // Store references for refresh
    this.settingsCloseBtnGraphics = closeBtnGraphics;
    this.settingsCloseBtnY = closeBtnY;

    // Invisible hit area for the button
    const closeBtnHitArea = this.add.rectangle(400, closeBtnY, closeBtnWidth, closeBtnHeight, 0x000000, 0);
    closeBtnHitArea.setInteractive({ useHandCursor: true });
    this.settingsOverlay.add(closeBtnHitArea);

    const closeText = this.add.text(400, closeBtnY, "Fermer", {
      fontSize: "20px",
      fontFamily: "serif",
      color: "#ffffff",
      fontStyle: "bold",
      letterSpacing: 1
    }).setOrigin(0.5);
    this.settingsOverlay.add(closeText);

    // Close button interactions
    closeBtnHitArea.on('pointerover', () => {
      this.settingsCloseBtnHovered = true;
      closeBtnGraphics.clear();
      closeBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 1);
      closeBtnGraphics.fillRoundedRect(400 - closeBtnWidth / 2, closeBtnY - closeBtnHeight / 2, closeBtnWidth, closeBtnHeight, 22);
      closeText.setColor("#000000");
    });

    closeBtnHitArea.on('pointerout', () => {
      this.settingsCloseBtnHovered = false;
      closeBtnGraphics.clear();
      closeBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.ACCENT, 1);
      closeBtnGraphics.fillRoundedRect(400 - closeBtnWidth / 2, closeBtnY - closeBtnHeight / 2, closeBtnWidth, closeBtnHeight, 22);
      closeText.setColor("#ffffff");
    });

    closeBtnHitArea.on('pointerdown', () => {
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
    const leftMargin = panelCenterX - panelWidth / 2 + 60;

    // Pill-shaped toggle switch
    const toggleWidth = 44;
    const toggleHeight = 24;
    const toggleX = leftMargin;

    // Toggle background - pill shape
    const toggleBg = this.add.graphics();
    toggleBg.fillStyle(feature.enabled ? DESIGN_CONSTANTS.COLORS.GOLD : 0x444444, 1);
    toggleBg.fillRoundedRect(toggleX - toggleWidth / 2, y - toggleHeight / 2, toggleWidth, toggleHeight, toggleHeight / 2);
    container.add(toggleBg);

    // Toggle handle (circle)
    const handleRadius = 9;
    const handleX = feature.enabled ? toggleX + toggleWidth / 2 - handleRadius - 3 : toggleX - toggleWidth / 2 + handleRadius + 3;
    const toggleHandle = this.add.circle(handleX, y, handleRadius, 0xffffff);
    container.add(toggleHandle);

    // Hit area for toggle
    const toggleHitArea = this.add.rectangle(toggleX, y, toggleWidth + 10, toggleHeight + 10, 0x000000, 0);
    toggleHitArea.setInteractive({ useHandCursor: true });
    container.add(toggleHitArea);

    // Feature name - cleaner typography
    const nameText = this.add.text(leftMargin + 40, y - 8, feature.name, {
      fontSize: "17px",
      fontFamily: "serif",
      color: feature.enabled ? "#ffffff" : "#888888",
      fontStyle: feature.enabled ? "bold" : "normal"
    });
    container.add(nameText);

    // Feature description - subtle
    const descText = this.add.text(leftMargin + 40, y + 11, feature.description, {
      fontSize: "12px",
      fontFamily: "serif",
      color: feature.enabled ? "#aaaaaa" : "#666666",
      wordWrap: { width: 320 }
    });
    container.add(descText);

    // Configure button (only if feature has parameters) - rounded pill
    let configBtnGraphics = null;
    let configBtnHitArea = null;
    let configText = null;
    if (feature.parameters && feature.parameters.length > 0) {
      const configBtnX = panelCenterX + panelWidth / 2 - 85;
      const configBtnWidth = 100;
      const configBtnHeight = 32;

      configBtnGraphics = this.add.graphics();
      configBtnGraphics.fillStyle(feature.enabled ? DESIGN_CONSTANTS.COLORS.PRIMARY : 0x3a3a3a, feature.enabled ? 0.8 : 0.5);
      configBtnGraphics.fillRoundedRect(configBtnX - configBtnWidth / 2, y - configBtnHeight / 2, configBtnWidth, configBtnHeight, 16);
      container.add(configBtnGraphics);

      configBtnHitArea = this.add.rectangle(configBtnX, y, configBtnWidth, configBtnHeight, 0x000000, 0);
      configBtnHitArea.setInteractive({ useHandCursor: true });
      container.add(configBtnHitArea);

      configText = this.add.text(configBtnX, y, "Configurer", {
        fontSize: "13px",
        fontFamily: "serif",
        color: feature.enabled ? "#ffffff" : "#666666"
      }).setOrigin(0.5);
      container.add(configText);

      // Configure button hover effects
      configBtnHitArea.on('pointerover', () => {
        if (feature.enabled) {
          configBtnGraphics.clear();
          configBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 1);
          configBtnGraphics.fillRoundedRect(configBtnX - configBtnWidth / 2, y - configBtnHeight / 2, configBtnWidth, configBtnHeight, 16);
          configText.setColor("#000000");
        }
      });

      configBtnHitArea.on('pointerout', () => {
        if (feature.enabled) {
          configBtnGraphics.clear();
          configBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.8);
          configBtnGraphics.fillRoundedRect(configBtnX - configBtnWidth / 2, y - configBtnHeight / 2, configBtnWidth, configBtnHeight, 16);
          configText.setColor("#ffffff");
        }
      });

      configBtnHitArea.on('pointerdown', () => {
        if (feature.enabled) {
          this.openFeatureConfigModal(feature);
        }
      });
    }

    // Toggle click handler
    toggleHitArea.on('pointerdown', () => {
      FeatureManager.toggleFeature(feature.id);
      feature.enabled = !feature.enabled;

      // Animate toggle
      const newHandleX = feature.enabled ? toggleX + toggleWidth / 2 - handleRadius - 3 : toggleX - toggleWidth / 2 + handleRadius + 3;
      this.tweens.add({
        targets: toggleHandle,
        x: newHandleX,
        duration: 150,
        ease: 'Sine.easeInOut'
      });

      // Update toggle background color
      toggleBg.clear();
      toggleBg.fillStyle(feature.enabled ? DESIGN_CONSTANTS.COLORS.GOLD : 0x444444, 1);
      toggleBg.fillRoundedRect(toggleX - toggleWidth / 2, y - toggleHeight / 2, toggleWidth, toggleHeight, toggleHeight / 2);

      // Update text colors
      nameText.setColor(feature.enabled ? "#ffffff" : "#888888");
      nameText.setFontStyle(feature.enabled ? "bold" : "normal");
      descText.setColor(feature.enabled ? "#aaaaaa" : "#666666");

      // Update configure button
      if (configBtnGraphics && configText) {
        const configBtnX = panelCenterX + panelWidth / 2 - 85;
        const configBtnWidth = 100;
        const configBtnHeight = 32;

        configBtnGraphics.clear();
        configBtnGraphics.fillStyle(feature.enabled ? DESIGN_CONSTANTS.COLORS.PRIMARY : 0x3a3a3a, feature.enabled ? 0.8 : 0.5);
        configBtnGraphics.fillRoundedRect(configBtnX - configBtnWidth / 2, y - configBtnHeight / 2, configBtnWidth, configBtnHeight, 16);
        configText.setColor(feature.enabled ? "#ffffff" : "#666666");
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

    // Restore the confirmed palette (in case user was previewing a different one)
    setActivePalette(getActivePalette());

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
   * Refresh colors of the settings overlay based on current DESIGN_CONSTANTS.COLORS
   * Called when previewing or selecting a new palette
   */
  refreshSettingsOverlayColors() {
    if (!this.settingsOverlay) return;

    // Refresh the panel graphics
    if (this.settingsPanelGraphics) {
      const panelWidth = 680;
      const panelHeight = this.settingsPanelHeight || 580;
      const panelCenterY = 500;
      const panelRadius = 24;

      this.settingsPanelGraphics.clear();
      this.drawRoundedRect(this.settingsPanelGraphics, 400, panelCenterY, panelWidth, panelHeight, panelRadius, DESIGN_CONSTANTS.COLORS.BACKGROUND, 0.97, DESIGN_CONSTANTS.COLORS.GOLD, 2, 0.6);
    }

    // Refresh decorative line
    if (this.settingsLineGraphics) {
      this.settingsLineGraphics.clear();
      this.settingsLineGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 0.4);
      this.settingsLineGraphics.fillRoundedRect(300, this.settingsPanelTop + 65, 200, 2, 1);
    }

    // Refresh separators
    if (this.settingsSep1Graphics) {
      const panelWidth = 680;
      this.settingsSep1Graphics.clear();
      this.settingsSep1Graphics.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 0.15);
      this.settingsSep1Graphics.fillRoundedRect(400 - (panelWidth - 120) / 2, this.settingsSep1Y, panelWidth - 120, 2, 1);
    }

    if (this.settingsSep2Graphics) {
      const panelWidth = 680;
      this.settingsSep2Graphics.clear();
      this.settingsSep2Graphics.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 0.15);
      this.settingsSep2Graphics.fillRoundedRect(400 - (panelWidth - 120) / 2, this.settingsSep2Y, panelWidth - 120, 2, 1);
    }

    // Refresh close button
    if (this.settingsCloseBtnGraphics && !this.settingsCloseBtnHovered) {
      this.settingsCloseBtnGraphics.clear();
      this.settingsCloseBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.ACCENT, 1);
      this.settingsCloseBtnGraphics.fillRoundedRect(400 - 90, this.settingsCloseBtnY - 22, 180, 44, 22);
    }

    // Refresh category backgrounds and headers
    if (this.settingsCategoryElements) {
      this.settingsCategoryElements.forEach(({ bgGraphics, header, yPos }) => {
        const panelWidth = 680;
        bgGraphics.clear();
        bgGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.12);
        bgGraphics.fillRoundedRect(400 - (panelWidth - 80) / 2, yPos - 12, panelWidth - 80, 30, 8);
        header.setColor(Phaser.Display.Color.IntegerToColor(DESIGN_CONSTANTS.COLORS.SAKURA).rgba);
      });
    }

    // Refresh scroll thumb if exists
    if (this.settingsScrollThumb) {
      this.settingsScrollThumb.clear();
      this.settingsScrollThumb.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 0.6);
      this.settingsScrollThumb.fillRoundedRect(735, this.settingsScrollThumbY, 6, this.settingsScrollThumbHeight, 3);
    }

    // Refresh feature toggle backgrounds
    if (this.settingsFeatureToggles) {
      this.settingsFeatureToggles.forEach(({ toggleBg, enabled }) => {
        toggleBg.clear();
        toggleBg.fillStyle(enabled ? DESIGN_CONSTANTS.COLORS.GOLD : 0x444444, 1);
        toggleBg.fillRoundedRect(toggleBg.toggleX - 22, toggleBg.toggleY - 12, 44, 24, 12);
      });
    }
  }

  /**
   * Handle palette change event - refresh all menu colors instantly
   * @param {Object} data - Event data containing the new palette name
   */
  onPaletteChanged(data) {
    // Refresh main menu background
    if (this.menuBackground) {
      this.menuBackground.setFillStyle(DESIGN_CONSTANTS.COLORS.BACKGROUND);
    }

    // Refresh start button
    if (this.startButton) {
      this.startButton.setFillStyle(DESIGN_CONSTANTS.COLORS.ACCENT);
      this.startButton.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.GOLD, 0.5);
    }

    // Refresh settings button
    if (this.settingsButton) {
      this.settingsButton.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.3);
      this.settingsButton.setStrokeStyle(1, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.8);
    }

    // Refresh scoreboard button
    if (this.scoreboardButton) {
      this.scoreboardButton.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.3);
      this.scoreboardButton.setStrokeStyle(1, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.8);
    }

    // Refresh settings overlay if open
    this.refreshSettingsOverlayColors();
  }

  /**
   * Scene shutdown - cleanup event listeners
   */
  shutdown() {
    EventBus.off(GameEvents.PALETTE_CHANGED, this.onPaletteChanged, this);
  }

  /**
   * Create language selector in settings
   * @param {Phaser.GameObjects.Container} container - Settings container
   * @param {number} y - Y position
   * @param {number} panelWidth - Panel width
   */
  createLanguageSelector(container, y, panelWidth) {
    const leftMargin = 120;

    // Label - subtle
    const label = this.add.text(leftMargin, y, this.languageManager.getText('menu.language'), {
      fontSize: "16px",
      fontFamily: "serif",
      color: "#aaaaaa"
    });
    container.add(label);

    // Language buttons - pill shaped
    const languages = [
      { code: 'fr', abbr: 'FR', name: 'Français' },
      { code: 'en', abbr: 'EN', name: 'English' }
    ];

    const currentLang = this.languageManager.getCurrentLanguage();
    const buttonWidth = 100;
    const buttonHeight = 34;
    const buttonSpacing = 12;
    const startX = leftMargin + 150;

    languages.forEach((lang, index) => {
      const x = startX + index * (buttonWidth + buttonSpacing);
      const isActive = lang.code === currentLang;

      // Button - rounded pill
      const buttonGraphics = this.add.graphics();
      buttonGraphics.fillStyle(isActive ? DESIGN_CONSTANTS.COLORS.GOLD : 0x444444, isActive ? 1 : 0.6);
      buttonGraphics.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 17);
      container.add(buttonGraphics);

      // Hit area
      const hitArea = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      container.add(hitArea);

      // Language name only
      const name = this.add.text(x, y, lang.name, {
        fontSize: "13px",
        fontFamily: "serif",
        color: isActive ? "#000000" : "#cccccc",
        fontStyle: isActive ? "bold" : "normal"
      }).setOrigin(0.5);
      container.add(name);

      // Hover effect
      hitArea.on('pointerover', () => {
        if (!isActive) {
          buttonGraphics.clear();
          buttonGraphics.fillStyle(0x555555, 0.8);
          buttonGraphics.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 17);
          name.setColor("#ffffff");
        }
      });

      hitArea.on('pointerout', () => {
        if (!isActive) {
          buttonGraphics.clear();
          buttonGraphics.fillStyle(0x444444, 0.6);
          buttonGraphics.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 17);
          name.setColor("#cccccc");
        }
      });

      // Click handler
      hitArea.on('pointerdown', () => {
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
   * Create username section in settings
   * @param {Phaser.GameObjects.Container} container - Settings container
   * @param {number} y - Y position
   * @param {number} panelWidth - Panel width
   */
  createUsernameSection(container, y, panelWidth) {
    const leftMargin = 120;

    // Label - subtle
    const label = this.add.text(leftMargin, y, this.languageManager.getText('menu.username') || 'Pseudo', {
      fontSize: "16px",
      fontFamily: "serif",
      color: "#aaaaaa"
    });
    container.add(label);

    // Current username display
    const currentUsername = this.registry.get("currentUsername") || this.languageManager.getText('username.notSet') || 'Non défini';
    const usernameDisplay = this.add.text(leftMargin + 130, y, currentUsername, {
      fontSize: "16px",
      fontFamily: "serif",
      color: "#ffffff",
      fontStyle: "bold"
    });
    container.add(usernameDisplay);

    // Change button - small rounded pill
    const changeBtnX = 520;
    const changeBtnWidth = 90;
    const changeBtnHeight = 30;

    const changeBtnGraphics = this.add.graphics();
    changeBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.6);
    changeBtnGraphics.fillRoundedRect(changeBtnX - changeBtnWidth / 2, y - changeBtnHeight / 2, changeBtnWidth, changeBtnHeight, 15);
    container.add(changeBtnGraphics);

    const changeBtnHitArea = this.add.rectangle(changeBtnX, y, changeBtnWidth, changeBtnHeight, 0x000000, 0);
    changeBtnHitArea.setInteractive({ useHandCursor: true });
    container.add(changeBtnHitArea);

    const changeBtnText = this.add.text(changeBtnX, y, this.languageManager.getText('menu.change') || 'Modifier', {
      fontSize: "12px",
      fontFamily: "serif",
      color: "#ffffff"
    }).setOrigin(0.5);
    container.add(changeBtnText);

    // Hover effects
    changeBtnHitArea.on('pointerover', () => {
      changeBtnGraphics.clear();
      changeBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 1);
      changeBtnGraphics.fillRoundedRect(changeBtnX - changeBtnWidth / 2, y - changeBtnHeight / 2, changeBtnWidth, changeBtnHeight, 15);
      changeBtnText.setColor("#000000");
    });

    changeBtnHitArea.on('pointerout', () => {
      changeBtnGraphics.clear();
      changeBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.6);
      changeBtnGraphics.fillRoundedRect(changeBtnX - changeBtnWidth / 2, y - changeBtnHeight / 2, changeBtnWidth, changeBtnHeight, 15);
      changeBtnText.setColor("#ffffff");
    });

    // Click handler - open username overlay
    changeBtnHitArea.on('pointerdown', () => {
      // Close settings overlay first
      this.closeSettingsOverlay();

      // Show username input overlay, then reopen settings when done
      this.time.delayedCall(300, () => {
        this.showUsernamePrompt(() => {
          // Reopen settings overlay after username is changed
          this.openSettingsOverlay();
        });
      });
    });
  }

  /**
   * Create reset scoreboard button in settings
   * @param {Phaser.GameObjects.Container} container - Settings container
   * @param {number} y - Y position
   * @param {number} panelWidth - Panel width
   */
  createResetScoreboardButton(container, y, panelWidth) {
    const btnWidth = 280;
    const btnHeight = 38;
    const btnX = 400;

    // Button with rounded corners - softer red
    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0x8b2525, 0.8);
    buttonGraphics.fillRoundedRect(btnX - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 19);
    container.add(buttonGraphics);

    // Hit area
    const hitArea = this.add.rectangle(btnX, y, btnWidth, btnHeight, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    // Button text
    const text = this.add.text(btnX, y, this.languageManager.getText('menu.resetScoreboard'), {
      fontSize: "14px",
      fontFamily: "serif",
      color: "#ffffff"
    }).setOrigin(0.5);
    container.add(text);

    // Hover effects
    hitArea.on('pointerover', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xb33030, 1);
      buttonGraphics.fillRoundedRect(btnX - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 19);
    });

    hitArea.on('pointerout', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x8b2525, 0.8);
      buttonGraphics.fillRoundedRect(btnX - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 19);
    });

    // Click handler - show confirmation
    hitArea.on('pointerdown', () => {
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

    // Modal panel - rounded
    const panelWidth = 420;
    const panelHeight = 200;
    const panelGraphics = this.add.graphics();
    panelGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.BACKGROUND, 0.98);
    panelGraphics.fillRoundedRect(400 - panelWidth / 2, 400 - panelHeight / 2, panelWidth, panelHeight, 20);
    panelGraphics.lineStyle(2, DESIGN_CONSTANTS.COLORS.GOLD, 0.5);
    panelGraphics.strokeRoundedRect(400 - panelWidth / 2, 400 - panelHeight / 2, panelWidth, panelHeight, 20);
    confirmOverlay.add(panelGraphics);

    // Question
    const question = this.add.text(400, 340, this.languageManager.getText('menu.resetScoreboardConfirm'), {
      fontSize: "16px",
      fontFamily: "serif",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 380 }
    }).setOrigin(0.5);
    confirmOverlay.add(question);

    // Yes button - rounded pill
    const yesBtnWidth = 100;
    const yesBtnHeight = 40;
    const yesBtnX = 320;
    const yesBtnY = 430;

    const yesBtnGraphics = this.add.graphics();
    yesBtnGraphics.fillStyle(0x8b2525, 1);
    yesBtnGraphics.fillRoundedRect(yesBtnX - yesBtnWidth / 2, yesBtnY - yesBtnHeight / 2, yesBtnWidth, yesBtnHeight, 20);
    confirmOverlay.add(yesBtnGraphics);

    const yesBtnHitArea = this.add.rectangle(yesBtnX, yesBtnY, yesBtnWidth, yesBtnHeight, 0x000000, 0);
    yesBtnHitArea.setInteractive({ useHandCursor: true });
    confirmOverlay.add(yesBtnHitArea);

    const yesText = this.add.text(yesBtnX, yesBtnY, this.languageManager.getText('menu.yes'), {
      fontSize: "16px",
      fontFamily: "serif",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5);
    confirmOverlay.add(yesText);

    // No button - rounded pill
    const noBtnWidth = 100;
    const noBtnHeight = 40;
    const noBtnX = 480;
    const noBtnY = 430;

    const noBtnGraphics = this.add.graphics();
    noBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.8);
    noBtnGraphics.fillRoundedRect(noBtnX - noBtnWidth / 2, noBtnY - noBtnHeight / 2, noBtnWidth, noBtnHeight, 20);
    confirmOverlay.add(noBtnGraphics);

    const noBtnHitArea = this.add.rectangle(noBtnX, noBtnY, noBtnWidth, noBtnHeight, 0x000000, 0);
    noBtnHitArea.setInteractive({ useHandCursor: true });
    confirmOverlay.add(noBtnHitArea);

    const noText = this.add.text(noBtnX, noBtnY, this.languageManager.getText('menu.no'), {
      fontSize: "16px",
      fontFamily: "serif",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5);
    confirmOverlay.add(noText);

    // Yes button handlers
    yesBtnHitArea.on('pointerover', () => {
      yesBtnGraphics.clear();
      yesBtnGraphics.fillStyle(0xb33030, 1);
      yesBtnGraphics.fillRoundedRect(yesBtnX - yesBtnWidth / 2, yesBtnY - yesBtnHeight / 2, yesBtnWidth, yesBtnHeight, 20);
    });
    yesBtnHitArea.on('pointerout', () => {
      yesBtnGraphics.clear();
      yesBtnGraphics.fillStyle(0x8b2525, 1);
      yesBtnGraphics.fillRoundedRect(yesBtnX - yesBtnWidth / 2, yesBtnY - yesBtnHeight / 2, yesBtnWidth, yesBtnHeight, 20);
    });
    yesBtnHitArea.on('pointerdown', () => {
      this.stateManager.clearScoreboard();
      confirmOverlay.destroy();

      // Show success message
      const success = this.add.text(400, 500, '✓ Scoreboard cleared', {
        fontSize: "18px",
        fontFamily: "serif",
        color: "#4ade80",
        fontStyle: "bold"
      }).setOrigin(0.5);
      success.setDepth(1001);

      this.tweens.add({
        targets: success,
        alpha: 0,
        y: 460,
        duration: 1500,
        ease: 'Sine.easeOut',
        onComplete: () => success.destroy()
      });
    });

    // No button handlers
    noBtnHitArea.on('pointerover', () => {
      noBtnGraphics.clear();
      noBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 1);
      noBtnGraphics.fillRoundedRect(noBtnX - noBtnWidth / 2, noBtnY - noBtnHeight / 2, noBtnWidth, noBtnHeight, 20);
      noText.setColor("#000000");
    });
    noBtnHitArea.on('pointerout', () => {
      noBtnGraphics.clear();
      noBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.8);
      noBtnGraphics.fillRoundedRect(noBtnX - noBtnWidth / 2, noBtnY - noBtnHeight / 2, noBtnWidth, noBtnHeight, 20);
      noText.setColor("#ffffff");
    });
    noBtnHitArea.on('pointerdown', () => {
      confirmOverlay.destroy();
    });

    // Fade in
    confirmOverlay.setAlpha(0);
    this.tweens.add({
      targets: confirmOverlay,
      alpha: 1,
      duration: 150,
      ease: 'Sine.easeOut'
    });
  }
}
