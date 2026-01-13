import Phaser from "phaser";
import { DESIGN_CONSTANTS, HARDCORE_LAUNCH } from "../config/gameConfig.js";
import { formatScore } from "../utils/helpers.js";
import LanguageManager from "../managers/LanguageManager.js";
import FeatureManager from "../managers/FeatureManager.js";
import PowerUpManager from "../managers/PowerUpManager.js";
import EventBus, { GameEvents } from "../core/EventBus.js";
import AchievementManager, { TIER_CONFIG } from "../managers/AchievementManager.js";

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
    this.malusMultiplier = this.registry.get("malusMultiplier") || 1.0;
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

    // Bet multiplier display
    // Total Multiplier Display (Bet x Malus)
    const betMultiplier = this.budgetManager ? this.budgetManager.getMultiplier() : 1;
    const totalMultiplier = betMultiplier * this.malusMultiplier;

    this.multiplierText = this.add.text(padding, padding + 90, `x${totalMultiplier.toFixed(2)}`, {
      fontSize: "28px",
      color: "#FF6B35",
      fontFamily: "serif",
      fontStyle: "bold",
    });

    // Malus multiplier display removed (consolidated above)

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
    const cashOutY = 230;

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

    this.cashOutText = this.add.text(cashOutX + 5, cashOutY, this.languageManager.getText("cashOut.button"), {
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
      this.events.on("hardcoreArrowVisibility", this.updateAngleArrowVisibility, this);
    }

    // === ADDICTIVE MECHANICS UI ===
    if (FeatureManager.isEnabled('comboBar')) {
      this.createComboBar();
      EventBus.on(GameEvents.SCORE_COMBO, this.updateComboBar, this);
    }

    if (FeatureManager.isEnabled('progressBar')) {
      this.createProgressBar();
      EventBus.on(GameEvents.TIER_PROGRESS_UPDATE, this.updateProgressBar, this);
    }

    if (FeatureManager.isEnabled('achievements')) {
      this.createAchievementPopup();
      EventBus.on(GameEvents.ACHIEVEMENT_UNLOCKED, this.showAchievementPopup, this);

      // Check for comeback bonus
      EventBus.on(GameEvents.COMEBACK_BONUS_ACTIVE, this.showComebackBonus, this);
    }

    // === SPELL PANEL ===
    this.createSpellPanel();
    EventBus.on(GameEvents.INVENTORY_UPDATE, this.updateSpellPanel, this);
    EventBus.on(GameEvents.POWERUP_EQUIPPED, this.onSpellEquipped, this);

    // Initialize tooltip
    this.createTooltip();

    // FPS Display
    this.fpsText = this.add.text(10, 970, "FPS: 60", {
      fontSize: "14px",
      color: "#00FF00",
      fontFamily: "monospace",
      backgroundColor: "#00000088"
    });

    // Track session stats for Average FPS
    this.sessionStartTime = this.game.getTime();
    this.sessionStartFrame = this.game.loop.frame;
  }

  update(time, delta) {
    const fps = this.game.loop.actualFps;

    // Calculate duration since THIS SCENE started
    const currentTime = this.game.getTime();
    const durationSec = (currentTime - this.sessionStartTime) / 1000;

    // Calculate frames rendered since THIS SCENE started
    const framesRendered = this.game.loop.frame - this.sessionStartFrame;

    // Calculate average
    const avgFps = durationSec > 0.5 ? framesRendered / durationSec : fps;

    this.fpsText.setText(`FPS: ${Math.round(fps)} | Avg: ${Math.round(avgFps)}`);
  }

  /**
   * Update score display
   */
  updateScore(newScore) {
    // Score received is already fully calculated (Points * Bet * Malus)
    // So we display it directly to ensure 1 Score = 1 Yen
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
  updateMultiplier(betMultiplier) {
    // Update with new bet multiplier combined with stored malus multiplier
    const totalMultiplier = betMultiplier * this.malusMultiplier;
    this.multiplierText.setText(`x${totalMultiplier.toFixed(2)}`);
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

    // ANGLE ARROW (Flèche qui se balance) - positionnée au placeholder
    // Arrow pivot point (base) - will move with placeholder
    this.angleArrowBase = this.add.circle(centerX, 100, 4, DESIGN_CONSTANTS.COLORS.GOLD);
    this.angleArrowBase.setVisible(false); // Hidden initially, shown with placeholder

    // Arrow line (graphics)
    this.angleArrow = this.add.graphics();
    this.angleArrow.setVisible(false); // Hidden initially, shown with placeholder
    this.angleArrowAngle = 0; // Current angle in degrees
    this.angleArrowX = centerX; // Store position
    this.angleArrowY = 100;
    this.angleArrowForcePercent = 0; // Force percentage for arrow scaling
  }

  /**
   * Update force indicator (arrow scaling)
   */
  updateForceIndicator(forcePercent) {
    // Store force percent and redraw arrow with new scale
    this.angleArrowForcePercent = forcePercent;
    this.updateAngleIndicator(this.angleArrowAngle);
  }

  /**
   * Update angle arrow
   */
  updateAngleIndicator(angleDegrees) {
    if (!this.angleArrow) return;

    this.angleArrowAngle = angleDegrees;

    // Clear and redraw arrow
    this.angleArrow.clear();

    // Calculate arrow dimensions based on force percentage (scales with force)
    const forceFactor = (this.angleArrowForcePercent || 0) / 100;
    const arrowLength = HARDCORE_LAUNCH.ARROW_LENGTH_MIN +
      (HARDCORE_LAUNCH.ARROW_LENGTH_MAX - HARDCORE_LAUNCH.ARROW_LENGTH_MIN) * forceFactor;
    const lineWidth = HARDCORE_LAUNCH.ARROW_WIDTH_MIN +
      (HARDCORE_LAUNCH.ARROW_WIDTH_MAX - HARDCORE_LAUNCH.ARROW_WIDTH_MIN) * forceFactor;
    const headSize = HARDCORE_LAUNCH.ARROW_HEAD_MIN +
      (HARDCORE_LAUNCH.ARROW_HEAD_MAX - HARDCORE_LAUNCH.ARROW_HEAD_MIN) * forceFactor;

    // Add 90° so that 0° points down, negative to invert left/right
    const angleRad = Phaser.Math.DegToRad(-angleDegrees + 90);

    // Use stored position (updated by placeholder move)
    const baseX = this.angleArrowX;
    const baseY = this.angleArrowY;

    // Arrow line - use cos/sin for proper rotation
    const endX = baseX + Math.cos(angleRad) * arrowLength;
    const endY = baseY + Math.sin(angleRad) * arrowLength;

    // Opacity also scales slightly with force (0.6 to 1.0)
    const opacity = 0.6 + 0.4 * forceFactor;

    this.angleArrow.lineStyle(lineWidth, DESIGN_CONSTANTS.COLORS.PRIMARY, opacity);
    this.angleArrow.beginPath();
    this.angleArrow.moveTo(baseX, baseY);
    this.angleArrow.lineTo(endX, endY);
    this.angleArrow.strokePath();

    // Arrow head (triangle) - size scales with force
    const perpAngle = angleRad + Math.PI / 2;

    this.angleArrow.fillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, opacity);
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
   * Update size indicator (placeholder size shows this visually)
   */
  updateSizeIndicator(size) {
    // Size is now shown visually via the placeholder, no text needed
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
   * Update angle arrow visibility (sync with placeholder)
   */
  updateAngleArrowVisibility(visible) {
    if (this.angleArrow) {
      this.angleArrow.setVisible(visible);
    }
    if (this.angleArrowBase) {
      this.angleArrowBase.setVisible(visible);
    }
  }

  /**
   * Create the combo bar UI
   */
  createComboBar() {
    this.comboContainer = this.add.container(650, 400);

    // Background bar
    const bg = this.add.rectangle(0, 0, 30, 200, 0x000000, 0.5);
    bg.setStrokeStyle(2, 0xFFFFFF, 0.5);
    this.comboContainer.add(bg);

    // Fill bar (starts empty)
    this.comboFill = this.add.rectangle(0, 98, 26, 196, 0xFF4500); // Orange-Red, Full Height
    this.comboFill.setOrigin(0.5, 1); // Grow from bottom
    this.comboFill.scaleY = 0; // Start empty
    this.comboContainer.add(this.comboFill);

    // Sections/Markers
    for (let i = 1; i < 4; i++) {
      const y = 100 - (i * 50); // Divide 200px into 4 sections
      const marker = this.add.rectangle(0, y, 30, 2, 0xFFFFFF, 0.3);
      this.comboContainer.add(marker);
    }

    // Label
    const label = this.add.text(0, 120, this.languageManager.getText("game.combo"), {
      fontSize: "14px",
      fontStyle: "bold",
      color: "#FFFFFF"
    }).setOrigin(0.5);
    this.comboContainer.add(label);

    // Value text
    this.comboValueText = this.add.text(0, -120, "0x", {
      fontSize: "24px",
      fontStyle: "bold",
      color: "#FFD700",
      stroke: "#000000",
      strokeThickness: 3
    }).setOrigin(0.5);
    this.comboContainer.add(this.comboValueText);

    this.comboContainer.setVisible(false); // Hide initially
  }

  /**
   * Update combo bar based on current combo
   */
  updateComboBar(data) {
    if (!this.comboContainer) return;

    const combo = data.combo || 0;

    if (combo > 0) {
      this.comboContainer.setVisible(true);
      this.comboContainer.setAlpha(1);

      // Max visual combo is 20 for full bar, but text goes higher
      const fillPercent = Math.min(combo / 20, 1);

      this.comboFill.scaleY = fillPercent;
      this.comboValueText.setText(`${combo}x`);

      // Change color based on intensity
      if (combo >= 20) this.comboFill.setFillStyle(0xFF00FF); // Purple
      else if (combo >= 10) this.comboFill.setFillStyle(0xFFD700); // Gold
      else if (combo >= 5) this.comboFill.setFillStyle(0xFFA500); // Orange
      else this.comboFill.setFillStyle(0xFF4500); // Red

      // Pulse effect on update
      this.tweens.add({
        targets: this.comboContainer,
        scale: 1.1,
        duration: 100,
        yoyo: true
      });

    } else {
      // Fade out if combo is broken
      this.tweens.add({
        targets: this.comboContainer,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          if (this.comboContainer.alpha === 0) {
            this.comboContainer.setVisible(false);
          }
        }
      });
    }
  }

  /**
   * Create progress bar for next tier/theme
   */
  createProgressBar() {
    this.progressContainer = this.add.container(400, 45); // Top center

    // Background
    const bg = this.add.rectangle(0, 0, 400, 20, 0x000000, 0.5);
    bg.setStrokeStyle(2, 0xFFFFFF, 0.3);
    this.progressContainer.add(bg);

    // Fill
    this.progressFill = this.add.rectangle(-198, 0, 0, 16, 0x00FF00);
    this.progressFill.setOrigin(0, 0.5);
    this.progressContainer.add(this.progressFill);

    // Tier icons/text
    this.currentTierText = this.add.text(-210, 0, "🥉", { fontSize: "20px" }).setOrigin(1, 0.5);
    this.nextTierText = this.add.text(210, 0, "🥈", { fontSize: "20px" }).setOrigin(0, 0.5);
    this.progressContainer.add(this.currentTierText);
    this.progressContainer.add(this.nextTierText);

    // Percentage text
    this.progressText = this.add.text(0, 0, "0%", {
      fontSize: "12px",
      color: "#FFFFFF",
      fontFamily: "monospace"
    }).setOrigin(0.5);
    this.progressContainer.add(this.progressText);
  }

  /**
   * Update progress bar
   */
  updateProgressBar(data) {
    if (!this.progressContainer) return;

    const { currentTier, nextTier, progress } = data;

    // Update icons
    this.currentTierText.setText(currentTier.icon);
    this.nextTierText.setText(nextTier ? nextTier.icon : "👑");

    // Animate fill width
    const targetWidth = Math.max(0, Math.min(396, progress * 396));

    this.tweens.add({
      targets: this.progressFill,
      width: targetWidth,
      duration: 500,
      ease: 'Cubic.out'
    });

    this.progressText.setText(`${Math.floor(progress * 100)}%`);

    // Update color based on tier
    const colors = {
      'classic': 0x00FF00, // Green
      'ocean': 0x00FFFF, // Cyan
      'forest': 0x228B22, // Forest Green
      'sunset': 0xFF4500, // Orange
      'midnight': 0x8A2BE2 // Violet
    };

    if (currentTier.theme && colors[currentTier.theme]) {
      this.progressFill.setFillStyle(colors[currentTier.theme]);
    }
  }

  /**
   * Create achievement popup container
   */
  createAchievementPopup() {
    this.popupContainer = this.add.container(400, -100); // Start off-screen top
    this.popupContainer.setDepth(1000); // Topmost

    // Background panel
    const panel = this.add.rectangle(0, 0, 400, 80, 0x000000, 0.9);
    panel.setStrokeStyle(3, 0xFFD700);
    this.popupContainer.add(panel);

    // Shine/Glow effect
    const glow = this.add.circle(0, 0, 100, 0xFFD700, 0.1);
    this.popupContainer.add(glow);

    // Icon
    this.popupIcon = this.add.text(-160, 0, "🏆", { fontSize: "40px" }).setOrigin(0.5);
    this.popupContainer.add(this.popupIcon);

    // Title
    this.popupTitle = this.add.text(-120, -15, this.languageManager.getText("achievements.unlockedTitle"), {
      fontSize: "16px",
      fontStyle: "bold",
      color: "#FFD700",
      fontFamily: "Arial"
    }).setOrigin(0, 0.5);
    this.popupContainer.add(this.popupTitle);

    // Description
    this.popupDesc = this.add.text(-120, 15, "Description here", {
      fontSize: "14px",
      color: "#FFFFFF",
      fontFamily: "Arial"
    }).setOrigin(0, 0.5);
    this.popupContainer.add(this.popupDesc);
  }

  /**
   * Show achievement notification
   */
  showAchievementPopup(data) {
    if (!this.popupContainer) return;

    const achievement = data.achievement;
    if (!achievement) return;

    this.popupIcon.setText(achievement.icon || "🏆");
    this.popupDesc.setText(achievement.name);

    // Slide down animation
    this.tweens.add({
      targets: this.popupContainer,
      y: 100,
      duration: 500,
      ease: 'Back.out',
      onComplete: () => {
        // Wait and slide up
        this.time.delayedCall(3000, () => {
          this.tweens.add({
            targets: this.popupContainer,
            y: -100,
            duration: 500,
            ease: 'Back.in'
          });
        });
      }
    });

    // Play sound
    if (this.gameScene.audioSystem) {
      // Use a distinct sound or pitch for achievement
      // this.gameScene.audioSystem.play('achievement');
    }
  }

  /**
   * Show comeback bonus notification
   */
  showComebackBonus() {
    const text = this.add.text(400, 300, this.languageManager.getText('comeback.active'), {
      fontSize: '32px',
      color: '#FF0000',
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      scale: 1.5,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }

  /**
   * Clean up event listeners
   */
  /**
   * Create the spell inventory panel
   */
  createSpellPanel() {
    // Position below lives container on right side
    this.spellPanel = this.add.container(750, 100);

    // Config for spells
    const spellConfig = [
      { key: 'ghost', icon: '👻', color: 0xFFFFFF },
      { key: 'bigBall', icon: '⚾', color: 0xFFA500 },
      { key: 'magnet', icon: '🧲', color: 0x00FFFF },
      { key: 'goldenBall', icon: '🌟', color: 0xFFD700 },
      { key: 'freeze', icon: '❄️', color: 0xADD8E6 },
      { key: 'multiBall', icon: '🏐', color: 0xFF4500 }
    ];

    this.spellItems = {};

    spellConfig.forEach((spell, index) => {
      const y = index * 55;

      const itemContainer = this.add.container(0, y);

      // Background (clickable)
      const bg = this.add.rectangle(0, 0, 50, 45, 0x000000, 0.6);
      bg.setStrokeStyle(2, spell.color, 0.5);
      bg.setInteractive({ useHandCursor: true });

      // Click handler
      bg.on('pointerdown', () => {
        PowerUpManager.equipPowerUp(spell.key);
      });

      // Hover handler for tooltip
      bg.on('pointerover', () => {
        // Start 2 second timer
        this.tooltipTimer = this.time.delayedCall(2000, () => {
          const description = this.languageManager.getText(`powerups.tooltips.${spell.key}`) || "???";
          // Convert local position to world position for the tooltip
          const worldPos = this.spellPanel.localTransform.transformPoint(itemContainer.x, itemContainer.y);
          // Show tooltip to the left of the spell icon
          this.showTooltip(worldPos.x - 220, worldPos.y + 25, description);
        });
      });

      bg.on('pointerout', () => {
        // Cancel timer and hide tooltip
        if (this.tooltipTimer) {
          this.tooltipTimer.remove();
          this.tooltipTimer = null;
        }
        this.hideTooltip();
      });

      // Icon
      const icon = this.add.text(0, -5, spell.icon, { fontSize: '24px' }).setOrigin(0.5);

      // Count badge
      const countBg = this.add.circle(15, 15, 10, 0xFF0000);
      const countText = this.add.text(15, 15, "0", {
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      // Highlight border (for equipped state)
      const highlight = this.add.rectangle(0, 0, 50, 45);
      highlight.setStrokeStyle(4, 0xFFFFFF);
      highlight.setVisible(false);

      itemContainer.add([bg, icon, countBg, countText, highlight]);
      this.spellPanel.add(itemContainer);

      this.spellItems[spell.key] = {
        container: itemContainer,
        bg,
        countBg,
        countText,
        highlight,
        baseColor: spell.color
      };

      // Initial state: hidden if 0? Or grayed out? Grayed out.
      this.updateSingleSpellItem(spell.key, 0);
    });
  }

  updateSingleSpellItem(key, count) {
    const item = this.spellItems[key];
    if (!item) return;

    item.countText.setText(count.toString());

    // Visual feedback for availability
    if (count > 0) {
      item.container.setAlpha(1);
      item.bg.setStrokeStyle(2, item.baseColor, 1);
      item.countBg.setVisible(true);
      item.countText.setVisible(true);
      item.bg.setInteractive(); // Enable clicking
    } else {
      item.container.setAlpha(0.3);
      item.bg.setStrokeStyle(1, 0x555555, 0.5);
      item.countBg.setVisible(false);
      item.countText.setVisible(false);
      item.bg.disableInteractive(); // Disable clicking

      // If it was equipped, it should be unequipped by logic elsewhere, 
      // but we ensure highlight is off
      item.highlight.setVisible(false);
    }
  }

  updateSpellPanel(inventory) {
    Object.keys(inventory).forEach(key => {
      this.updateSingleSpellItem(key, inventory[key]);
    });
  }

  onSpellEquipped(data) {
    const equippedType = data.type;

    // Reset all highlights
    Object.values(this.spellItems).forEach(item => {
      item.highlight.setVisible(false);
      // Restore normal stroke
      if (item.container.alpha === 1) { // if available
        item.bg.setStrokeStyle(2, item.baseColor, 1);
      }
    });

    // Highlight equipped
    if (equippedType && this.spellItems[equippedType]) {
      const item = this.spellItems[equippedType];
      item.highlight.setVisible(true);
      item.highlight.setStrokeStyle(3, 0xFFFFFF); // Bright white border

      // Pulse animation
      this.tweens.add({
        targets: item.container,
        scale: 1.1,
        duration: 100,
        yoyo: true
      });
    }
  }

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
      this.events.off("hardcoreArrowVisibility", this.updateAngleArrowVisibility, this);
    }

    EventBus.off(GameEvents.SCORE_COMBO, this.updateComboBar, this);
    EventBus.off(GameEvents.ACHIEVEMENT_UNLOCKED, this.showAchievementPopup, this);
    EventBus.off(GameEvents.TIER_PROGRESS_UPDATE, this.updateProgressBar, this);
    EventBus.off(GameEvents.COMEBACK_BONUS_ACTIVE, this.showComebackBonus, this);
    EventBus.off(GameEvents.INVENTORY_UPDATE, this.updateSpellPanel, this);
    EventBus.off(GameEvents.POWERUP_EQUIPPED, this.onSpellEquipped, this);
  }

  /**
   * Create the hidden tooltip container
   */
  createTooltip() {
    this.tooltipContainer = this.add.container(0, 0).setVisible(false).setDepth(200);

    // Background
    const bg = this.add.rectangle(0, 0, 200, 60, 0x000000, 0.9);
    bg.setStrokeStyle(2, 0xFFFFFF, 0.8);

    // Text
    this.tooltipText = this.add.text(0, 0, "", {
      fontSize: "16px",
      color: "#FFFFFF",
      wordWrap: { width: 190 }
    }).setOrigin(0.5);

    this.tooltipContainer.add([bg, this.tooltipText]);
  }

  /**
   * Show the tooltip at specific position
   */
  showTooltip(x, y, text) {
    if (!this.tooltipContainer) return;

    this.tooltipText.setText(text);
    this.tooltipContainer.setPosition(x, y);
    this.tooltipContainer.setVisible(true);
    this.tooltipContainer.setAlpha(0);

    // Fade in
    this.tweens.add({
      targets: this.tooltipContainer,
      alpha: 1,
      duration: 200
    });
  }

  /**
   * Hide the tooltip
   */
  hideTooltip() {
    if (!this.tooltipContainer) return;
    this.tooltipContainer.setVisible(false);
  }
}

