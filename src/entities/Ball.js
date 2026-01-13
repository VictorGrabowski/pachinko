import Phaser from "phaser";
import { DESIGN_CONSTANTS } from "../config/gameConfig.js";
import FeatureManager from "../managers/FeatureManager.js";

/**
 * Ball entity with trail effect and wabi-sabi aesthetic
 */
export default class Ball extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, radius = DESIGN_CONSTANTS.BALL_RADIUS) {
    super(scene, x, y, "ball");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Store radius for dynamic sizing
    this.ballRadius = radius;

    // Scale sprite to match radius FIRST (sprite is designed for BALL_RADIUS = 12)
    const scale = this.ballRadius / DESIGN_CONSTANTS.BALL_RADIUS;
    this.setScale(scale);

    // Physics properties - use 80% of radius for hitbox (better collision detection)
    const hitboxRadius = this.ballRadius * 0.8;
    // Center the circular body on the scaled sprite (base sprite is 24x24)
    const spriteHalfSize = 12 * scale;
    const bodyOffset = spriteHalfSize - hitboxRadius;
    this.setCircle(hitboxRadius, bodyOffset, bodyOffset);

    this.setBounce(DESIGN_CONSTANTS.BOUNCE_FACTOR);
    this.setCollideWorldBounds(false);

    // Limit max velocity to prevent collision tunneling through pins
    this.body.setMaxVelocity(180, 500);
    this.setTint(DESIGN_CONSTANTS.COLORS.BALL);

    // Trail system - get settings from FeatureManager (with fallback defaults)
    this.trailLength = FeatureManager.getParameter("ballTrail", "length") || 25;
    this.trailThickness = FeatureManager.getParameter("ballTrail", "thickness") || 3;
    this.trailOpacity = FeatureManager.getParameter("ballTrail", "opacity") || 0.8;
    this.trailColor = DESIGN_CONSTANTS.COLORS.GOLD; // Use gold for better visibility
    this.positionHistory = [];

    // Check if trail is enabled (default to true if not found)
    const trailFeature = FeatureManager.isEnabled("ballTrail");
    this.trailEnabled = trailFeature !== false; // true if enabled or undefined

    // Graphics object for drawing the trail - each ball has its own
    this.trailGraphics = scene.add.graphics();
    this.trailGraphics.setDepth(5); // Above background, below UI

    // Add glow effect
    this.glowCircle = scene.add.circle(x, y, DESIGN_CONSTANTS.BALL_RADIUS * 2, DESIGN_CONSTANTS.COLORS.BALL, 0.3);
    this.glowCircle.setBlendMode('ADD');

    // Pulsing glow animation
    scene.tweens.add({
      targets: this.glowCircle,
      scale: { from: 1, to: 1.5 },
      alpha: { from: 0.3, to: 0.1 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Combo text display
    this.comboText = scene.add.text(x, y - 25, '', {
      fontSize: '20px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setVisible(false);

    this.isActive = true;
    this.pinHitCount = 0;
    this.lastHitPin = null; // Track the last pin hit to prevent double-counting

    // Stuck ball detection - track collision history
    this.collisionHistory = []; // Array of pin references
    this.collisionHistoryLimit = 100; // Check last 100 collisions
    this.maxUniquePinsForStuck = 2; // If only 2 or fewer unique pins, ball is stuck
  }

  /**
   * Launch the ball with initial velocity
   */
  launch(velocityX = 0, velocityY = 0) {
    // Add slight randomness for organic feel (wabi-sabi) if no specific velocity set
    if (velocityY === 0) {
      const randomX = velocityX + Phaser.Math.Between(-50, 50);
      this.setVelocity(randomX, 0);
    } else {
      // Use exact velocities for hardcore mode
      this.setVelocity(velocityX, velocityY);
    }
  }

  /**
   * Increment pin hit counter if a different pin is hit
   * @param {Pin} pin - The pin that was hit
   * @returns {boolean} - True if combo was incremented, false if same pin hit again
   */
  hitPin(pin) {
    // Record collision for stuck detection (even same pin)
    this.recordPinCollision(pin);

    // Only count if it's a different pin than the last one hit
    if (pin === this.lastHitPin) {
      return false; // Same pin, don't increment
    }

    this.lastHitPin = pin;
    this.pinHitCount++;

    // Update combo display for every pin hit
    const combo = this.getCombo();
    this.comboText.setText(`x${combo}`);
    this.comboText.setVisible(true);

    // Pulse effect on combo text
    this.scene.tweens.add({
      targets: this.comboText,
      scale: { from: 1.5, to: 1 },
      duration: 200,
      ease: 'Back.easeOut',
    });

    return true;
  }

  /**
   * Get combo value based on pin hits (each pin hit = +1 combo)
   */
  getCombo() {
    return this.pinHitCount;
  }

  /**
   * Record a pin collision for stuck detection
   * @param {Pin} pin - The pin that was hit
   */
  recordPinCollision(pin) {
    this.collisionHistory.push(pin);

    // Keep only the last N collisions
    if (this.collisionHistory.length > this.collisionHistoryLimit) {
      this.collisionHistory.shift();
    }
  }

  /**
   * Check if ball is stuck oscillating between 2 pins
   * @returns {boolean} - True if ball appears stuck
   */
  isStuckBetweenPins() {
    // Need full collision history to determine if stuck
    if (this.collisionHistory.length < this.collisionHistoryLimit) {
      return false;
    }

    // Count unique pins in collision history
    const uniquePins = new Set(this.collisionHistory);

    // If only hitting 2 or fewer pins in last 100 collisions, ball is stuck
    return uniquePins.size <= this.maxUniquePinsForStuck;
  }

  /**
   * Update trail and glow position
   */
  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // Update position history for trail
    if (this.active && this.trailEnabled) {
      this.positionHistory.unshift({ x: this.x, y: this.y });

      // Limit trail length
      if (this.positionHistory.length > this.trailLength) {
        this.positionHistory.pop();
      }

      // Draw the trail
      this.drawTrail();
    }

    if (this.glowCircle && this.active) {
      this.glowCircle.setPosition(this.x, this.y);
    }
    if (this.comboText && this.active) {
      this.comboText.setPosition(this.x, this.y - 25);
    }
  }

  /**
   * Draw a smooth thin trail with gradient transparency
   */
  drawTrail() {
    if (!this.trailGraphics || this.positionHistory.length < 2) return;

    this.trailGraphics.clear();

    const points = this.positionHistory;

    // Draw a single smooth path using quadratic bezier curves
    // This creates a continuous smooth line instead of segmented circles
    for (let i = 0; i < points.length - 1; i++) {
      const t = i / (points.length - 1); // 0 to 1
      const alpha = this.trailOpacity * (1 - t); // Fade out
      const thickness = Math.max(0.5, this.trailThickness * (1 - t * 0.5)); // Thin out slightly

      if (alpha <= 0.01) continue;

      this.trailGraphics.lineStyle(thickness, this.trailColor, alpha);

      const p0 = points[i];
      const p1 = points[i + 1];

      // Simple line segment for crisp thin trail
      this.trailGraphics.beginPath();
      this.trailGraphics.moveTo(p0.x, p0.y);
      this.trailGraphics.lineTo(p1.x, p1.y);
      this.trailGraphics.strokePath();
    }
  }

  /**
   * Set trail length dynamically
   * @param {number} length - Number of points in the trail
   */
  setTrailLength(length) {
    this.trailLength = length;
    // Trim history if needed
    while (this.positionHistory.length > length) {
      this.positionHistory.pop();
    }
  }

  /**
   * Set trail color dynamically
   * @param {number} color - Hex color value
   */
  setTrailColor(color) {
    this.trailColor = color;
  }

  /**
   * Set trail thickness dynamically
   * @param {number} thickness - Base thickness in pixels
   */
  setTrailThickness(thickness) {
    this.trailThickness = thickness;
  }

  /**
   * Clean up trail graphics before destroying
   */
  destroy() {
    if (this.trailGraphics) {
      this.trailGraphics.destroy();
    }
    if (this.glowCircle) {
      this.glowCircle.destroy();
    }
    if (this.comboText) {
      this.comboText.destroy();
    }
    super.destroy();
  }
}
