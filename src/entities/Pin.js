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

    // Petites particules discrètes à chaque hit (remplace l'onde de choc)
    const sparkCount = Math.min(particleCount, 4); // Maximum 4 particules pour rester discret
    const particles = this.scene.add.particles(this.x, this.y, "particle", {
      speed: { min: 60, max: 120 },
      scale: { start: 0.15, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: Math.min(particleDuration, 150),
      quantity: sparkCount,
      tint: [DESIGN_CONSTANTS.COLORS.GOLD, DESIGN_CONSTANTS.COLORS.PRIMARY],
      blendMode: 'ADD',
      angle: { min: 0, max: 360 },
      gravityY: 50,
    });
    this.scene.time.delayedCall(150, () => particles.destroy());

    // Kintsugi effect for multiple hits - particules dorées subtiles
    if (this.hitCount > 2) {
      const kintsugiParticles = this.scene.add.particles(this.x, this.y, "particle", {
        speed: { min: 80, max: 150 },
        scale: { start: 0.2, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 200,
        quantity: 3,
        tint: [DESIGN_CONSTANTS.COLORS.GOLD, 0xffffff],
        blendMode: 'ADD',
        angle: { min: 0, max: 360 },
      });
      this.scene.time.delayedCall(200, () => kintsugiParticles.destroy());
    }
  }
}
