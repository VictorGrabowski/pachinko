import Phaser from "phaser";
import { DESIGN_CONSTANTS, BETTING_CONFIG } from "../config/gameConfig.js";

export default class BettingPanel extends Phaser.GameObjects.Container {
  constructor(scene, { x = 400, y = 520, onChange } = {}) {
    super(scene, x, y);

    this.onChange = onChange;
    this.betOptions = [...BETTING_CONFIG.betOptions];
    this.exchangeRate = BETTING_CONFIG.exchangeRate;
    this.selectedBet = this.betOptions[0];
    this.betButtons = [];

    this.buildPanel();
    scene.add.existing(this);
    this.selectBet(this.selectedBet, false);
  }

  buildPanel() {
    const width = 640;
    const height = 260;
    const spacing = 140;
    const buttonY = -10;
    const startX = -((this.betOptions.length - 1) * spacing) / 2;

    const background = this.scene.add
      .rectangle(0, 0, width, height, DESIGN_CONSTANTS.COLORS.BACKGROUND, 0.9)
      .setStrokeStyle(3, DESIGN_CONSTANTS.COLORS.PRIMARY);
    this.add(background);

    const title = this.scene.add
      .text(0, -height / 2 + 30, "Place your bet", {
        fontSize: "28px",
        color: "#FFD700",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add(title);

    const subtitle = this.scene.add
      .text(0, -height / 2 + 60, "Convert yen into playable credits", {
        fontSize: "16px",
        color: "#F4A460",
        fontFamily: "serif",
        alpha: 0.9,
      })
      .setOrigin(0.5);
    this.add(subtitle);

    this.betOptions.forEach((amount, index) => {
      const x = startX + index * spacing;
      const button = this.scene.add
        .rectangle(x, buttonY, 120, 70, 0x1a1a2e, 0.8)
        .setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.ACCENT);
      button.setInteractive({ useHandCursor: true });
      button.on("pointerdown", () => this.selectBet(amount));
      button.on("pointerover", () => button.setScale(1.05));
      button.on("pointerout", () => button.setScale(1));

      const label = this.scene.add
        .text(x, buttonY, `¥${amount}`, {
          fontSize: "20px",
          color: "#F4A460",
          fontFamily: "serif",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      this.betButtons.push({ amount, button, label });
      this.add(button);
      this.add(label);
    });

    this.creditPreview = this.scene.add
      .text(0, height / 2 - 40, "", {
        fontSize: "20px",
        color: "#FFD700",
        fontFamily: "serif",
      })
      .setOrigin(0.5);
    this.add(this.creditPreview);
  }

  selectBet(amount, emit = true) {
    this.selectedBet = amount;

    this.betButtons.forEach(({ amount: value, button, label }) => {
      if (value === amount) {
        button.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.9);
        button.setStrokeStyle(3, DESIGN_CONSTANTS.COLORS.GOLD);
        label.setColor("#FFFFFF");
      } else {
        button.setFillStyle(0x1a1a2e, 0.8);
        button.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.ACCENT);
        label.setColor("#F4A460");
      }
    });

    this.creditPreview.setText(`Credits: ${this.calculateCredits(amount)}`);

    if (emit && typeof this.onChange === "function") {
      this.onChange(amount);
    }
  }

  calculateCredits(amount = this.selectedBet) {
    return Math.max(1, Math.floor(amount * this.exchangeRate));
  }

  getSelectedBet() {
    return this.selectedBet;
  }

  setOnChange(callback) {
    this.onChange = callback;
  }
}
