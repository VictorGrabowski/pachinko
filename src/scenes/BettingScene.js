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

    // Create malus display panel
    this.createMalusPanel(centerX, 340);

    // Create reroll button
    this.createRerollButton(centerX, 520);

    // Betting section title
    this.add
      .text(centerX, 600, this.languageManager.getText("betting.title"), {
        fontSize: "28px",
        color: "#F4A460",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Betting options
    this.createBettingOptions(centerX, 680);

    // Total Multiplier Calculation Display
    this.totalMultiplierText = this.add.text(centerX, 750, "", {
      fontSize: "18px",
      color: "#FFFFFF",
      fontFamily: "serif",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.updateTotalMultiplierDisplay();

    // Start button (Accept & Bet)
    const startButton = this.add
      .rectangle(centerX, 800, 320, 60, DESIGN_CONSTANTS.COLORS.ACCENT)
      .setInteractive({ useHandCursor: true });
    startButton.setStrokeStyle(3, DESIGN_CONSTANTS.COLORS.GOLD);

    this.startButtonText = this.add
      .text(centerX, 800, this.languageManager.getText("malus.accept"), {
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

    // Change username button
    const changeUsernameBtn = this.add
      .rectangle(centerX, 880, 250, 45, DESIGN_CONSTANTS.COLORS.PRIMARY)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(centerX, 880, this.languageManager.getText("betting.changeUsername"), {
        fontSize: "18px",
        color: "#FFFFFF",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    changeUsernameBtn.on("pointerover", () => {
      changeUsernameBtn.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
    });

    changeUsernameBtn.on("pointerout", () => {
      changeUsernameBtn.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY);
    });

    changeUsernameBtn.on("pointerdown", () => {
      this.usernameOverlay = new UsernameInputOverlay(this, (newUsername) => {
        this.registry.set("currentUsername", newUsername);
        stateManager.saveUsername(newUsername);
        this.usernameText.setText(`${this.languageManager.getText("betting.player")} : ${newUsername}`);
        this.usernameOverlay = null;
      });
      this.usernameOverlay.show();
    });

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
    // Panel background
    this.malusPanel = this.add.rectangle(centerX, centerY, 700, 260, 0x1a1a2e, 0.9);
    this.malusPanel.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.ACCENT);

    // Malus container for easy refresh
    this.malusContainer = this.add.container(0, 0);

    this.updateMalusDisplay(centerX, centerY);
  }

  /**
   * Update the malus display with current configuration
   */
  updateMalusDisplay(centerX, centerY) {
    // Clear previous malus display
    this.malusContainer.removeAll(true);

    const maluses = this.currentMalusConfig.selectedMaluses;
    const multiplier = this.currentMalusConfig.multiplier;

    // Multiplier display at top of panel
    const multiplierLabel = this.add.text(
      centerX, centerY - 100,
      `${this.languageManager.getText("malus.multiplier")}:`,
      {
        fontSize: "20px",
        color: "#F4A460",
        fontFamily: "serif",
      }
    ).setOrigin(0.5);
    this.malusContainer.add(multiplierLabel);

    const multiplierText = this.add.text(
      centerX, centerY - 70,
      `x${multiplier.toFixed(2)}`,
      {
        fontSize: "42px",
        color: "#FFD700",
        fontFamily: "serif",
        fontStyle: "bold",
      }
    ).setOrigin(0.5);
    this.malusContainer.add(multiplierText);

    // Display each malus as a card
    const cardWidth = 150;
    const cardHeight = 100;
    const cardSpacing = 15;
    const totalWidth = maluses.length * cardWidth + (maluses.length - 1) * cardSpacing;
    const startX = centerX - totalWidth / 2 + cardWidth / 2;
    const cardsY = centerY + 30;

    maluses.forEach((malus, index) => {
      const cardX = startX + index * (cardWidth + cardSpacing);

      // Card background
      const cardBg = this.add.rectangle(
        cardX, cardsY,
        cardWidth, cardHeight,
        DESIGN_CONSTANTS.COLORS.PRIMARY, 0.6
      );
      cardBg.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.GOLD);
      this.malusContainer.add(cardBg);

      // Icon
      const icon = this.add.text(cardX, cardsY - 25, malus.icon, {
        fontSize: "28px",
      }).setOrigin(0.5);
      this.malusContainer.add(icon);

      // Name
      const name = this.add.text(
        cardX, cardsY + 10,
        this.languageManager.getText(malus.nameKey),
        {
          fontSize: "14px",
          color: "#FFFFFF",
          fontFamily: "serif",
          fontStyle: "bold",
          align: "center",
          wordWrap: { width: cardWidth - 10 }
        }
      ).setOrigin(0.5);
      this.malusContainer.add(name);

      // Bonus percentage (if not hardcore)
      const bonusText = malus.isHardcore
        ? "x2 TOTAL"
        : `+${malus.bonusPercent}%`;
      const bonus = this.add.text(
        cardX, cardsY + 35,
        bonusText,
        {
          fontSize: "16px",
          color: malus.isHardcore ? "#FF6B35" : "#FFD700",
          fontFamily: "serif",
          fontStyle: "bold",
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
    const rerollCost = Math.floor(this.budgetManager.getBalance() * 0.2);

    // Reroll button background
    this.rerollButton = this.add.rectangle(
      centerX, y,
      280, 50,
      DESIGN_CONSTANTS.COLORS.PRIMARY
    );
    this.rerollButton.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.ACCENT);
    this.rerollButton.setInteractive({ useHandCursor: true });

    // Reroll text with cost
    this.rerollButtonText = this.add.text(
      centerX, y,
      `🎲 ${this.languageManager.getText("malus.reroll")} (${rerollCost} ¥)`,
      {
        fontSize: "20px",
        color: "#FFFFFF",
        fontFamily: "serif",
        fontStyle: "bold",
      }
    ).setOrigin(0.5);

    // Cost subtitle
    this.rerollCostText = this.add.text(
      centerX, y + 35,
      this.languageManager.getText("malus.rerollCost"),
      {
        fontSize: "14px",
        color: "#888888",
        fontFamily: "serif",
      }
    ).setOrigin(0.5);

    this.rerollButton.on("pointerover", () => {
      this.rerollButton.setFillStyle(DESIGN_CONSTANTS.COLORS.ACCENT);
      this.tweens.add({
        targets: [this.rerollButton, this.rerollButtonText],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    this.rerollButton.on("pointerout", () => {
      this.rerollButton.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY);
      this.tweens.add({
        targets: [this.rerollButton, this.rerollButtonText],
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    this.rerollButton.on("pointerdown", () => {
      this.rerollMalusConfig();
    });
  }

  /**
   * Reroll the malus configuration (costs 20% of balance)
   */
  rerollMalusConfig() {
    const cost = Math.floor(this.budgetManager.getBalance() * 0.2);
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
        this.updateMalusDisplay(400, 340);
        this.updateTotalMultiplierDisplay();
        this.tweens.add({
          targets: this.malusContainer,
          alpha: 1,
          duration: 200,
        });
      }
    });

    // Update reroll button cost
    const newCost = Math.floor(this.budgetManager.getBalance() * 0.2);
    this.rerollButtonText.setText(
      `🎲 ${this.languageManager.getText("malus.reroll")} (${newCost} ¥)`
    );

    // Show reroll feedback
    this.showStatus(`-${cost} ¥ 🎲`, "#FF6B35");
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

    this.totalMultiplierText.setText(
      `${malusLabel} (x${malusMultiplier.toFixed(2)}) * ${betLabel} (x${betMultiplier.toFixed(0)}) = ${totalLabel} (x${totalMultiplier.toFixed(2)})`
    );
  }

  updateBalanceDisplay() {
    const balance = this.budgetManager.getBalance();
    this.balanceText.setText(`Balance: ${balance} ¥`);
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

  shutdown() {
    if (this.usernameOverlay) {
      this.usernameOverlay.hide();
      this.usernameOverlay = null;
    }
  }
}
