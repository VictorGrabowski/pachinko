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
    this.setTint(DESIGN_CONSTANTS.COLORS.PRIMARY);

    // Visual trail for movement
    this.trail = scene.add.particles(x, y, "particle", {
      speed: 20,
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 300,
      tint: DESIGN_CONSTANTS.COLORS.GOLD,
      follow: this,
      quantity: 1,
      frequency: 50,
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
   * Clean up particles before destroying
   */
  destroy() {
    if (this.trail) {
      this.trail.destroy();
    }
    super.destroy();
  }
}
