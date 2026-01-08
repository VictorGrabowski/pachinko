import Phaser from "phaser";
import Ball from "../entities/Ball.js";
import Pin from "../entities/Pin.js";
import { DESIGN_CONSTANTS, BUCKET_CONFIG } from "../config/gameConfig.js";
import { applyWabiSabi, formatScore } from "../utils/helpers.js";

/**
 * Main game scene - core gameplay
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  init() {
    this.score = 0;
    this.lives = DESIGN_CONSTANTS.MAX_LIVES;
    this.balls = [];
    this.activeBalls = 0;
  }

  create() {
    this.setupBackground();
    this.createPinGrid();
    this.createBuckets();
    this.setupInput();

    // Launch UI scene in parallel
    this.scene.launch("UIScene", { gameScene: this });

    // Camera fade in
    this.cameras.main.fadeIn(500);
  }

  /**
   * Setup background with sakura effect
   */
  setupBackground() {
    // Background color
    this.add.rectangle(400, 500, 800, 1000, DESIGN_CONSTANTS.COLORS.BACKGROUND);

    // Torii gate frame effect
    const frameThickness = 20;
    this.add.rectangle(
      frameThickness / 2,
      500,
      frameThickness,
      1000,
      DESIGN_CONSTANTS.COLORS.ACCENT
    );
    this.add.rectangle(
      800 - frameThickness / 2,
      500,
      frameThickness,
      1000,
      DESIGN_CONSTANTS.COLORS.ACCENT
    );
    this.add.rectangle(
      400,
      frameThickness / 2,
      800,
      frameThickness,
      DESIGN_CONSTANTS.COLORS.ACCENT
    );

    // Sakura petals particle system
    this.sakura = this.add.particles(0, 0, "petal", {
      x: { min: 0, max: 800 },
      y: -50,
      lifespan: 8000,
      speedY: { min: 50, max: 100 },
      speedX: { min: -20, max: 20 },
      scale: { start: 0.4, end: 0.2 },
      alpha: { start: 0.6, end: 0.2 },
      rotate: { start: 0, end: 360 },
      frequency: 500,
    });
  }

  /**
   * Create staggered pin grid with wabi-sabi imperfection
   */
  createPinGrid() {
    this.pins = [];

    const rows = 12;
    const cols = 8;
    const spacing = DESIGN_CONSTANTS.PIN_SPACING;
    const startY = 200;

    for (let row = 0; row < rows; row++) {
      const offsetX = (row % 2) * (spacing / 2);
      const pinsInRow = cols - (row % 2);

      for (let col = 0; col < pinsInRow; col++) {
        const x = applyWabiSabi(100 + col * spacing + offsetX);
        const y = applyWabiSabi(startY + row * spacing);

        const pin = new Pin(this, x, y);
        this.pins.push(pin);
      }
    }
  }

  /**
   * Create score buckets at bottom
   */
  createBuckets() {
    this.buckets = [];
    const bucketWidth = 800 / BUCKET_CONFIG.length;

    BUCKET_CONFIG.forEach((config, index) => {
      const x = index * bucketWidth + bucketWidth / 2;

      // Bucket visual
      const bucket = this.add.rectangle(
        x,
        950,
        bucketWidth - 10,
        60,
        config.color,
        0.3
      );
      bucket.setStrokeStyle(2, config.color);

      // Label with kanji
      const label = this.add
        .text(x, 950, config.label, {
          fontSize: "28px",
          color: "#FFD700",
          fontFamily: "serif",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      // Value text
      const valueText = this.add
        .text(x, 975, config.value.toString(), {
          fontSize: "16px",
          color: "#FFFFFF",
          fontFamily: "serif",
        })
        .setOrigin(0.5);

      // Create physics zone
      const zone = this.add.zone(x, 950, bucketWidth - 10, 60);
      this.physics.add.existing(zone);
      zone.body.setAllowGravity(false);
      zone.body.moves = false;

      this.buckets.push({
        zone,
        config,
        visual: bucket,
        label,
        valueText,
      });
    });
  }

  /**
   * Setup input handling
   */
  setupInput() {
    this.input.on("pointerdown", (pointer) => {
      if (this.lives > 0 && this.activeBalls < 3) {
        this.launchBall(pointer.x);
      }
    });
  }

  /**
   * Launch a new ball
   */
  launchBall(x) {
    const ball = new Ball(this, x, 100);
    this.balls.push(ball);
    this.activeBalls++;
    ball.launch();

    // Add collision with pins
    this.pins.forEach((pin) => {
      this.physics.add.collider(ball, pin, () => {
        this.onPinHit(ball, pin);
      });
    });

    // Add overlap with buckets
    this.buckets.forEach((bucket) => {
      this.physics.add.overlap(ball, bucket.zone, () => {
        this.onBucketHit(ball, bucket);
      });
    });
  }

  /**
   * Handle pin collision
   */
  onPinHit(ball, pin) {
    if (!ball.active) return;

    // Visual and audio feedback
    pin.onHit();
    ball.hitPin();

    // Increase sakura intensity with combo
    const combo = ball.getCombo();
    if (combo > 0) {
      this.sakura.setFrequency(Math.max(200, 500 - combo * 50));
    }
  }

  /**
   * Handle bucket scoring
   */
  onBucketHit(ball, bucket) {
    if (!ball.active) return;

    ball.isActive = false;
    ball.setActive(false);

    const combo = ball.getCombo();
    const multiplier = 1 + combo * 0.2;
    const points = Math.floor(bucket.config.value * multiplier);

    this.score += points;

    // Visual feedback
    this.tweens.add({
      targets: [bucket.label, bucket.valueText],
      scale: 1.5,
      duration: 200,
      yoyo: true,
    });

    this.tweens.add({
      targets: bucket.visual,
      alpha: 0.6,
      duration: 200,
      yoyo: true,
    });

    // Show floating score text
    this.showFloatingText(ball.x, ball.y, `+${points}`);

    // Show combo text if significant
    if (combo >= DESIGN_CONSTANTS.COMBO_THRESHOLD) {
      this.showComboText(combo, ball.x);
    }

    // Clean up ball
    this.time.delayedCall(200, () => {
      ball.destroy();
      this.balls = this.balls.filter((b) => b !== ball);
      this.activeBalls--;
    });

    // Reset sakura frequency
    this.sakura.setFrequency(500);

    // Emit event for UI update
    this.events.emit("scoreUpdate", this.score);
  }

  /**
   * Show floating score text
   */
  showFloatingText(x, y, text) {
    const floatingText = this.add
      .text(x, y, text, {
        fontSize: "32px",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: floatingText,
      y: y - 100,
      alpha: 0,
      duration: 1000,
      ease: "Cubic.easeOut",
      onComplete: () => floatingText.destroy(),
    });
  }

  /**
   * Show combo achievement text
   */
  showComboText(combo, x) {
    const comboText = this.add
      .text(x, 400, `${combo}連鎖!`, {
        fontSize: "48px",
        color: "#FF6B35",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Ma (間) moment - brief pause effect
    this.tweens.add({
      targets: comboText,
      scale: 1.5,
      alpha: 0,
      duration: 1500,
      ease: "Back.easeOut",
      onComplete: () => comboText.destroy(),
    });
  }

  update() {
    // Check for balls that fell off screen
    this.balls.forEach((ball, index) => {
      if (ball.y > 1050 && ball.active) {
        ball.destroy();
        this.balls.splice(index, 1);
        this.activeBalls--;
        this.lives--;

        this.events.emit("livesUpdate", this.lives);

        if (this.lives <= 0) {
          this.gameOver();
        }
      }
    });
  }

  /**
   * Handle game over
   */
  gameOver() {
    this.physics.pause();

    // Mono no aware - bittersweet ending
    this.cameras.main.fadeOut(1000);

    this.time.delayedCall(1000, () => {
      this.scene.stop("UIScene");
      this.scene.start("GameOverScene", { score: this.score });
    });
  }
}
