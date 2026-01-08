import Phaser from "phaser";
import { DESIGN_CONSTANTS, TRANSLATIONS } from "../config/gameConfig.js";
import BettingPanel from "../ui/BettingPanel.js";

export default class BettingScene extends Phaser.Scene {
  constructor() {
    super({ key: "BettingScene" });
  }

  create() {
    const centerX = 400;
    const centerY = 500;

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

    this.bettingPanel = new BettingPanel(this, {
      x: centerX,
      y: centerY,
      onChange: (bet) => this.syncBetToRegistry(bet),
    });

    this.syncBetToRegistry(this.bettingPanel.getSelectedBet());

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
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => {
        this.scene.start("GameScene");
      });
    });

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

  syncBetToRegistry(amount) {
    const credits = this.bettingPanel.calculateCredits(amount);
    this.registry.set("startingBet", amount);
    this.registry.set("startingCredits", credits);
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
