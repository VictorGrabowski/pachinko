/**
 * Scoreboard Scene - Displays top 10 scores
 * Japanese aesthetic with wabi-sabi principles
 */
import Phaser from "phaser";
import { DESIGN_CONSTANTS } from "../config/gameConfig.js";
import LanguageManager from "../managers/LanguageManager.js";
import stateManager from "../managers/StateManager.js";
import { formatNumber } from "../utils/helpers.js";

export default class ScoreboardScene extends Phaser.Scene {
  constructor() {
    super({ key: "ScoreboardScene" });
  }

  create() {
    this.languageManager = LanguageManager;
    this.stateManager = stateManager;
    this.textElements = [];

    // Background with fade
    const bg = this.add.rectangle(
      400,
      500,
      800,
      1000,
      DESIGN_CONSTANTS.COLORS.BACKGROUND
    );
    bg.setAlpha(0.95);

    // Sakura particles (subtle background decoration)
    this.createSakuraParticles();

    // Title
    this.createTitle();

    // Scoreboard content
    this.createScoreboardTable();

    // Back button
    this.createBackButton();

    // Listen for language changes
    this.languageManager.onLanguageChanged(() => {
      this.refreshContent();
    });

    // Fade in animation
    this.cameras.main.fadeIn(500);
  }

  /**
   * Create sakura particle effect
   */
  createSakuraParticles() {
    const particles = this.add.particles(0, 0, "particle", {
      x: { min: 0, max: 800 },
      y: -50,
      lifespan: 8000,
      speedY: { min: 20, max: 40 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.3, end: 0.1 },
      alpha: { start: 0.4, end: 0 },
      frequency: 500,
      tint: [
        DESIGN_CONSTANTS.COLORS.SAKURA,
        DESIGN_CONSTANTS.COLORS.PRIMARY,
      ],
    });
  }

  /**
   * Create title section
   */
  createTitle() {
    const titleText = this.add.text(
      400,
      80,
      this.languageManager.getText("scoreboard.title"),
      {
        fontSize: "48px",
        fontFamily: "serif",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 4,
      }
    );
    titleText.setOrigin(0.5);
    this.textElements.push({ element: titleText, key: "scoreboard.title" });

    const subtitle = this.add.text(
      400,
      130,
      this.languageManager.getText("scoreboard.top10"),
      {
        fontSize: "20px",
        fontFamily: "serif",
        color: "#F4A460",
      }
    );
    subtitle.setOrigin(0.5);
    this.textElements.push({ element: subtitle, key: "scoreboard.top10" });
  }

  /**
   * Create scoreboard table with top 10 scores
   */
  createScoreboardTable() {
    const topScores = this.stateManager.getTopScores();

    if (topScores.length === 0) {
      this.createEmptyMessage();
      return;
    }

    // Table header
    const headerY = 200;
    const rowHeight = 60;

    this.createTableHeader(headerY);

    // Score entries
    topScores.forEach((entry, index) => {
      const y = headerY + 60 + index * rowHeight;
      this.createScoreRow(entry, index + 1, y);
    });
  }

  /**
   * Create table header
   */
  createTableHeader(y) {
    const headerStyle = {
      fontSize: "18px",
      fontFamily: "serif",
      color: "#FFD700",
      fontStyle: "bold",
    };

    // Rank
    const rankHeader = this.add.text(
      100,
      y,
      this.languageManager.getText("scoreboard.rank"),
      headerStyle
    );
    rankHeader.setOrigin(0.5);
    this.textElements.push({
      element: rankHeader,
      key: "scoreboard.rank",
    });

    // Username
    const usernameHeader = this.add.text(
      280,
      y,
      this.languageManager.getText("scoreboard.username"),
      headerStyle
    );
    usernameHeader.setOrigin(0.5);
    this.textElements.push({
      element: usernameHeader,
      key: "scoreboard.username",
    });

    // Score
    const scoreHeader = this.add.text(
      500,
      y,
      this.languageManager.getText("scoreboard.score"),
      headerStyle
    );
    scoreHeader.setOrigin(0.5);
    this.textElements.push({
      element: scoreHeader,
      key: "scoreboard.score",
    });

    // Date
    const dateHeader = this.add.text(
      680,
      y,
      this.languageManager.getText("scoreboard.date"),
      headerStyle
    );
    dateHeader.setOrigin(0.5);
    this.textElements.push({
      element: dateHeader,
      key: "scoreboard.date",
    });

    // Separator line
    const line = this.add.rectangle(
      400,
      y + 25,
      700,
      2,
      DESIGN_CONSTANTS.COLORS.GOLD
    );
    line.setAlpha(0.5);
  }

  /**
   * Create a score row
   */
  createScoreRow(entry, rank, y) {
    const isTopThree = rank <= 3;
    const rowStyle = {
      fontSize: "16px",
      fontFamily: "serif",
      color: isTopThree ? "#FFD700" : "#F4A460",
    };

    // Background for row (subtle)
    const rowBg = this.add.rectangle(
      400,
      y,
      700,
      50,
      DESIGN_CONSTANTS.COLORS.PRIMARY
    );
    rowBg.setAlpha(0.1);

    // Rank with medal for top 3
    let rankText = rank.toString();
    if (rank === 1) rankText = "🥇";
    else if (rank === 2) rankText = "🥈";
    else if (rank === 3) rankText = "🥉";

    const rankElement = this.add.text(100, y, rankText, {
      ...rowStyle,
      fontSize: isTopThree ? "24px" : "16px",
    });
    rankElement.setOrigin(0.5);

    // Username
    const usernameElement = this.add.text(280, y, entry.username, rowStyle);
    usernameElement.setOrigin(0.5);

    // Score (formatted with commas)
    const scoreElement = this.add.text(
      500,
      y,
      formatNumber(entry.score),
      rowStyle
    );
    scoreElement.setOrigin(0.5);

    // Date (formatted)
    const dateStr = this.formatDate(entry.date);
    const dateElement = this.add.text(680, y, dateStr, {
      ...rowStyle,
      fontSize: "14px",
    });
    dateElement.setOrigin(0.5);

    // Highlight top 3 with glow
    if (isTopThree) {
      rowBg.setAlpha(0.2);
      const glow = this.add.rectangle(
        400,
        y,
        700,
        50,
        DESIGN_CONSTANTS.COLORS.GOLD
      );
      glow.setAlpha(0.1);
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      const lang = this.languageManager.getCurrentLanguage();

      // Use Intl.DateTimeFormat with current locale
      const formatter = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });

      return formatter.format(date);
    } catch (e) {
      return dateString;
    }
  }

  /**
   * Create empty message when no scores
   */
  createEmptyMessage() {
    const message = this.add.text(
      400,
      400,
      this.languageManager.getText("scoreboard.noScores"),
      {
        fontSize: "24px",
        fontFamily: "serif",
        color: "#F4A460",
      }
    );
    message.setOrigin(0.5);
    this.textElements.push({
      element: message,
      key: "scoreboard.noScores",
    });
  }

  /**
   * Create back button
   */
  createBackButton() {
    const buttonY = 920;

    // Button background
    const button = this.add.rectangle(
      400,
      buttonY,
      250,
      60,
      DESIGN_CONSTANTS.COLORS.PRIMARY
    );
    button.setStrokeStyle(3, DESIGN_CONSTANTS.COLORS.GOLD);
    button.setInteractive({ useHandCursor: true });

    // Button text
    const buttonText = this.add.text(
      400,
      buttonY,
      this.languageManager.getText("scoreboard.back"),
      {
        fontSize: "24px",
        fontFamily: "serif",
        color: "#FFD700",
        fontStyle: "bold",
      }
    );
    buttonText.setOrigin(0.5);
    this.textElements.push({ element: buttonText, key: "scoreboard.back" });

    // Hover effects
    button.on("pointerover", () => {
      button.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
      buttonText.setColor("#2E3A59");
      this.tweens.add({
        targets: [button, buttonText],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
        ease: "Power2",
      });
    });

    button.on("pointerout", () => {
      button.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY);
      buttonText.setColor("#FFD700");
      this.tweens.add({
        targets: [button, buttonText],
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: "Power2",
      });
    });

    // Click handler
    button.on("pointerdown", () => {
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => {
        this.scene.start("MenuScene");
      });
    });
  }

  /**
   * Refresh content when language changes
   */
  refreshContent() {
    // Update all text elements
    this.textElements.forEach((item) => {
      if (item.key) {
        item.element.setText(this.languageManager.getText(item.key));
      }
    });

    // Redraw entire table to update date formats
    this.scene.restart();
  }

  /**
   * Cleanup
   */
  shutdown() {
    // Remove language listener
    this.languageManager.offLanguageChanged(this.refreshContent);
  }
}
