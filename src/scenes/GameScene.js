import Phaser from "phaser";
import Ball from "../entities/Ball.js";
import Pin from "../entities/Pin.js";
import AudioSystem from "../systems/AudioSystem.js";
import Creature from "../entities/Creature.js";
import {
  DESIGN_CONSTANTS,
  BUCKET_CONFIG,
  TRANSLATIONS,
  CREATURE_CONFIG,
  BETTING_CONFIG,
} from "../config/gameConfig.js";
import BudgetManager from "../managers/BudgetManager.js";
import { applyWabiSabi, formatScore } from "../utils/helpers.js";
import FeatureManager from "../managers/FeatureManager.js";

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
    this.budgetManager = null;
    this.pendingTopUp = false;
    this.isGameOver = false;

    // Initialize FeatureManager
    FeatureManager.init();
  }

  create() {
    this.budgetManager = this.registry.get("budgetManager");
    if (!this.budgetManager) {
      this.budgetManager = new BudgetManager({
        initialYen: BETTING_CONFIG.initialYen,
        exchangeRate: BETTING_CONFIG.exchangeRate,
      });
      this.registry.set("budgetManager", this.budgetManager);
    }

    // Initialize audio system (if enabled)
    if (FeatureManager.isEnabled("sounds")) {
      this.audioSystem = new AudioSystem(this);
      this.audioSystem.register("coin", {
        volume: FeatureManager.getParameter("sounds", "volume") || 0.2,
      });
      this.audioSystem.register("bgMusic", {
        volume: (FeatureManager.getParameter("sounds", "volume") || 0.3) * 0.5,
        loop: true,
      });
      this.musicStarted = false;
    } else {
      this.audioSystem = null;
    }

    this.setupBackground();
    this.createPinGrid();

    // Initialiser le mode pins mouvants si activé
    if (FeatureManager.isEnabled('movingPins')) {
      this.initMovingPins();
    }

    this.updateStartZoneFromPinGrid();
    this.createBuckets();

    // Create creature only if enabled
    if (FeatureManager.isEnabled("creature")) {
      this.createCreature();
    } else {
      this.creature = null;
    }

    // Create ball placeholder
    this.createBallPlaceholder();

    this.setupInput();

    // Launch UI scene in parallel
    this.scene.launch("UIScene", { gameScene: this });

    this.emitBudget();

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

    // Define starting zone boundaries (where balls spawn)
    this.startZone = {
      x: frameThickness,
      y: frameThickness,
      width: 800 - (frameThickness * 2),
      height: 150 // Starting zone height
    };

    // Sakura petals particle system (if enabled)
    if (FeatureManager.isEnabled("particles")) {
      const density =
        FeatureManager.getParameter("particles", "density") || 1.0;
      this.sakura = this.add.particles(0, 0, "petal", {
        x: { min: 0, max: 800 },
        y: -50,
        lifespan: 8000,
        speedY: { min: 50, max: 100 },
        speedX: { min: -20, max: 20 },
        scale: { start: 0.4 * density, end: 0.2 * density },
        alpha: { start: 0.6, end: 0.2 },
        rotate: { start: 0, end: 360 },
        frequency: 500 / density,
      });
    } else {
      this.sakura = null;
    }
  }

  /**
   * Create staggered pin grid with wabi-sabi imperfection
   */
  createPinGrid() {
    // Utiliser un groupe de physique statique pour empêcher le mouvement des pins
    this.pins = this.physics.add.staticGroup();

    // Get pin configuration from FeatureManager
    const rows = FeatureManager.getParameter("pins", "rows") || 12;
    const cols = FeatureManager.getParameter("pins", "cols") || 8;
    const useWabiSabi =
      FeatureManager.getParameter("pins", "wabiSabi") !== false;
    const useRandomSize =
      FeatureManager.getParameter("pins", "randomSize") === true;
    const spacing = DESIGN_CONSTANTS.PIN_SPACING;
    const startY = 200;

    // Calculate horizontal centering based on number of columns
    const gridWidth = (cols - 1) * spacing;
    const startX = (800 - gridWidth) / 2;

    // Store pin grid boundaries for start zone calculation
    this.pinGridBounds = {
      startX: startX,
      endX: startX + gridWidth,
      width: gridWidth
    };

    for (let row = 0; row < rows; row++) {
      const offsetX = (row % 2) * (spacing / 2);
      const pinsInRow = cols - (row % 2);

      for (let col = 0; col < pinsInRow; col++) {
        const x = useWabiSabi ? applyWabiSabi(startX + col * spacing + offsetX) : (startX + col * spacing + offsetX);
        const y = useWabiSabi ? applyWabiSabi(startY + row * spacing) : (startY + row * spacing);

        // Apply random size if enabled (variation between 0.3 and 2.0)
        const size = useRandomSize ? 0.3 + Math.random() * 1.7 : 1.0;

        const pin = new Pin(this, x, y);
        this.pins.add(pin);

        // Apply scale if random size is enabled
        if (useRandomSize) {
          pin.setScale(size);
        }

        // Configurer le corps de physique circulaire avec offset pour centrer
        // Texture pin est 16x16 avec cercle au centre (8,8)
        // Rayon 6 = diamètre 12, donc offset = (16-12)/2 = 2
        // Ajuster le rayon selon la taille si randomSize est activé
        if (pin.body) {
          const radius = useRandomSize ? 6 * size : 6;
          const offset = useRandomSize ? 2 * size : 2;
          pin.body.setCircle(radius, offset, offset);
        }

        // Stocker la ligne et la position initiale pour le mode moving pins
        pin.rowIndex = row;
        pin.initialX = x;
      }
    }
  }

  /**
   * Initialize moving pins mode
   */
  initMovingPins() {
    const speed = FeatureManager.getParameter('movingPins', 'speed') || 50;
    const distance = FeatureManager.getParameter('movingPins', 'distance') || 30;
    const alternateDirection = FeatureManager.getParameter('movingPins', 'alternateDirection') !== false;

    this.movingPinsData = {
      speed,
      distance,
      alternateDirection
    };

    // Créer des tweens pour les pins des lignes paires (0, 2, 4, etc.)
    this.pins.children.entries.forEach((pin) => {
      if (pin.rowIndex % 2 === 0) {
        // Direction initiale : droite pour les lignes paires
        const direction = alternateDirection && (pin.rowIndex / 2) % 2 === 1 ? -1 : 1;

        this.tweens.add({
          targets: pin,
          x: pin.initialX + (distance * direction),
          duration: (distance / speed) * 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
          onUpdate: () => {
            // Mettre à jour le corps de physique
            if (pin.body) {
              pin.body.reset(pin.x, pin.y);
            }
          }
        });
      }
    });
  }

  /**
   * Create the yokai creature
   */
  createCreature() {
    // Get creature configuration from FeatureManager
    const speed =
      FeatureManager.getParameter("creature", "speed") || CREATURE_CONFIG.SPEED;
    const count = FeatureManager.getParameter("creature", "count") || 1;

    // Create config with updated speed
    const config = {
      ...CREATURE_CONFIG,
      SPEED: speed,
    };

    // Create multiple creatures if count > 1
    this.creatures = [];
    for (let i = 0; i < count; i++) {
      // Spawn creature at center of pin area with some offset for multiple creatures
      const centerX = (CREATURE_CONFIG.MIN_X + CREATURE_CONFIG.MAX_X) / 2;
      const centerY = (CREATURE_CONFIG.MIN_Y + CREATURE_CONFIG.MAX_Y) / 2;
      const offsetX = (i - (count - 1) / 2) * 100; // Spread creatures horizontally

      const creature = new Creature(this, centerX + offsetX, centerY, config);
      this.creatures.push(creature);
    }

    // Keep reference to first creature for backward compatibility
    this.creature = this.creatures[0];
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
   * Update start zone to match pin grid width
   */
  updateStartZoneFromPinGrid() {
    if (this.pinGridBounds && this.startZone) {
      // Update start zone to match pin grid horizontal boundaries
      this.startZone.x = this.pinGridBounds.startX;
      this.startZone.width = this.pinGridBounds.width;
    }
  }

  /**
   * Create ball placeholder that follows the cursor
   */
  createBallPlaceholder() {
    // Create a semi-transparent ball as placeholder
    this.ballPlaceholder = this.add.circle(
      400,
      100,
      DESIGN_CONSTANTS.BALL_RADIUS,
      DESIGN_CONSTANTS.COLORS.PRIMARY,
      0.4
    );
    this.ballPlaceholder.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.GOLD, 0.6);

    // Add a subtle glow effect
    this.ballPlaceholder.setBlendMode(Phaser.BlendModes.ADD);

    // Initially hidden until mouse enters start zone
    this.ballPlaceholder.setVisible(false);
  }

  /**
   * Setup input handling
   */
  setupInput() {
    // Track mouse movement for placeholder
    this.input.on("pointermove", (pointer) => {
      this.updateBallPlaceholder(pointer);
    });

    this.input.on("pointerdown", (pointer) => {
      if (this.lives > 0 && this.ballPlaceholder.visible) {
        // Launch ball at placeholder position (constrained)
        this.launchBall(this.ballPlaceholder.x, this.ballPlaceholder.y);
      }
    });
  }

  /**
   * Update ball placeholder position to follow cursor
   * Constrained within the starting zone
   */
  updateBallPlaceholder(pointer) {
    // Constrain X position within start zone
    const constrainedX = Phaser.Math.Clamp(
      pointer.x,
      this.startZone.x + DESIGN_CONSTANTS.BALL_RADIUS,
      this.startZone.x + this.startZone.width - DESIGN_CONSTANTS.BALL_RADIUS
    );

    // Constrain Y position within start zone
    const constrainedY = Phaser.Math.Clamp(
      pointer.y,
      this.startZone.y + DESIGN_CONSTANTS.BALL_RADIUS,
      this.startZone.y + this.startZone.height - DESIGN_CONSTANTS.BALL_RADIUS
    );

    // Update placeholder position
    this.ballPlaceholder.setPosition(constrainedX, constrainedY);

    // Show placeholder only if cursor is near or in the start zone
    const isNearStartZone = pointer.y < this.startZone.y + this.startZone.height + 50;
    this.ballPlaceholder.setVisible(isNearStartZone && this.lives > 0);
  }

  /**
   * Launch a new ball
   */
  launchBall(x, y = 100) {
    // Start background music on first user interaction (browser autoplay policy)
    if (!this.musicStarted && this.audioSystem) {
      this.audioSystem.play("bgMusic");
      this.musicStarted = true;
    }

    if (!this.budgetManager || !this.budgetManager.hasCredits()) {
      this.showFloatingText(400, 120, "No Credits", "#FF6B35");
      this.requestAdditionalCredits();
      return;
    }

    if (!this.budgetManager.deductCredit()) {
      this.requestAdditionalCredits();
      return;
    }

    this.emitBudget();

    const ball = new Ball(this, x, y);
    this.balls.push(ball);
    this.activeBalls++;
    ball.launch();

    // Add collision with pins - un seul collider pour tout le groupe
    this.physics.add.collider(ball, this.pins, this.onPinHit, null, this);

    // Add overlap with buckets
    this.buckets.forEach((bucket) => {
      this.physics.add.overlap(ball, bucket.zone, () => {
        this.onBucketHit(ball, bucket);
      });
    });

    // Add overlap with creature(s) if enabled
    if (FeatureManager.isEnabled("creature") && this.creatures) {
      this.creatures.forEach((creature) => {
        this.physics.add.overlap(ball, creature, () => {
          this.onCreatureEatBall(ball);
        });
      });
    }
  }

  requestAdditionalCredits() {
    if (this.pendingTopUp) return;
    this.pendingTopUp = true;
    this.scene.launch("BettingScene", { mode: "mid-game" });
    this.scene.pause();
  }

  clearPendingTopUp() {
    this.pendingTopUp = false;
  }

  emitBudget() {
    if (!this.budgetManager) return;
    this.events.emit("budgetUpdate", this.budgetManager.getState());
  }

  /**
   * Handle pin collision
   */
  onPinHit(ball, pin) {
    if (!ball.active) return;

    // Visual and audio feedback
    pin.onHit();
    ball.hitPin();
    if (this.audioSystem) {
      this.audioSystem.play("coin");
    }

    // Screen shake effect
    this.cameras.main.shake(50, 0.002);

    // Combo effects
    const combo = ball.getCombo();
    if (combo > 0) {
      // Rainbow trail for combos
      const rainbow = this.add.particles(ball.x, ball.y, "particle", {
        speed: { min: 50, max: 150 },
        scale: { start: 0.8, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 500,
        quantity: 5,
        tint: [0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x0000ff, 0xff00ff],
        blendMode: 'ADD',
      });
      this.time.delayedCall(500, () => rainbow.destroy());
    }

    // Increase sakura intensity with combo (if particles enabled)
    if (this.sakura) {
      if (combo > 0) {
        this.sakura.setFrequency(Math.max(200, 500 - combo * 50));
      }
    }
  }

  /**
   * Handle bucket scoring
   */
  onBucketHit(ball, bucket) {
    if (!ball.active) return;

    ball.setActive(false);

    const combo = ball.getCombo();
    const multiplier = 1 + combo * 0.2;
    const points = Math.floor(bucket.config.value * multiplier);

    this.score += points;

    // Visual feedback - SPECTACULAR EDITION
    this.tweens.add({
      targets: [bucket.label, bucket.valueText],
      scale: 2,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut',
    });

    this.tweens.add({
      targets: bucket.visual,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
    });

    // Explosion de particules dans le bucket
    const explosion = this.add.particles(ball.x, ball.y, "particle", {
      speed: { min: 200, max: 400 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      quantity: 30,
      tint: [bucket.config.color, DESIGN_CONSTANTS.COLORS.GOLD, 0xffffff],
      blendMode: 'ADD',
      angle: { min: -120, max: -60 },
    });
    this.time.delayedCall(800, () => explosion.destroy());

    // Flash blanc
    const flash = this.add.rectangle(ball.x, ball.y, 100, 100, 0xffffff, 0.8);
    flash.setBlendMode('ADD');
    this.tweens.add({
      targets: flash,
      scale: 3,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy(),
    });

    // Screen shake plus fort
    this.cameras.main.shake(200, 0.005);

    // Cercles d'onde de choc multiples
    for (let i = 0; i < 3; i++) {
      const wave = this.add.circle(ball.x, ball.y, 20, bucket.config.color, 0.5);
      wave.setBlendMode('ADD');
      this.time.delayedCall(i * 100, () => {
        this.tweens.add({
          targets: wave,
          scale: 8,
          alpha: 0,
          duration: 600,
          ease: 'Cubic.easeOut',
          onComplete: () => wave.destroy(),
        });
      });
    }

    // Show floating score text
    this.showFloatingText(ball.x, ball.y, `+${points}`);

    const creditsEarned = Math.floor(points / 25);
    if (creditsEarned > 0 && this.budgetManager) {
      this.budgetManager.addCredits(creditsEarned);
      this.emitBudget();
      this.showFloatingText(
        ball.x,
        ball.y - 40,
        `+${creditsEarned}C`,
        "#00FF00"
      );
    }

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
    if (this.sakura) {
      this.sakura.setFrequency(500);
    }

    // Emit event for UI update
    this.events.emit("scoreUpdate", this.score);
  }

  /**
   * Show floating score text
   */
  showFloatingText(x, y, text, color = "#FFD700") {
    const floatingText = this.add
      .text(x, y, text, {
        fontSize: "32px",
        color,
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
   * Handle creature eating ball
   */
  onCreatureEatBall(ball) {
    if (!ball.active) return;

    ball.setActive(false);

    // Disintegration effect - explosion particles
    const particles = this.add.particles(ball.x, ball.y, "petal", {
      speed: { min: 100, max: 200 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 15,
      tint: DESIGN_CONSTANTS.COLORS.PRIMARY,
    });

    // Ball disintegration animation
    this.tweens.add({
      targets: ball,
      scale: 0,
      alpha: 0,
      duration: 200,
      ease: "Power2",
    });

    // Stop ball trail
    if (ball.trail) {
      ball.trail.stop();
    }

    // Show "Eaten!" text
    const eatenText = this.add
      .text(ball.x, ball.y - 30, "Eaten!", {
        fontSize: "24px",
        color: "#FF3333",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: eatenText,
      y: ball.y - 80,
      alpha: 0,
      duration: 800,
      ease: "Cubic.easeOut",
      onComplete: () => eatenText.destroy(),
    });

    // Creature eat animation
    this.tweens.add({
      targets: this.creature,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 150,
      yoyo: true,
      ease: "Back.easeOut",
    });

    // Lose a life
    this.lives--;
    this.events.emit("livesUpdate", this.lives);

    // Clean up
    this.time.delayedCall(200, () => {
      ball.destroy();
      this.balls = this.balls.filter((b) => b !== ball);
      this.activeBalls--;

      // Destroy particle emitter
      this.time.delayedCall(500, () => {
        particles.destroy();
      });

      // Check game over
      if (this.lives <= 0) {
        this.gameOver();
      }
    });
  }

  /**
   * Show combo achievement text
   */
  showComboText(combo, x) {
    const comboText = this.add
      .text(x, 400, `${combo} ${TRANSLATIONS.game.combo}!`, {
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

  update(time, delta) {
    // Don't update if game is over or scene is shutting down
    if (this.isGameOver || !this.scene.isActive()) {
      return;
    }

    // Update creature movement
    if (this.creature) {
      this.creature.update(time, delta);
    }

    // Update moving pins physics bodies
    if (FeatureManager.isEnabled('movingPins')) {
      this.pins.children.entries.forEach((pin) => {
        if (pin.rowIndex % 2 === 0 && pin.body) {
          pin.body.reset(pin.x, pin.y);
        }
      });
    }

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
    // Prevent multiple game over calls
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.physics.pause();

    // Clean up creatures BEFORE stopping tweens to avoid destroy errors
    if (this.creatures) {
      this.creatures.forEach((creature) => {
        if (creature && creature.active) {
          // Kill tweens targeting this creature before destroying it
          this.tweens.killTweensOf(creature);
          creature.destroy();
        }
      });
      this.creatures = [];
      this.creature = null;
    }

    // Clean up balls
    if (this.balls) {
      this.balls.forEach((ball) => {
        if (ball && ball.active) {
          this.tweens.killTweensOf(ball);
          ball.destroy();
        }
      });
      this.balls = [];
    }

    // Stop all remaining tweens
    this.tweens.killAll();

    // Stop music if playing
    if (this.audioSystem && this.musicStarted) {
      this.audioSystem.stop("bgMusic");
    }

    // Clean up sakura particles
    if (this.sakura) {
      this.sakura.destroy();
      this.sakura = null;
    }

    // Mono no aware - bittersweet ending
    this.cameras.main.fadeOut(1000);

    this.time.delayedCall(1000, () => {
      this.scene.stop("UIScene");
      this.scene.stop("GameScene");
      this.scene.start("GameOverScene", { score: this.score });
    });
  }

  /**
   * Clean up resources when scene shuts down
   */
  shutdown() {
    // Stop all timers
    if (this.time) {
      this.time.removeAllEvents();
    }

    // Stop audio system
    if (this.audioSystem) {
      this.audioSystem.stopAll();
    }

    // Remove all event listeners
    if (this.events) {
      this.events.removeAllListeners();
    }

    // Reset game over flag
    this.isGameOver = false;
  }
}
