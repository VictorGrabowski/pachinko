import Phaser from "phaser";

/**
 * Boot scene - initializes game and prepares for asset loading
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create() {
    // Create simple graphics as placeholders
    this.createPlaceholderAssets();
    
    // Move to preload scene
    this.scene.start("PreloadScene");
  }

  /**
   * Create placeholder graphics for game entities
   */
  createPlaceholderAssets() {
    // Ball
    const ballGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    ballGraphics.fillStyle(0xf4a460);
    ballGraphics.fillCircle(12, 12, 12);
    ballGraphics.generateTexture("ball", 24, 24);
    ballGraphics.destroy();

    // Pin
    const pinGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    pinGraphics.fillStyle(0xf4a460);
    pinGraphics.fillCircle(8, 8, 6);
    pinGraphics.generateTexture("pin", 16, 16);
    pinGraphics.destroy();

    // Particle
    const particleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    particleGraphics.fillStyle(0xffd700);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture("particle", 8, 8);
    particleGraphics.destroy();

    // Petal
    const petalGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    petalGraphics.fillStyle(0xffb7c5, 0.7);
    petalGraphics.fillEllipse(8, 8, 12, 8);
    petalGraphics.generateTexture("petal", 16, 16);
    petalGraphics.destroy();
  }
}
