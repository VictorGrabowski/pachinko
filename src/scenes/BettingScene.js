import Phaser from "phaser";
import BudgetManager from "../managers/BudgetManager.js";
import UsernameInputOverlay from "../ui/UsernameInputOverlay.js";
import LanguageManager from "../managers/LanguageManager.js";
import stateManager from "../managers/StateManager.js";
import {
  DESIGN_CONSTANTS,
} from "../config/gameConfig.js";
import {
  generateRandomMalusConfig,
} from "../config/featureConfig.js";

export default class BettingScene extends Phaser.Scene {
  constructor() {
    super({ key: "BettingScene" });
    this.statusText = null;
    this.usernameOverlay = null;
    this.languageManager = LanguageManager;
    this.selectedBet = 100; // Default bet
    this.currentMalusConfig = null; // Current random malus configuration
    this.betOptions = [
      { amount: 100, multiplier: "x1", value: 1.0 },
      { amount: 200, multiplier: "x2", value: 2.0 },
      { amount: 1000, multiplier: "x10", value: 10.0 },
      { amount: 2000, multiplier: "x20", value: 20.0 }
    ];
  }

  create() {
    const centerX = 400;
    const centerY = 500;
    this.budgetManager = this.registry.get("budgetManager");

    if (!this.budgetManager) {
      this.budgetManager = new BudgetManager({ initialBalance: 1000 });
      this.registry.set("budgetManager", this.budgetManager);
    }

    // Check if username is already set
    const currentUsername = this.registry.get("currentUsername");

    // If no username, show username input overlay (début de cycle)
    if (!currentUsername) {
      this.usernameOverlay = new UsernameInputOverlay(this, (username) => {
        this.registry.set("currentUsername", username);
        stateManager.saveUsername(username);
        this.usernameOverlay = null;
      });

      this.time.delayedCall(300, () => {
        if (this.usernameOverlay) {
          this.usernameOverlay.show();
        }
      });
    }

    this.add.rectangle(
      centerX,
      centerY,
      800,
      1000,
      DESIGN_CONSTANTS.COLORS.BACKGROUND
    );

    this.createSakuraEffect();

    // Title - now refers to malus configuration
    this.add
      .text(centerX, 80, this.languageManager.getText("malus.title"), {
        fontSize: "42px",
        color: "#FFD700",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Username display
    const username = this.registry.get("currentUsername") || this.languageManager.getText("betting.player");
    this.usernameText = this.add
      .text(centerX, 130, `${this.languageManager.getText("betting.player")} : ${username}`, {
        fontSize: "20px",
        color: "#F4A460",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    // Small Change Username button next to name
    const changeUserIcon = this.add.text(centerX + 200, 130, "✏️", {
      fontSize: "20px",
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    changeUserIcon.on('pointerdown', () => {
      this.usernameOverlay = new UsernameInputOverlay(this, (newUsername) => {
        this.registry.set("currentUsername", newUsername);
        stateManager.saveUsername(newUsername);
        this.usernameText.setText(`${this.languageManager.getText("betting.player")} : ${newUsername}`);
        this.usernameOverlay = null;
      });
      this.usernameOverlay.show();
    });

    // Hover effect for edit icon
    changeUserIcon.on('pointerover', () => changeUserIcon.setScale(1.2));
    changeUserIcon.on('pointerout', () => changeUserIcon.setScale(1));

    // Balance display
    this.balanceText = this.add
      .text(centerX, 165, "", {
        fontSize: "26px",
        color: "#FFD700",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.updateBalanceDisplay();

    // Check for existing malus config (prevents exploit via menu return)
    const existingMalusConfig = this.registry.get("currentMalusConfig");
    if (existingMalusConfig) {
      // Restore previous config - player cannot get free reroll by returning to menu
      this.currentMalusConfig = existingMalusConfig;
    } else {
      // Generate initial random malus configuration
      this.currentMalusConfig = generateRandomMalusConfig(2, 4);
      // Store in registry to persist across scene transitions
      this.registry.set("currentMalusConfig", this.currentMalusConfig);
    }

    const step1Y = 220; // Moved up to avoid overlap
    this.add.text(centerX, step1Y, this.languageManager.getText("malus.step1"), {
      fontSize: "20px",
      color: "#888888",
      fontFamily: "serif",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Create reroll button (now ABOVE malus panel)
    this.createRerollButton(centerX, step1Y + 50);

    // Create malus display panel (moved down)
    this.createMalusPanel(centerX, step1Y + 200);


    // --- STEP 2: BET ---
    const step2Y = 580;
    this.add.text(centerX, step2Y, this.languageManager.getText("malus.step2"), {
      fontSize: "20px",
      color: "#888888",
      fontFamily: "serif",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Betting options
    this.createBettingOptions(centerX, step2Y + 60);


    // --- STEP 3: TOTAL ---
    const step3Y = 720;
    this.add.text(centerX, step3Y, this.languageManager.getText("malus.step3"), {
      fontSize: "20px",
      color: "#888888",
      fontFamily: "serif",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Total Multiplier Calculation Display
    this.totalMultiplierText = this.add.text(centerX, step3Y + 50, "", {
      fontSize: "24px",
      color: "#FFFFFF",
      fontFamily: "serif",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.updateTotalMultiplierDisplay();

    // Start button (Accept & Bet)
    const startButton = this.add
      .rectangle(centerX, 880, 320, 60, DESIGN_CONSTANTS.COLORS.ACCENT)
      .setInteractive({ useHandCursor: true });
    startButton.setStrokeStyle(3, DESIGN_CONSTANTS.COLORS.GOLD);

    this.startButtonText = this.add
      .text(centerX, 880, this.languageManager.getText("malus.accept"), {
        fontSize: "26px",
        color: "#FFFFFF",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    startButton.on("pointerover", () => {
      startButton.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
      this.startButtonText.setColor("#000000");
      this.tweens.add({
        targets: [startButton, this.startButtonText],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    startButton.on("pointerout", () => {
      startButton.setFillStyle(DESIGN_CONSTANTS.COLORS.ACCENT);
      this.startButtonText.setColor("#FFFFFF");
      this.tweens.add({
        targets: [startButton, this.startButtonText],
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    startButton.on("pointerdown", () => {
      this.startGameWithMalus();
    });

    // End Session / Cash Out Button (Now visible at y=960)
    // Replaces the old "Change Username" button location
    this.createEndSessionButton(centerX, 960);


    // Back button
    this.backButton = this.add
      .text(40, 40, this.languageManager.getText("betting.backToMenu"), {
        fontSize: "20px",
        color: "#F4A460",
        fontFamily: "serif",
      })
      .setInteractive({ useHandCursor: true });

    this.backButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => {
        this.scene.start("MenuScene");
      });
    });
  }

  /**
   * Create the malus configuration panel
   */
  createMalusPanel(centerX, centerY) {
    // Panel background - saved reference for color updates
    this.malusPanel = this.add.rectangle(centerX, centerY, 700, 220, 0x1a1a2e, 0.9);
    this.malusPanel.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.ACCENT);

    // Malus container for easy refresh
    this.malusContainer = this.add.container(0, 0);

    this.updateMalusDisplay(centerX, centerY);
  }

  /**
   * Helper to get color and font size based on multiplier value (0-9 scale)
   * Green -> Bright Red
   */
  getMultiplierStyle(value) {
    // Clamp value to 0-9 for color interpolation
    const t = Math.min(Math.max((value - 1) / 8, 0), 1); // 1.0 -> 0, 9.0+ -> 1

    // Interpolate color from Green (0x00FF00) to Red (0xFF0000)
    // Actually user wants "green to bright red"
    // Let's go Green -> Yellow -> Red
    let r, g, b;

    if (t < 0.5) {
      // Green to Yellow
      const localT = t * 2;
      r = Math.floor(0 + 255 * localT);
      g = 255;
      b = 0;
    } else {
      // Yellow to Red
      const localT = (t - 0.5) * 2;
      r = 255;
      g = Math.floor(255 * (1 - localT));
      b = 0;
    }

    const colorInt = (r << 16) + (g << 8) + b;
    const colorHex = `#${colorInt.toString(16).padStart(6, '0')}`;

    // Size interpolation: 42px to 64px
    const fontSize = Math.floor(42 + (t * 22)) + "px";

    return { color: colorHex, fontSize };
  }

  /**
   * Update the malus display with current configuration
   */
  updateMalusDisplay(centerX, centerY) {
    // Clear previous malus display
    this.malusContainer.removeAll(true);

    const maluses = this.currentMalusConfig.selectedMaluses;
    const multiplier = this.currentMalusConfig.multiplier;
    const hasHardcore = maluses.some(m => m.isHardcore);

    // Update panel appearance based on hardcore mode
    if (this.malusPanel) {
      if (hasHardcore) {
        this.malusPanel.setFillStyle(0x3a0000, 0.95); // Reddish background
        this.malusPanel.setStrokeStyle(4, 0xFF0000); // Red stroke
        // Add subtle shake effect if new
        if (!this.malusPanel.isShaking) {
          this.malusPanel.isShaking = true;
          this.tweens.add({
            targets: this.malusPanel,
            x: centerX + 2,
            duration: 50,
            yoyo: true,
            repeat: 5,
            onComplete: () => { this.malusPanel.isShaking = false; }
          });
        }
      } else {
        this.malusPanel.setFillStyle(0x1a1a2e, 0.9); // Default
        this.malusPanel.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.ACCENT);
      }
    }

    // Multiplier display at top of panel
    // Label with Skull if hardcore
    const labelText = hasHardcore
      ? `💀 ${this.languageManager.getText("malus.multiplier")} (x2) 💀`
      : `${this.languageManager.getText("malus.multiplier")}:`;

    const multiplierLabel = this.add.text(
      centerX, centerY - 80,
      labelText,
      {
        fontSize: hasHardcore ? "24px" : "20px",
        color: hasHardcore ? "#FF0000" : "#F4A460",
        fontFamily: "serif",
        fontStyle: "bold"
      }
    ).setOrigin(0.5);
    this.malusContainer.add(multiplierLabel);

    // Dynamic style for the value
    const style = this.getMultiplierStyle(multiplier);

    const multiplierText = this.add.text(
      centerX, centerY - 45,
      `x${multiplier.toFixed(2)}`,
      {
        fontSize: style.fontSize,
        color: style.color,
        fontFamily: "serif",
        fontStyle: "bold",
        stroke: hasHardcore ? "#000000" : null,
        strokeThickness: hasHardcore ? 4 : 0
      }
    ).setOrigin(0.5);

    // Animate scale on refresh
    this.tweens.add({
      targets: multiplierText,
      scale: { from: 0.5, to: 1 },
      duration: 300,
      ease: 'Back.out'
    });

    this.malusContainer.add(multiplierText);

    // Display each malus as a card
    // Filter out hardcore mode from cards since it has a global effect (red panel + skull)
    const visibleMaluses = maluses.filter(m => !m.isHardcore);

    const cardWidth = 150;
    const cardHeight = 110; // Slightly taller for better text
    const cardSpacing = 15;

    // Create a base card for "Normal Multiplier" (+1x)
    const baseMalusCard = {
      icon: "✨",
      nameKey: "malus.normalMultiplier",
      bonusPercent: null, // Special flag
      isBase: true
    };

    const displayMaluses = [baseMalusCard, ...visibleMaluses];

    const totalWidth = displayMaluses.length * cardWidth + (displayMaluses.length - 1) * cardSpacing;
    const startX = centerX - totalWidth / 2 + cardWidth / 2;
    const cardsY = centerY + 45;

    displayMaluses.forEach((malus, index) => {
      const cardX = startX + index * (cardWidth + cardSpacing);

      // Card background
      const cardBg = this.add.rectangle(
        cardX, cardsY,
        cardWidth, cardHeight,
        DESIGN_CONSTANTS.COLORS.PRIMARY,
        0.7
      );
      cardBg.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.GOLD);
      this.malusContainer.add(cardBg);

      // Icon
      const icon = this.add.text(cardX, cardsY - 30, malus.icon, {
        fontSize: "32px",
      }).setOrigin(0.5);
      this.malusContainer.add(icon);

      // Name
      const name = this.add.text(
        cardX, cardsY,
        this.languageManager.getText(malus.nameKey),
        {
          fontSize: "13px",
          color: "#FFFFFF",
          fontFamily: "serif",
          fontStyle: "bold",
          align: "center",
          wordWrap: { width: cardWidth - 10 }
        }
      ).setOrigin(0.5);
      this.malusContainer.add(name);

      // EXACT IMPACT DISPLAY
      // "Explicit impact" instructions
      // Convert percentage to multiplier add-on, e.g. 33% -> +0.33x
      let impactText;
      let color;

      if (malus.isBase) {
        impactText = "+1x";
        color = "#FFFFFF"; // White for base
      } else {
        const val = (malus.bonusPercent / 100).toFixed(2);
        impactText = `+${val}x`;
        color = "#FFFF00"; // Yellow for normal adds
      }

      const bonus = this.add.text(
        cardX, cardsY + 35,
        impactText,
        {
          fontSize: "20px",
          color: color,
          fontFamily: "monospace",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3
        }
      ).setOrigin(0.5);
      this.malusContainer.add(bonus);
    });

    // If no maluses (edge case)
    if (maluses.length === 0) {
      const noMalusText = this.add.text(
        centerX, cardsY,
        this.languageManager.getText("malus.noMalus"),
        {
          fontSize: "24px",
          color: "#888888",
          fontFamily: "serif",
        }
      ).setOrigin(0.5);
      this.malusContainer.add(noMalusText);
    }
  }

  /**
   * Create the reroll button with cost display
   */
  createRerollButton(centerX, y) {
    this.rerollButton = this.add.rectangle(
      centerX, y,
      280, 50,
      DESIGN_CONSTANTS.COLORS.PRIMARY
    );
    this.rerollButton.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.ACCENT);
    this.rerollButton.setInteractive({ useHandCursor: true });

    this.rerollButtonText = this.add.text(
      centerX, y,
      "",
      {
        fontSize: "20px",
        color: "#FFFFFF",
        fontFamily: "serif",
        fontStyle: "bold",
      }
    ).setOrigin(0.5);

    // Initial state update
    this.updateRerollButtonState();

    this.rerollButton.on("pointerover", () => {
      if (this.rerollButton.getData('disabled')) return;
      this.rerollButton.setFillStyle(DESIGN_CONSTANTS.COLORS.ACCENT);
      this.tweens.add({
        targets: [this.rerollButton, this.rerollButtonText],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    this.rerollButton.on("pointerout", () => {
      if (this.rerollButton.getData('disabled')) return;
      this.rerollButton.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY);
      this.tweens.add({
        targets: [this.rerollButton, this.rerollButtonText],
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    this.rerollButton.on("pointerdown", () => {
      if (this.rerollButton.getData('disabled')) {
        this.showStatus(this.languageManager.getText("malus.insufficientReroll"), "#FF6B35");
        return;
      }
      this.rerollMalusConfig();
    });
  }

  /**
   * Update the reroll button state based on simplified logic:
   * Disable if remaining balance after reroll < 100
   */
  updateRerollButtonState() {
    if (!this.rerollButton) return;

    const balance = this.budgetManager.getBalance();
    const rerollCost = Math.floor(balance * 0.2);
    const predictedBalance = balance - rerollCost;

    // Prevent if balance would drop below 100 (min bet)
    // This addresses the user request "balance < 100%" (interpreted as < 100 units)
    const isSafe = predictedBalance >= 100;

    this.rerollButtonText.setText(
      `🎲 ${this.languageManager.getText("malus.reroll")} (-${rerollCost} ¥)`
    );

    if (isSafe) {
      this.rerollButton.setData('disabled', false);
      this.rerollButton.setAlpha(1);
      this.rerollButtonText.setAlpha(1);
      this.rerollButton.setInteractive({ useHandCursor: true });
    } else {
      this.rerollButton.setData('disabled', true);
      this.rerollButton.setAlpha(0.5);
      this.rerollButtonText.setAlpha(0.5);
    }
  }

  /**
   * Reroll the malus configuration (costs 20% of balance)
   */
  rerollMalusConfig() {
    const cost = Math.floor(this.budgetManager.getBalance() * 0.2);

    // Safety check BEFORE deducting
    if (this.budgetManager.getBalance() - cost < 100) {
      this.showStatus(this.languageManager.getText("malus.insufficientReroll"), "#FF6B35");
      return;
    }

    const result = this.budgetManager.deductAmount(cost);

    if (!result.success) {
      const errorMessage = this.languageManager.getText(result.errorKey);
      this.showStatus(errorMessage, "#FF6B35");
      return;
    }

    // Update balance display
    this.updateBalanceDisplay();

    // Generate new random configuration
    this.currentMalusConfig = generateRandomMalusConfig(2, 4);
    // Update registry with new config
    this.registry.set("currentMalusConfig", this.currentMalusConfig);

    // Update malus display with animation
    this.tweens.add({
      targets: this.malusContainer,
      alpha: 0,
      duration: 150,
      onComplete: () => {
        this.updateMalusDisplay(400, 420);
        this.updateTotalMultiplierDisplay();
        this.tweens.add({
          targets: this.malusContainer,
          alpha: 1,
          duration: 200,
        });
      }
    });

    // Update button state (cost and disabled status)
    this.updateRerollButtonState();

    // Show reroll feedback

  }

  /**
   * Start the game with selected malus and bet
   */
  startGameWithMalus() {
    const betResult = this.budgetManager.placeBet(this.selectedBet);

    if (!betResult.success) {
      const errorMessage = this.languageManager.getText(betResult.errorKey);
      this.showStatus(errorMessage, "#FF6B35");
      return;
    }

    // Store malus configuration in registry for GameScene
    this.registry.set("activeMaluses", this.currentMalusConfig.selectedMaluses);
    this.registry.set("malusMultiplier", this.currentMalusConfig.multiplier);

    // Clear the temporary malus config (player committed to this config)
    this.registry.remove("currentMalusConfig");

    // Transition to game
    this.cameras.main.fadeOut(400);
    this.time.delayedCall(400, () => {
      this.scene.start("GameScene");
    });
  }

  createBettingOptions(centerX, y) {
    const buttonWidth = 140;
    const buttonHeight = 70;
    const spacing = 15;
    const totalWidth = (buttonWidth * 4) + (spacing * 3);
    const startX = centerX - totalWidth / 2;

    this.betButtons = [];

    this.betOptions.forEach((option, index) => {
      const x = startX + (buttonWidth / 2) + index * (buttonWidth + spacing);

      const isSelected = option.amount === this.selectedBet;
      const button = this.add.rectangle(
        x, y,
        buttonWidth, buttonHeight,
        isSelected ? DESIGN_CONSTANTS.COLORS.GOLD : DESIGN_CONSTANTS.COLORS.PRIMARY
      );
      button.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.GOLD);
      button.setInteractive({ useHandCursor: true });

      const amountText = this.add.text(x, y - 10, `${option.amount} ¥`, {
        fontSize: "22px",
        color: isSelected ? "#000000" : "#FFFFFF",
        fontFamily: "serif",
        fontStyle: "bold",
      }).setOrigin(0.5);

      const multiplierText = this.add.text(x, y + 18, option.multiplier, {
        fontSize: "18px",
        color: isSelected ? "#000000" : "#FFD700",
        fontFamily: "serif",
      }).setOrigin(0.5);

      button.on("pointerdown", () => {
        this.selectBet(option.amount);
      });

      button.on("pointerover", () => {
        if (option.amount !== this.selectedBet) {
          button.setFillStyle(DESIGN_CONSTANTS.COLORS.ACCENT);
        }
      });

      button.on("pointerout", () => {
        if (option.amount !== this.selectedBet) {
          button.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY);
        }
      });

      this.betButtons.push({ button, amountText, multiplierText, amount: option.amount });
    });
  }

  selectBet(amount) {
    this.selectedBet = amount;

    this.betButtons.forEach(btn => {
      const isSelected = btn.amount === amount;
      btn.button.setFillStyle(isSelected ? DESIGN_CONSTANTS.COLORS.GOLD : DESIGN_CONSTANTS.COLORS.PRIMARY);
      btn.amountText.setColor(isSelected ? "#000000" : "#FFFFFF");
      btn.multiplierText.setColor(isSelected ? "#000000" : "#FFD700");
    });

    this.updateTotalMultiplierDisplay();
  }

  updateTotalMultiplierDisplay() {
    if (!this.currentMalusConfig || !this.selectedBet) return;

    const malusMultiplier = this.currentMalusConfig.multiplier;
    const selectedOption = this.betOptions.find(opt => opt.amount === this.selectedBet);
    const betMultiplier = selectedOption ? selectedOption.value : 1.0;
    const totalMultiplier = malusMultiplier * betMultiplier;

    const malusLabel = this.languageManager.getText("malus.multiplierLabel");
    const betLabel = this.languageManager.getText("betting.betMultiplierLabel");
    const totalLabel = this.languageManager.getText("malus.totalMultiplierLabel");

    // Format: (Malus xA) * (Bet xB) = TOTAL xC
    this.totalMultiplierText.setText(
      `(${malusMultiplier.toFixed(2)})  x  (${betMultiplier.toFixed(0)})  =  x${totalMultiplier.toFixed(2)}`
    );

    // Contextual explanation below
    if (this.explanationText) this.explanationText.destroy();

    this.explanationText = this.add.text(this.cameras.main.centerX, this.totalMultiplierText.y + 30,
      `${malusLabel} x ${betLabel} = ${totalLabel}`, {
      fontSize: "16px",
      color: "#888888",
      fontFamily: "serif"
    }).setOrigin(0.5);
  }

  updateBalanceDisplay() {
    const balance = this.budgetManager.getBalance();
    this.balanceText.setText(`${this.languageManager.getText("malus.balance")}: ${balance} ¥`);
  }

  showStatus(message, color = "#FFD700") {
    if (this.statusText) {
      this.statusText.destroy();
    }

    this.statusText = this.add
      .text(400, 560, message, {
        fontSize: "18px",
        color,
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    this.time.delayedCall(2000, () => this.statusText?.destroy());
  }

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
   * Create the button to end the session and cash out
   */
  createEndSessionButton(x, y) {
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 300, 50, 0x8B0000); // Dark red
    bg.setStrokeStyle(2, 0xFF4500); // Orange-red stroke
    bg.setInteractive({ useHandCursor: true });

    const text = this.add.text(0, 0, this.languageManager.getText("malus.cashOutButton"), {
      fontSize: "18px",
      color: "#FFFFFF",
      fontFamily: "serif",
      fontStyle: "bold"
    }).setOrigin(0.5);

    button.add([bg, text]);

    bg.on('pointerover', () => {
      bg.setFillStyle(0xFF0000); // Bright red
      button.setScale(1.05);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x8B0000);
      button.setScale(1);
    });

    bg.on('pointerdown', () => {
      this.endSession();
    });
  }

  /**
   * End the session, save score, and go to Game Over
   */
  endSession() {
    const finalBalance = this.budgetManager.getBalance();
    const username = this.registry.get("currentUsername") || "Player";

    // Save score
    stateManager.saveScoreEntry({
      username: username,
      score: finalBalance,
      date: new Date().toISOString()
    });

    // Transition to Game Over Scene
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => {
      this.scene.start("GameOverScene", {
        score: 0, // No score from "last game"
        winnings: 0,
        balance: finalBalance,
        balanceMax: finalBalance, // Use final balance as max for record
        username: username,
        cycleEnded: true,
        isCashOut: true
      });
    });
  }

  shutdown() {
    if (this.usernameOverlay) {
      this.usernameOverlay.hide();
      this.usernameOverlay = null;
    }
  }
}
