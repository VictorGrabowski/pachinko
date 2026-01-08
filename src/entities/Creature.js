import Phaser from "phaser";
import { DESIGN_CONSTANTS } from "../config/gameConfig.js";

/**
 * Creature entity - A yokai that wanders between pins and eats balls
 */
export default class Creature extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y);

    this.scene = scene;
    this.config = config;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Draw yokai appearance
    this.drawYokai();

    // Physics setup
    this.setCircle(this.config.RADIUS);
    this.body.setCollideWorldBounds(false); // We'll handle bounds manually
    this.body.setGravity(0, -600); // Negate world gravity

    // Movement properties
    this.velocity = new Phaser.Math.Vector2();
    this.changeDirectionTimer = 0;
    this.directionChangeInterval = Phaser.Math.Between(800, 1500);

    // Set initial random direction
    this.setRandomDirection();

    // Add subtle floating animation
    scene.tweens.add({
      targets: this,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Add rotation for organic feel
    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 8000,
      repeat: -1,
      ease: "Linear",
    });
  }

  /**
   * Draw the yokai creature
   */
  drawYokai() {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    // Main body - dark purple circle
    graphics.fillStyle(this.config.COLOR, 1);
    graphics.fillCircle(0, 0, this.config.RADIUS);

    // Darker outer ring for depth
    graphics.lineStyle(2, 0x1a0033, 0.8);
    graphics.strokeCircle(0, 0, this.config.RADIUS);

    // Eyes - two white circles with purple pupils
    const eyeOffset = this.config.RADIUS * 0.4;
    const eyeSize = this.config.RADIUS * 0.2;
    const pupilSize = eyeSize * 0.5;

    // Left eye
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(-eyeOffset, -2, eyeSize);
    graphics.fillStyle(this.config.COLOR, 1);
    graphics.fillCircle(-eyeOffset, -1, pupilSize);

    // Right eye
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(eyeOffset, -2, eyeSize);
    graphics.fillStyle(this.config.COLOR, 1);
    graphics.fillCircle(eyeOffset, -1, pupilSize);

    // Mouth - small arc
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.beginPath();
    graphics.arc(0, 5, this.config.RADIUS * 0.3, 0, Math.PI, false);
    graphics.strokePath();

    // Generate texture from graphics
    graphics.generateTexture("yokai", this.config.RADIUS * 2, this.config.RADIUS * 2);
    graphics.destroy();

    // Set the texture
    this.setTexture("yokai");
  }

  /**
   * Set a random movement direction
   */
  setRandomDirection() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.velocity.x = Math.cos(angle) * this.config.SPEED;
    this.velocity.y = Math.sin(angle) * this.config.SPEED;
  }

  /**
   * Update creature movement
   */
  update(time, delta) {
    // Update direction change timer
    this.changeDirectionTimer += delta;

    // Change direction periodically
    if (this.changeDirectionTimer >= this.directionChangeInterval) {
      this.setRandomDirection();
      this.changeDirectionTimer = 0;
      this.directionChangeInterval = Phaser.Math.Between(800, 1500);
    }

    // Check boundaries and bounce
    if (this.x <= this.config.MIN_X) {
      this.x = this.config.MIN_X;
      this.velocity.x = Math.abs(this.velocity.x); // Bounce right
    } else if (this.x >= this.config.MAX_X) {
      this.x = this.config.MAX_X;
      this.velocity.x = -Math.abs(this.velocity.x); // Bounce left
    }

    if (this.y <= this.config.MIN_Y) {
      this.y = this.config.MIN_Y;
      this.velocity.y = Math.abs(this.velocity.y); // Bounce down
    } else if (this.y >= this.config.MAX_Y) {
      this.y = this.config.MAX_Y;
      this.velocity.y = -Math.abs(this.velocity.y); // Bounce up
    }

    // Apply velocity
    this.setVelocity(this.velocity.x, this.velocity.y);
  }

  /**
   * Cleanup on destroy
   */
  destroy() {
    this.scene.tweens.killTweensOf(this);
    super.destroy();
  }
}
