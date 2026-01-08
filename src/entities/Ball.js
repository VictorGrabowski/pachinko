import Phaser from "phaser";
import { DESIGN_CONSTANTS } from "../config/gameConfig.js";

/**
 * Ball entity with trail effect and wabi-sabi aesthetic
 */
export default class Ball extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "ball");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics properties
    this.setCircle(DESIGN_CONSTANTS.BALL_RADIUS);
    this.setBounce(DESIGN_CONSTANTS.BOUNCE_FACTOR);
    this.setCollideWorldBounds(false);
    this.setTint(DESIGN_CONSTANTS.COLORS.BALL);

    // Visual trail for movement - SPECTACULAR EDITION
    this.trail = scene.add.particles(x, y, "particle", {
      speed: { min: 50, max: 100 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      tint: [DESIGN_CONSTANTS.COLORS.GOLD, DESIGN_CONSTANTS.COLORS.BALL, DESIGN_CONSTANTS.COLORS.SAKURA],
      follow: this,
      quantity: 3,
      frequency: 30,
      blendMode: 'ADD',
      rotate: { start: 0, end: 360 },
    });

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

    this.isActive = true;
    this.pinHitCount = 0;
  }

  /**
   * Launch the ball with initial velocity
   */
  launch(velocityX = 0) {
    // Add slight randomness for organic feel (wabi-sabi)
    const randomX = velocityX + Phaser.Math.Between(-50, 50);
    this.setVelocity(randomX, 0);
  }

  /**
   * Increment pin hit counter
   */
  hitPin() {
    this.pinHitCount++;
  }

  /**
   * Get combo value based on pin hits
   */
  getCombo() {
    return Math.floor(this.pinHitCount / 3);
  }

  /**
   * Update glow position
   */
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.glowCircle && this.active) {
      this.glowCircle.setPosition(this.x, this.y);
    }
  }

  /**
   * Clean up particles before destroying
   */
  destroy() {
    if (this.trail) {
      this.trail.destroy();
    }
    if (this.glowCircle) {
      this.glowCircle.destroy();
    }
    super.destroy();
  }
}
