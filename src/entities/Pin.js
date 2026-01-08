import Phaser from "phaser";
import { DESIGN_CONSTANTS } from "../config/gameConfig.js";

/**
 * Pin entity with visual feedback
 */
export default class Pin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "pin");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCircle(6);
    this.setImmovable(true);
    this.body.setAllowGravity(false);
    this.setTint(DESIGN_CONSTANTS.COLORS.PRIMARY);

    this.hitCount = 0;
  }

  /**
   * Animate pin when hit
   */
  onHit() {
    this.hitCount++;

    // Visual feedback - brief glow and scale
    this.scene.tweens.add({
      targets: this,
      scale: 1.3,
      alpha: 0.6,
      duration: 100,
      yoyo: true,
      ease: "Sine.easeInOut",
    });

    // Kintsugi effect for multiple hits
    if (this.hitCount > 2) {
      const fx = this.scene.add.circle(
        this.x,
        this.y,
        20,
        DESIGN_CONSTANTS.COLORS.GOLD,
        0.4
      );
      this.scene.tweens.add({
        targets: fx,
        scale: 2,
        alpha: 0,
        duration: 400,
        onComplete: () => fx.destroy(),
      });
    }
  }
}
