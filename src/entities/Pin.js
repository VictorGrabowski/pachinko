import Phaser from "phaser";
import { DESIGN_CONSTANTS } from "../config/gameConfig.js";
import FeatureManager from "../managers/FeatureManager.js";

/**
 * Pin entity with visual feedback
 */
export default class Pin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "pin");

    // Note: Le groupe statique gérera la physique
    // Nous n'appelons PAS scene.physics.add.existing(this) ni setCircle ici
    // car le corps de physique n'existe pas encore
    scene.add.existing(this);

    this.setTint(DESIGN_CONSTANTS.COLORS.PRIMARY);
    this.hitCount = 0;
  }

  /**
   * Animate pin when hit - SPECTACULAR EDITION
   */
  onHit() {
    this.hitCount++;
    
    // Get effect settings from FeatureManager
    const effectsEnabled = FeatureManager.isEnabled("pinHitEffects") !== false;
    const particleDuration = FeatureManager.getParameter("pinHitEffects", "particleDuration") || 200;
    const particleCount = FeatureManager.getParameter("pinHitEffects", "particleCount") || 6;
    const shockwaveDuration = FeatureManager.getParameter("pinHitEffects", "shockwaveDuration") || 150;

    // Visual feedback - brief glow and scale
    this.scene.tweens.add({
      targets: this,
      scale: 1.5,
      alpha: 0.4,
      duration: 100,
      yoyo: true,
      ease: "Sine.easeInOut",
    });

    if (!effectsEnabled) return;

    // Explosion de particules à chaque hit
    const particles = this.scene.add.particles(this.x, this.y, "particle", {
      speed: { min: 100, max: 200 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: particleDuration,
      quantity: particleCount,
      tint: [DESIGN_CONSTANTS.COLORS.GOLD, DESIGN_CONSTANTS.COLORS.PRIMARY, DESIGN_CONSTANTS.COLORS.SAKURA],
      blendMode: 'ADD',
      angle: { min: 0, max: 360 },
    });
    this.scene.time.delayedCall(particleDuration, () => particles.destroy());

    // Onde de choc
    const shockwave = this.scene.add.circle(this.x, this.y, 10, DESIGN_CONSTANTS.COLORS.GOLD, 0.5);
    shockwave.setBlendMode('ADD');
    this.scene.tweens.add({
      targets: shockwave,
      scale: 2.5,
      alpha: 0,
      duration: shockwaveDuration,
      ease: 'Cubic.easeOut',
      onComplete: () => shockwave.destroy(),
    });

    // Kintsugi effect for multiple hits - ENHANCED
    if (this.hitCount > 2) {
      const fx = this.scene.add.circle(
        this.x,
        this.y,
        20,
        DESIGN_CONSTANTS.COLORS.GOLD,
        0.8
      );
      fx.setBlendMode('ADD');
      this.scene.tweens.add({
        targets: fx,
        scale: 4,
        alpha: 0,
        duration: 600,
        ease: 'Cubic.easeOut',
        onComplete: () => fx.destroy(),
      });
      
      // Flash blanc
      const flash = this.scene.add.circle(this.x, this.y, 30, 0xffffff, 0.8);
      flash.setBlendMode('ADD');
      this.scene.tweens.add({
        targets: flash,
        scale: 2,
        alpha: 0,
        duration: 200,
        onComplete: () => flash.destroy(),
      });
    }
  }
}
