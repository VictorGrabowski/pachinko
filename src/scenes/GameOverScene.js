import Phaser from "phaser";
import { DESIGN_CONSTANTS, TRANSLATIONS } from "../config/gameConfig.js";
import { formatScore } from "../utils/helpers.js";
import stateManager from "../managers/StateManager.js";
import LanguageManager from "../managers/LanguageManager.js";

/**
 * Game Over Scene - displays final score and restart option
 */
export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  init(data) {
    this.finalScore = data.balanceMax || 0;
    this.username = data.username || "Player";
    this.cycleEnded = data.cycleEnded || false;
    this.stateManager = stateManager;
    this.languageManager = LanguageManager;
  }

  create() {
    const centerX = 400; // Fixed game width / 2
    const centerY = 500; // Fixed game height / 2

    // Background with fade in
    this.add.rectangle(
      centerX,
      centerY,
      800,
      1000,
      DESIGN_CONSTANTS.COLORS.BACKGROUND,
      0.95
    );

    // Sakura petals (slower, more melancholic)
    this.add.particles(0, 0, "petal", {
      x: { min: 0, max: 800 },
      y: -50,
      lifespan: 12000,
      speedY: { min: 30, max: 60 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.5, end: 0.2 },
      alpha: { start: 0.5, end: 0.1 },
      rotate: { start: 0, end: 360 },
      frequency: 600,
    });

    // Game Over text
    const gameOverText = this.add
      .text(centerX, 200, this.languageManager.getText('gameOver.title'), {
        fontSize: "72px",
        color: "#F4A460",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Haiku-inspired message (mono no aware)
    const haiku = this.add
      .text(centerX, 280, this.languageManager.getText('gameOver.haiku'), {
        fontSize: "20px",
        color: "#F4A460",
        fontFamily: "serif",
        align: "center",
        lineSpacing: 10,
        alpha: 0,
      })
      .setOrigin(0.5);

    // Score display
    const finalScoreLabel = this.add
      .text(centerX, 420, this.languageManager.getText('gameOver.finalScore'), {
        fontSize: "24px",
        color: "#F4A460",
        fontFamily: "serif",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const scoreText = this.add
      .text(centerX, 480, formatScore(this.finalScore), {
        fontSize: "64px",
        color: "#FFD700",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Rank display (if in top 10)
    let rankText = null;
    const rank = this.getRank();
    if (rank !== null) {
      const isNewHighScore = rank === 1 && this.finalScore > 0;
      const rankMessage = isNewHighScore 
        ? this.languageManager.getText('gameOver.newHighScore')
        : `${this.languageManager.getText('gameOver.yourRank')}: #${rank}`;
      
      rankText = this.add
        .text(centerX, 550, rankMessage, {
          fontSize: "24px",
          color: isNewHighScore ? "#00FF00" : "#F4A460",
          fontFamily: "serif",
          fontStyle: isNewHighScore ? "bold" : "normal",
        })
        .setOrigin(0.5)
        .setAlpha(0);
      
      // Add glow effect for new high score
      if (isNewHighScore) {
        this.tweens.add({
          targets: rankText,
          scale: 1.1,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    }

    // Scoreboard button
    const scoreboardButton = this.add
      .rectangle(centerX, 650, 300, 60, DESIGN_CONSTANTS.COLORS.GOLD)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0);

    const scoreboardText = this.add
      .text(centerX, 650, this.languageManager.getText('gameOver.viewScoreboard'), {
        fontSize: "24px",
        color: "#000000",
        fontFamily: "serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Restart button
    const restartButton = this.add
      .rectangle(centerX, 740, 300, 60, DESIGN_CONSTANTS.COLORS.ACCENT)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0);

    const restartText = this.add
      .text(centerX, 740, this.languageManager.getText('gameOver.restart'), {
        fontSize: "28px",
        color: "#FFFFFF",
        fontFamily: "serif",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Menu button
    const menuButton = this.add
      .rectangle(centerX, 830, 300, 60, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0);

    const menuText = this.add
      .text(centerX, 830, this.languageManager.getText('gameOver.menu'), {
        fontSize: "28px",
        color: "#FFFFFF",
        fontFamily: "serif",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Fade in animations
    const elementsToFade = [
      { target: gameOverText, delay: 0 },
      { target: haiku, delay: 500 },
      { target: finalScoreLabel, delay: 1000 },
      { target: scoreText, delay: 1200 },
    ];
    
    if (rankText) {
      elementsToFade.push({ target: rankText, delay: 1400 });
    }
    
    elementsToFade.push(
      { target: scoreboardButton, delay: 1600 },
      { target: scoreboardText, delay: 1600 },
      { target: restartButton, delay: 1800 },
      { target: restartText, delay: 1800 },
      { target: menuButton, delay: 2000 },
      { target: menuText, delay: 2000 }
    );
    
    this.fadeInElements(elementsToFade);

    // Scoreboard button interactions
    scoreboardButton.on("pointerover", () => {
      scoreboardButton.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY);
      this.tweens.add({
        targets: scoreboardButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    scoreboardButton.on("pointerout", () => {
      scoreboardButton.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
      this.tweens.add({
        targets: scoreboardButton,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    scoreboardButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => {
        // Reset budget cycle to 1000 Yen before viewing scoreboard
        const budgetManager = this.registry.get("budgetManager");
        if (budgetManager) {
          budgetManager.resetCycle();
        }
        
        this.scene.start("ScoreboardScene");
      });
    });

    // Button interactions
    restartButton.on("pointerover", () => {
      restartButton.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
      this.tweens.add({
        targets: restartButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    restartButton.on("pointerout", () => {
      restartButton.setFillStyle(DESIGN_CONSTANTS.COLORS.ACCENT);
      this.tweens.add({
        targets: restartButton,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    restartButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => {
        // Ensure GameScene is fully stopped before starting
        if (this.scene.isActive("GameScene")) {
          this.scene.stop("GameScene");
        }
        
        // Reset budget cycle to 1000 Yen for new game
        const budgetManager = this.registry.get("budgetManager");
        if (budgetManager) {
          budgetManager.resetCycle();
        }
        
        // Go to BettingScene to place new bet
        this.scene.start("BettingScene");
      });
    });

    menuButton.on("pointerover", () => {
      menuButton.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 0.5);
      this.tweens.add({
        targets: menuButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    menuButton.on("pointerout", () => {
      menuButton.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.5);
      this.tweens.add({
        targets: menuButton,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    menuButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => {
        // Reset budget cycle to 1000 Yen when returning to menu
        const budgetManager = this.registry.get("budgetManager");
        if (budgetManager) {
          budgetManager.resetCycle();
        }
        
        this.scene.start("MenuScene");
      });
    });
  }

  /**
   * Fade in UI elements sequentially
   */
  fadeInElements(elements) {
    elements.forEach(({ target, delay }) => {
      this.tweens.add({
        targets: target,
        alpha: 1,
        duration: 800,
        delay: delay,
        ease: "Sine.easeInOut",
      });
    });
  }

  /**
   * Get player's rank in top 10, or null if not ranked
   * @returns {number|null} Rank (1-10) or null
   */
  getRank() {
    const topScores = this.stateManager.getTopScores();
    
    // Find this player's score entry (most recent with same username and score)
    const playerEntry = topScores.find(
      entry => entry.username === this.username && entry.score === this.finalScore
    );
    
    if (!playerEntry) {
      return null;
    }
    
    // Get rank (1-based index)
    const rank = topScores.indexOf(playerEntry) + 1;
    return rank <= 10 ? rank : null;
  }
}
