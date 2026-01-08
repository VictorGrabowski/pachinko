import Phaser from "phaser";
import BudgetManager from "../managers/BudgetManager.js";
import BettingPanel from "../ui/BettingPanel.js";
import {
  DESIGN_CONSTANTS,
  TRANSLATIONS,
  BETTING_CONFIG,
} from "../config/gameConfig.js";

export default class BettingScene extends Phaser.Scene {
  constructor() {
    super({ key: "BettingScene" });
    this.statusText = null;
    this.mode = "pre-game";
  }

  create() {
    this.mode = this.scene.settings.data?.mode ?? "pre-game";
    const centerX = 400;
    const centerY = 500;
    this.budgetManager = this.registry.get("budgetManager");

    if (!this.budgetManager) {
      this.budgetManager = new BudgetManager({
        initialYen: BETTING_CONFIG.initialYen,
        exchangeRate: BETTING_CONFIG.exchangeRate,
      });
      this.registry.set("budgetManager", this.budgetManager);
    }

    this.add.rectangle(
      centerX,
      centerY,
      800,
      1000,
      DESIGN_CONSTANTS.COLORS.BACKGROUND
    );

    this.createSakuraEffect();

    this.add
      .text(centerX, 200, "Place your bet", {
        fontSize: "48px",
        color: "#FFD700",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 260, "Convert yen into credits before you play", {
        fontSize: "20px",
        color: "#F4A460",
        fontFamily: "serif",
        align: "center",
      })
      .setOrigin(0.5);

    this.yenText = this.add
      .text(centerX, 320, "", {
        fontSize: "22px",
        color: "#F4A460",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    this.creditText = this.add
      .text(centerX, 360, "", {
        fontSize: "22px",
        color: "#FFD700",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    this.bettingPanel = new BettingPanel(this, {
      x: centerX,
      y: centerY,
    });

    this.updateBudgetLabels();

    const startButton = this.add
      .rectangle(centerX, 820, 280, 60, DESIGN_CONSTANTS.COLORS.ACCENT)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(centerX, 820, TRANSLATIONS.menu.startButton, {
        fontSize: "32px",
        color: "#FFFFFF",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

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
      const betResult = this.budgetManager.placeBet(
        this.bettingPanel.getSelectedBet()
      );

      if (!betResult.success) {
        this.showStatus(betResult.message, "#FF6B35");
        return;
      }

      this.updateBudgetLabels();
      this.notifyGameSceneBudget();

      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => {
        if (this.mode === "pre-game") {
          this.scene.start("GameScene");
        } else {
          const gameScene = this.scene.get("GameScene");
          if (gameScene && typeof gameScene.clearPendingTopUp === "function") {
            gameScene.clearPendingTopUp();
          }
          if (gameScene && typeof gameScene.emitBudget === "function") {
            gameScene.emitBudget();
          }
          this.scene.stop();
          this.scene.resume("GameScene");
        }
      });
    });

    if (this.mode === "pre-game") {
      this.backButton = this.add
        .text(40, 40, "← Back", {
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
  }

  updateBudgetLabels() {
    const { yen, credits } = this.budgetManager.getState();
    this.yenText.setText(`Balance: ¥${yen}`);
    this.creditText.setText(`Credits: ${credits}`);
  }

  showStatus(message, color = "#FFD700") {
    if (this.statusText) {
      this.statusText.destroy();
    }

    this.statusText = this.add
      .text(400, 760, message, {
        fontSize: "20px",
        color,
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    this.time.delayedCall(2000, () => this.statusText?.destroy());
  }

  notifyGameSceneBudget() {
    const gameScene = this.scene.get("GameScene");
    if (gameScene && typeof gameScene.emitBudget === "function") {
      gameScene.emitBudget();
    }
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
}
