import Phaser from "phaser";
import { DESIGN_CONSTANTS, HARDCORE_LAUNCH } from "../config/gameConfig.js";
import { formatScore } from "../utils/helpers.js";
import LanguageManager from "../managers/LanguageManager.js";
import FeatureManager from "../managers/FeatureManager.js";

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

    // Initialize hardcore mode indicators if enabled
    if (FeatureManager.isEnabled("hardcore_launch")) {
      this.createHardcoreModeIndicators();
    }

    // CASH OUT Button - Top left, more discreet
    const cashOutX = 100;
    const cashOutY = 200;
    
    this.cashOutButton = this.add.rectangle(
      cashOutX, cashOutY,
      140, 40,
      DESIGN_CONSTANTS.COLORS.PRIMARY, 0.7
    );
    this.cashOutButton.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.GOLD, 0.6);
    this.cashOutButton.setInteractive({ useHandCursor: true });

    // Arrow pointing left
    this.cashOutArrow = this.add.text(cashOutX - 45, cashOutY, "←", {
      fontSize: "24px",
      color: "#FFD700",
      fontFamily: "serif",
    }).setOrigin(0.5);

    this.cashOutText = this.add.text(cashOutX + 5, cashOutY, "CASH OUT", {
      fontSize: "16px",
      color: "#FFD700",
      fontFamily: "serif",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // Track state for cash out button
    this.currentLives = DESIGN_CONSTANTS.MAX_LIVES;
    this.hasActiveBalls = false;
    // Cash out enabled by default (no balls falling at start and has lives)
    this.cashOutEnabled = true;

    this.cashOutButton.on("pointerover", () => {
      if (this.cashOutEnabled) {
        this.cashOutButton.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 0.9);
        this.cashOutText.setColor("#000000");
        this.tweens.add({
          targets: [this.cashOutButton, this.cashOutText, this.cashOutArrow],
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 150,
          ease: 'Back.easeOut'
        });
      }
    });

    this.cashOutButton.on("pointerout", () => {
      if (this.cashOutEnabled) {
        this.cashOutButton.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.7);
        this.cashOutText.setColor("#FFD700");
        this.tweens.add({
          targets: [this.cashOutButton, this.cashOutText, this.cashOutArrow],
          scaleX: 1,
          scaleY: 1,
          duration: 150
        });
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
    // ballStateChange is emitted to UIScene.events from GameScene
    this.events.on("ballStateChange", this.onBallStateChange, this);
    
    // Listen for hardcore mode events
    if (FeatureManager.isEnabled("hardcore_launch")) {
      this.events.on("hardcoreSizeUpdate", this.updateSizeIndicator, this);
      this.events.on("hardcoreAngleUpdate", this.updateAngleIndicator, this);
      this.events.on("hardcoreForceUpdate", this.updateForceIndicator, this);
      this.events.on("hardcorePlaceholderMove", this.updateAngleArrowPosition, this);
    }
  }

  /**
   * Update score display
   */
  updateScore(newScore) {
    // Apply bet multiplier to displayed score
    const betMultiplier = this.budgetManager ? this.budgetManager.getMultiplier() : 1;
    const displayScore = newScore * betMultiplier;
    this.scoreText.setText(formatScore(displayScore));

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
    this.currentLives = newLives;
    this.updateLivesDisplay(newLives);

    // Shake animation on life lost
    this.cameras.main.shake(200, 0.005);
    
    // Update cash out button state (requires at least 1 life)
    this.updateCashOutButtonState();
  }

  /**
   * Update multiplier display
   */
  updateMultiplier(multiplier) {
    this.multiplierText.setText(`x${multiplier}`);
  }

  /**
   * Handle ball state change event
   */
  onBallStateChange(hasActiveBalls) {
    this.hasActiveBalls = hasActiveBalls;
    this.updateCashOutButtonState();
  }

  /**
   * Update cash out button state - requires at least 1 life AND no active balls
   */
  updateCashOutButtonState() {
    // Cash out enabled only if: at least 1 life AND no active balls
    this.cashOutEnabled = this.currentLives >= 1 && !this.hasActiveBalls;
    
    if (this.cashOutEnabled) {
      // Enable button - full opacity and interactive cursor
      this.cashOutButton.setAlpha(1);
      this.cashOutText.setAlpha(1);
      this.cashOutArrow.setAlpha(1);
      this.cashOutButton.setInteractive({ useHandCursor: true });
    } else {
      // Disable button - grayed out and no cursor
      this.cashOutButton.setAlpha(0.3);
      this.cashOutText.setAlpha(0.3);
      this.cashOutArrow.setAlpha(0.3);
      this.cashOutButton.disableInteractive();
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
   * Create hardcore mode HUD indicators
   */
  createHardcoreModeIndicators() {
    const centerX = 400;
    const topY = HARDCORE_LAUNCH.GAUGE_Y_OFFSET;

    // FORCE GAUGE (Jauge de force avec gradient)
    const gaugeWidth = HARDCORE_LAUNCH.GAUGE_WIDTH;
    const gaugeHeight = HARDCORE_LAUNCH.GAUGE_HEIGHT;

    // Gauge container
    this.forceGaugeBackground = this.add.rectangle(
      centerX, topY,
      gaugeWidth, gaugeHeight,
      0x000000, 0.5
    );

    // Gauge fill (will update dynamically)
    this.forceGaugeFill = this.add.rectangle(
      centerX - gaugeWidth / 2, topY,
      0, gaugeHeight - 4,
      0x00ff00
    ).setOrigin(0, 0.5);

    // Gauge border
    this.forceGaugeBorder = this.add.rectangle(
      centerX, topY,
      gaugeWidth, gaugeHeight
    ).setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.GOLD);
    this.forceGaugeBorder.setFillStyle();

    // Label
    this.forceLabelText = this.add.text(centerX, topY - 25, "FORCE", {
      fontSize: "16px",
      color: "#FFD700",
      fontFamily: "serif",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // ANGLE ARROW (Flèche qui se balance) - positionnée au placeholder
    const arrowLength = HARDCORE_LAUNCH.ARROW_LENGTH;

    // Arrow pivot point (base) - will move with placeholder
    this.angleArrowBase = this.add.circle(centerX, 100, 4, DESIGN_CONSTANTS.COLORS.GOLD);

    // Arrow line (graphics)
    this.angleArrow = this.add.graphics();
    this.angleArrowAngle = 0; // Current angle in degrees
    this.angleArrowX = centerX; // Store position
    this.angleArrowY = 100;

    // SIZE INDICATOR (Texte qui affiche la taille)
    const sizeY = topY + 120;
    this.sizeLabelText = this.add.text(centerX, sizeY, "TAILLE", {
      fontSize: "16px",
      color: "#FFD700",
      fontFamily: "serif",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.sizeValueText = this.add.text(centerX, sizeY + 25, "12", {
      fontSize: "32px",
      color: "#FFFFFF",
      fontFamily: "serif",
      fontStyle: "bold",
    }).setOrigin(0.5);
  }

  /**
   * Update force gauge
   */
  updateForceIndicator(forcePercent) {
    if (!this.forceGaugeFill) return;

    const gaugeWidth = HARDCORE_LAUNCH.GAUGE_WIDTH;
    const fillWidth = (gaugeWidth - 4) * (forcePercent / 100);
    
    // Update width directly instead of setDisplaySize
    this.forceGaugeFill.width = fillWidth;
    this.forceGaugeFill.height = HARDCORE_LAUNCH.GAUGE_HEIGHT - 4;

    // Update color based on force (gradient: green -> yellow -> red)
    let color;
    if (forcePercent < 33) {
      color = 0x00ff00; // Green
    } else if (forcePercent < 66) {
      color = 0xffff00; // Yellow
    } else {
      color = 0xff0000; // Red
    }
    this.forceGaugeFill.setFillStyle(color);
  }

  /**
   * Update angle arrow
   */
  updateAngleIndicator(angleDegrees) {
    if (!this.angleArrow) return;

    this.angleArrowAngle = angleDegrees;
    
    // Clear and redraw arrow
    this.angleArrow.clear();
    
    const arrowLength = HARDCORE_LAUNCH.ARROW_LENGTH;
    // Add 90° so that 0° points down, negative to invert left/right
    const angleRad = Phaser.Math.DegToRad(-angleDegrees + 90);
    
    // Use stored position (updated by placeholder move)
    const baseX = this.angleArrowX;
    const baseY = this.angleArrowY;
    
    // Arrow line - use cos/sin for proper rotation
    const endX = baseX + Math.cos(angleRad) * arrowLength;
    const endY = baseY + Math.sin(angleRad) * arrowLength;
    
    this.angleArrow.lineStyle(4, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.8);
    this.angleArrow.beginPath();
    this.angleArrow.moveTo(baseX, baseY);
    this.angleArrow.lineTo(endX, endY);
    this.angleArrow.strokePath();
    
    // Arrow head (triangle)
    const headSize = 10;
    const perpAngle = angleRad + Math.PI / 2;
    
    this.angleArrow.fillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.8);
    this.angleArrow.beginPath();
    this.angleArrow.moveTo(endX, endY);
    this.angleArrow.lineTo(
      endX - Math.cos(angleRad) * headSize + Math.cos(perpAngle) * headSize / 2,
      endY - Math.sin(angleRad) * headSize + Math.sin(perpAngle) * headSize / 2
    );
    this.angleArrow.lineTo(
      endX - Math.cos(angleRad) * headSize - Math.cos(perpAngle) * headSize / 2,
      endY - Math.sin(angleRad) * headSize - Math.sin(perpAngle) * headSize / 2
    );
    this.angleArrow.closePath();
    this.angleArrow.fillPath();
    
    // Update base circle position
    if (this.angleArrowBase) {
      this.angleArrowBase.setPosition(baseX, baseY);
    }
  }

  /**
   * Update size indicator
   */
  updateSizeIndicator(size) {
    if (!this.sizeValueText) return;
    
    this.sizeValueText.setText(Math.round(size).toString());
    
    // Pulse effect to match the oscillation
    const scale = 0.8 + (size / 30) * 0.4; // Scale between 0.8 and 1.2
    this.sizeValueText.setScale(scale);
  }

  /**
   * Update angle arrow position to follow placeholder
   */
  updateAngleArrowPosition(x, y) {
    this.angleArrowX = x;
    this.angleArrowY = y;
    // Redraw arrow at new position
    this.updateAngleIndicator(this.angleArrowAngle);
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
    
    if (this.events) {
      this.events.off("hardcoreSizeUpdate", this.updateSizeIndicator, this);
      this.events.off("hardcoreAngleUpdate", this.updateAngleIndicator, this);
      this.events.off("hardcoreForceUpdate", this.updateForceIndicator, this);
      this.events.off("hardcorePlaceholderMove", this.updateAngleArrowPosition, this);
    }
  }
}
