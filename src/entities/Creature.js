import Phaser from "phaser";

/**
 * Creature entity - Pac-Man style yokai with dash ability
 * Features:
 * - Pixel art style rendering
 * - Single eye
 * - Mouth opens/closes and faces movement direction
 * - Dash ability with cooldown and visual effects
 */
export default class Creature extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y);

    this.scene = scene;
    this.config = config;
    
    // Generate unique texture key for this creature instance
    this.textureKey = `creature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Movement properties
    this.velocity = new Phaser.Math.Vector2();
    this.changeDirectionTimer = 0;
    this.directionChangeInterval = Phaser.Math.Between(800, 1500);
    this.facingAngle = 0; // Angle the creature is facing (radians)

    // Dash properties
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDuration = 200; // ms
    this.dashCooldown = 0;
    this.dashCooldownMin = 5000; // 5 seconds minimum
    this.dashCooldownMax = 8000; // 8 seconds maximum
    this.nextDashTime = Phaser.Math.Between(this.dashCooldownMin, this.dashCooldownMax);
    this.dashIntensity = config.DASH_INTENSITY || 2.0;

    // Mouth animation properties
    this.mouthAngle = 0; // Current mouth opening angle (0 to maxMouthAngle)
    this.maxMouthAngle = Math.PI / 4; // 45 degrees max opening
    this.mouthAnimTimer = 0;
    this.mouthAnimSpeed = 150; // ms per cycle
    this.mouthOpening = true; // Direction of mouth animation

    // Dash trail graphics
    this.dashTrails = [];

    // Create initial texture
    this.createPixelTexture();

    // Physics setup
    this.setCircle(this.config.RADIUS);
    this.body.setCollideWorldBounds(false);
    this.body.setGravity(0, -600); // Negate world gravity

    // Set initial random direction
    this.setRandomDirection();
  }

  /**
   * Create pixel art texture for the creature
   */
  createPixelTexture() {
    const size = this.config.RADIUS * 2;
    const pixelSize = Math.max(2, Math.floor(size / 12)); // Pixel size for retro look
    
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    
    // Clear and draw
    this.drawPixelPacman(graphics, size, pixelSize);
    
    // Generate texture
    if (this.scene.textures.exists(this.textureKey)) {
      this.scene.textures.remove(this.textureKey);
    }
    graphics.generateTexture(this.textureKey, size, size);
    graphics.destroy();
    
    this.setTexture(this.textureKey);
    this.setOrigin(0.5, 0.5);
  }

  /**
   * Draw Pac-Man style creature in pixel art
   */
  drawPixelPacman(graphics, size, pixelSize) {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = this.config.RADIUS - 2;
    
    // Calculate mouth direction based on velocity
    const mouthDirection = this.facingAngle;
    
    // Draw body pixels
    graphics.fillStyle(this.config.COLOR, 1);
    
    // Create circle with mouth cut out (Pac-Man style)
    for (let py = 0; py < size; py += pixelSize) {
      for (let px = 0; px < size; px += pixelSize) {
        const dx = px + pixelSize / 2 - centerX;
        const dy = py + pixelSize / 2 - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if pixel is within circle
        if (distance <= radius) {
          // Calculate angle of this pixel relative to center
          const pixelAngle = Math.atan2(dy, dx);
          
          // Normalize angle difference
          let angleDiff = pixelAngle - mouthDirection;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          
          // Don't draw pixels in the mouth area
          const currentMouthAngle = this.mouthAngle;
          if (Math.abs(angleDiff) > currentMouthAngle || distance < radius * 0.3) {
            graphics.fillRect(px, py, pixelSize - 1, pixelSize - 1);
          }
        }
      }
    }
    
    // Draw single eye
    const eyeDistance = radius * 0.4;
    // Eye is positioned perpendicular to mouth direction (above the mouth)
    const eyeAngle = mouthDirection - Math.PI / 2;
    const eyeX = centerX + Math.cos(eyeAngle) * eyeDistance * 0.5 + Math.cos(mouthDirection) * eyeDistance * 0.3;
    const eyeY = centerY + Math.sin(eyeAngle) * eyeDistance * 0.5 + Math.sin(mouthDirection) * eyeDistance * 0.3;
    
    // Eye white
    graphics.fillStyle(0xffffff, 1);
    const eyeSize = pixelSize * 2;
    graphics.fillRect(
      Math.floor(eyeX / pixelSize) * pixelSize,
      Math.floor(eyeY / pixelSize) * pixelSize,
      eyeSize,
      eyeSize
    );
    
    // Eye pupil (looking in movement direction)
    graphics.fillStyle(0x000000, 1);
    const pupilOffsetX = Math.cos(mouthDirection) * pixelSize * 0.3;
    const pupilOffsetY = Math.sin(mouthDirection) * pixelSize * 0.3;
    graphics.fillRect(
      Math.floor((eyeX + pupilOffsetX) / pixelSize) * pixelSize,
      Math.floor((eyeY + pupilOffsetY) / pixelSize) * pixelSize,
      pixelSize,
      pixelSize
    );
    
    // Add pixel outline for definition
    graphics.lineStyle(1, this.darkenColor(this.config.COLOR, 0.3), 0.8);
    for (let py = 0; py < size; py += pixelSize) {
      for (let px = 0; px < size; px += pixelSize) {
        const dx = px + pixelSize / 2 - centerX;
        const dy = py + pixelSize / 2 - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Draw outline pixels at edge
        if (distance > radius - pixelSize && distance <= radius) {
          const pixelAngle = Math.atan2(dy, dx);
          let angleDiff = pixelAngle - mouthDirection;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          
          if (Math.abs(angleDiff) > this.mouthAngle) {
            graphics.strokeRect(px, py, pixelSize - 1, pixelSize - 1);
          }
        }
      }
    }
  }

  /**
   * Darken a color by a factor
   */
  darkenColor(color, factor) {
    const r = Math.floor(((color >> 16) & 0xff) * (1 - factor));
    const g = Math.floor(((color >> 8) & 0xff) * (1 - factor));
    const b = Math.floor((color & 0xff) * (1 - factor));
    return (r << 16) | (g << 8) | b;
  }

  /**
   * Set a random movement direction
   */
  setRandomDirection() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.velocity.x = Math.cos(angle) * this.config.SPEED;
    this.velocity.y = Math.sin(angle) * this.config.SPEED;
    this.facingAngle = angle;
  }

  /**
   * Perform a dash move
   */
  performDash() {
    if (this.isDashing) return;
    
    this.isDashing = true;
    this.dashTimer = 0;
    
    // Multiply velocity by dash intensity
    this.velocity.x *= this.dashIntensity;
    this.velocity.y *= this.dashIntensity;
    
    // Create initial dash trail effect
    this.createDashTrail();
  }

  /**
   * Create dash trail visual effect (white streaks)
   */
  createDashTrail() {
    if (!this.scene || !this.scene.add) return;
    
    const trailCount = 3;
    const trailLength = 15;
    
    for (let i = 0; i < trailCount; i++) {
      const graphics = this.scene.add.graphics();
      
      // Calculate trail position behind the creature
      const offsetAngle = this.facingAngle + Math.PI + (i - 1) * 0.3;
      const startX = this.x + Math.cos(offsetAngle) * this.config.RADIUS;
      const startY = this.y + Math.sin(offsetAngle) * this.config.RADIUS;
      const endX = startX + Math.cos(offsetAngle) * trailLength;
      const endY = startY + Math.sin(offsetAngle) * trailLength;
      
      // Draw white streak
      graphics.lineStyle(3, 0xffffff, 0.8);
      graphics.beginPath();
      graphics.moveTo(startX, startY);
      graphics.lineTo(endX, endY);
      graphics.strokePath();
      
      // Fade out and destroy
      this.scene.tweens.add({
        targets: graphics,
        alpha: 0,
        duration: 150,
        ease: 'Power2',
        onComplete: () => {
          graphics.destroy();
        }
      });
      
      this.dashTrails.push(graphics);
    }
  }

  /**
   * Update creature movement and animations
   */
  update(time, delta) {
    // Update mouth animation
    this.updateMouthAnimation(delta);
    
    // Update dash state
    this.updateDash(delta);
    
    // Update direction change timer
    this.changeDirectionTimer += delta;

    // Change direction periodically
    if (this.changeDirectionTimer >= this.directionChangeInterval) {
      this.setRandomDirection();
      this.changeDirectionTimer = 0;
      this.directionChangeInterval = Phaser.Math.Between(800, 1500);
    }

    // Update dash cooldown and trigger dash
    this.dashCooldown += delta;
    if (this.dashCooldown >= this.nextDashTime && !this.isDashing) {
      this.performDash();
      this.dashCooldown = 0;
      this.nextDashTime = Phaser.Math.Between(this.dashCooldownMin, this.dashCooldownMax);
    }

    // Check boundaries and bounce
    if (this.x <= this.config.MIN_X) {
      this.x = this.config.MIN_X;
      this.velocity.x = Math.abs(this.velocity.x);
      this.facingAngle = Math.atan2(this.velocity.y, this.velocity.x);
    } else if (this.x >= this.config.MAX_X) {
      this.x = this.config.MAX_X;
      this.velocity.x = -Math.abs(this.velocity.x);
      this.facingAngle = Math.atan2(this.velocity.y, this.velocity.x);
    }

    if (this.y <= this.config.MIN_Y) {
      this.y = this.config.MIN_Y;
      this.velocity.y = Math.abs(this.velocity.y);
      this.facingAngle = Math.atan2(this.velocity.y, this.velocity.x);
    } else if (this.y >= this.config.MAX_Y) {
      this.y = this.config.MAX_Y;
      this.velocity.y = -Math.abs(this.velocity.y);
      this.facingAngle = Math.atan2(this.velocity.y, this.velocity.x);
    }

    // Apply velocity
    this.setVelocity(this.velocity.x, this.velocity.y);
    
    // Redraw texture with updated mouth and facing direction
    this.createPixelTexture();
    
    // Create continuous trail during dash
    if (this.isDashing && this.dashTimer % 50 < delta) {
      this.createDashTrail();
    }
  }

  /**
   * Update mouth open/close animation
   */
  updateMouthAnimation(delta) {
    this.mouthAnimTimer += delta;
    
    // Faster animation during dash
    const speed = this.isDashing ? this.mouthAnimSpeed * 0.5 : this.mouthAnimSpeed;
    
    if (this.mouthAnimTimer >= speed) {
      this.mouthAnimTimer = 0;
      
      if (this.mouthOpening) {
        this.mouthAngle += this.maxMouthAngle / 3;
        if (this.mouthAngle >= this.maxMouthAngle) {
          this.mouthAngle = this.maxMouthAngle;
          this.mouthOpening = false;
        }
      } else {
        this.mouthAngle -= this.maxMouthAngle / 3;
        if (this.mouthAngle <= 0.05) {
          this.mouthAngle = 0.05; // Keep mouth slightly open
          this.mouthOpening = true;
        }
      }
    }
  }

  /**
   * Update dash state
   */
  updateDash(delta) {
    if (!this.isDashing) return;
    
    this.dashTimer += delta;
    
    if (this.dashTimer >= this.dashDuration) {
      this.isDashing = false;
      // Restore normal velocity
      const currentSpeed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
      const normalizedX = this.velocity.x / currentSpeed;
      const normalizedY = this.velocity.y / currentSpeed;
      this.velocity.x = normalizedX * this.config.SPEED;
      this.velocity.y = normalizedY * this.config.SPEED;
    }
  }

  /**
   * Cleanup on destroy
   */
  destroy() {
    // Clean up dash trails
    this.dashTrails.forEach(trail => {
      if (trail && trail.destroy) {
        trail.destroy();
      }
    });
    this.dashTrails = [];
    
    // Remove texture
    if (this.scene && this.scene.textures && this.scene.textures.exists(this.textureKey)) {
      this.scene.textures.remove(this.textureKey);
    }
    
    // Kill tweens
    if (this.scene && this.scene.tweens) {
      this.scene.tweens.killTweensOf(this);
    }
    
    super.destroy();
  }
}
