import Phaser from "phaser";
import BudgetManager from "../managers/BudgetManager.js";
import UsernameInputOverlay from "../ui/UsernameInputOverlay.js";
import LanguageManager from "../managers/LanguageManager.js";
import {
  DESIGN_CONSTANTS,
} from "../config/gameConfig.js";

export default class BettingScene extends Phaser.Scene {
  constructor() {
    super({ key: "BettingScene" });
    this.statusText = null;
    this.usernameOverlay = null;
    this.languageManager = LanguageManager;
    this.selectedBet = 100; // Mise par défaut
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

    // Title
    this.add
      .text(centerX, 150, "Placer votre mise", {
        fontSize: "48px",
        color: "#FFD700",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Username display
    const username = this.registry.get("currentUsername") || "Joueur";
    this.usernameText = this.add
      .text(centerX, 220, `Joueur : ${username}`, {
        fontSize: "22px",
        color: "#F4A460",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    // Balance display
    this.balanceText = this.add
      .text(centerX, 260, "", {
        fontSize: "28px",
        color: "#FFD700",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.balanceMaxText = this.add
      .text(centerX, 300, "", {
        fontSize: "18px",
        color: "#F4A460",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    this.updateBalanceDisplay();

    // Betting options
    this.createBettingOptions(centerX, centerY);

    // Start button
    const startButton = this.add
      .rectangle(centerX, 780, 300, 60, DESIGN_CONSTANTS.COLORS.ACCENT)
      .setInteractive({ useHandCursor: true });

    this.startButtonText = this.add
      .text(centerX, 780, "Commencer la partie", {
        fontSize: "28px",
        color: "#FFFFFF",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    startButton.on("pointerover", () => {
      startButton.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
      this.tweens.add({
        targets: [startButton, this.startButtonText],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    startButton.on("pointerout", () => {
      startButton.setFillStyle(DESIGN_CONSTANTS.COLORS.ACCENT);
      this.tweens.add({
        targets: [startButton, this.startButtonText],
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    startButton.on("pointerdown", () => {
      const betResult = this.budgetManager.placeBet(this.selectedBet);

      if (!betResult.success) {
        this.showStatus(betResult.message, "#FF6B35");
        return;
      }

      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => {
        this.scene.start("GameScene");
      });
    });

    // Change username button
    const changeUsernameBtn = this.add
      .rectangle(centerX, 860, 250, 50, DESIGN_CONSTANTS.COLORS.PRIMARY)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(centerX, 860, "Changer de pseudo", {
        fontSize: "20px",
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
        this.usernameText.setText(`Joueur : ${newUsername}`);
        this.usernameOverlay = null;
      });
      this.usernameOverlay.show();
    });

    // Back button
    this.backButton = this.add
      .text(40, 40, "← Menu", {
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

  createBettingOptions(centerX, centerY) {
    const betOptions = [
      { amount: 100, multiplier: "x1" },
      { amount: 200, multiplier: "x2" },
      { amount: 1000, multiplier: "x10" },
      { amount: 2000, multiplier: "x20" }
    ];

    const buttonWidth = 160;
    const buttonHeight = 100;
    const spacing = 20;
    const totalWidth = (buttonWidth * 4) + (spacing * 3);
    const startX = centerX - totalWidth / 2;
    const y = 480;

    this.betButtons = [];

    betOptions.forEach((option, index) => {
      const x = startX + (buttonWidth / 2) + index * (buttonWidth + spacing);
      
      const isSelected = option.amount === this.selectedBet;
      const button = this.add.rectangle(
        x, y,
        buttonWidth, buttonHeight,
        isSelected ? DESIGN_CONSTANTS.COLORS.GOLD : DESIGN_CONSTANTS.COLORS.PRIMARY
      );
      button.setStrokeStyle(3, DESIGN_CONSTANTS.COLORS.GOLD);
      button.setInteractive({ useHandCursor: true });

      const amountText = this.add.text(x, y - 15, `${option.amount} ¥`, {
        fontSize: "28px",
        color: isSelected ? "#000000" : "#FFFFFF",
        fontFamily: "serif",
        fontStyle: "bold",
      }).setOrigin(0.5);

      const multiplierText = this.add.text(x, y + 20, option.multiplier, {
        fontSize: "24px",
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
  }

  updateBalanceDisplay() {
    const balance = this.budgetManager.getBalance();
    const balanceMax = this.budgetManager.getBalanceMax();
    this.balanceText.setText(`Balance: ${balance} ¥`);
    this.balanceMaxText.setText(`Record: ${balanceMax} ¥`);
  }

  showStatus(message, color = "#FFD700") {
    if (this.statusText) {
      this.statusText.destroy();
    }

    this.statusText = this.add
      .text(400, 720, message, {
        fontSize: "20px",
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
