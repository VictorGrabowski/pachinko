import Phaser from "phaser";
import Ball from "../entities/Ball.js";
import Pin from "../entities/Pin.js";
import AudioSystem from "../systems/AudioSystem.js";
import Creature from "../entities/Creature.js";
import stateManager from "../managers/StateManager.js";
import LanguageManager from "../managers/LanguageManager.js";
import {
  DESIGN_CONSTANTS,
  BUCKET_CONFIG,
  CREATURE_CONFIG,
  BETTING_CONFIG,
  HARDCORE_LAUNCH,
} from "../config/gameConfig.js";
import BudgetManager from "../managers/BudgetManager.js";
import { applyWabiSabi, formatScore } from "../utils/helpers.js";
import FeatureManager from "../managers/FeatureManager.js";
import EventBus, { GameEvents } from "../core/EventBus.js";
import EffectsManager from "../managers/EffectsManager.js";
import PowerUpManager from "../managers/PowerUpManager.js";
import AchievementManager from "../managers/AchievementManager.js";

/**
 * Main game scene - core gameplay
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.languageManager = LanguageManager;
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

    // Apply maluses from registry (set by BettingScene)
    this.applyMalusConfiguration();

    // Hardcore launch mode state
    this.hardcoreMode = false;
    this.hardcoreState = {
      currentSize: DESIGN_CONSTANTS.BALL_RADIUS,
      currentAngle: 0,
      currentForce: 0,
    };
  }

  /**
   * Apply malus configuration from registry to FeatureManager
   * This enables the selected features based on player's malus choices
   */
  applyMalusConfiguration() {
    const activeMaluses = this.registry.get("activeMaluses") || [];

    // First, disable all malus-related features to start fresh
    FeatureManager.setEnabled("creature", false);
    FeatureManager.setEnabled("movingPins", false);
    FeatureManager.setEnabled("hardcore_launch", false);
    FeatureManager.setParameter("pins", "randomSize", false);

    // Apply each selected malus
    for (const malus of activeMaluses) {
      if (malus.featureId === "creature") {
        FeatureManager.setEnabled("creature", true);
        // Set creature count from malus params
        if (malus.featureParams && malus.featureParams.count) {
          FeatureManager.setParameter("creature", "count", malus.featureParams.count);
        }
      } else if (malus.featureId === "movingPins") {
        FeatureManager.setEnabled("movingPins", true);
      } else if (malus.featureId === "hardcore_launch") {
        FeatureManager.setEnabled("hardcore_launch", true);
      } else if (malus.featureId === "pins" && malus.featureParams && malus.featureParams.randomSize) {
        FeatureManager.setParameter("pins", "randomSize", true);
      }
    }
  }

  create() {
    // Configure physics world for better collision detection (prevents tunneling)
    this.physics.world.OVERLAP_BIAS = 16;

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
        rate: 0.8, // Slower playback for deeper bass
        detune: -400, // Lower pitch for more bass
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

    // Initialize hardcore launch mode if enabled
    this.hardcoreMode = FeatureManager.isEnabled("hardcore_launch");
    if (this.hardcoreMode) {
      this.initHardcoreLaunchMode();
    }

    this.setupInput();

    // === ADDICTIVE MECHANICS INITIALIZATION ===

    // Initialize Effects Manager
    EffectsManager.init(this);
    PowerUpManager.init();

    // Initialize Power-up Manager
    PowerUpManager.reset();

    // Initialize Achievement Manager
    AchievementManager.init();
    AchievementManager.resetSession();

    // Setup lucky zone spawning if enabled
    if (FeatureManager.isEnabled('luckyZone')) {
      this.setupLuckyZone();
    }

    // Track last combo for threshold detection
    this.lastComboThreshold = 0;

    // Bucket hit tracking for hot/cold indicator
    this.bucketHitHistory = {};

    // Near miss tracking
    this.nearMissShown = {};

    // Launch UI scene in parallel
    this.scene.launch("UIScene", { gameScene: this });

    // Camera fade in
    this.cameras.main.fadeIn(500);

    // Emit game start event
    EventBus.emit(GameEvents.GAME_START);
  }

  /**
   * Setup lucky zone that appears periodically
   */
  setupLuckyZone() {
    const spawnInterval = (FeatureManager.getParameter('luckyZone', 'spawnInterval') || 45) * 1000;
    const duration = (FeatureManager.getParameter('luckyZone', 'duration') || 8) * 1000;

    this.luckyZoneActive = false;
    this.luckyZone = null;

    // Spawn lucky zone periodically
    this.time.addEvent({
      delay: spawnInterval,
      callback: () => this.spawnLuckyZone(duration),
      loop: true
    });
  }

  /**
   * Spawn a temporary x20 lucky zone
   */
  spawnLuckyZone(duration) {
    if (this.luckyZoneActive || this.isGameOver) return;

    this.luckyZoneActive = true;

    // Choose random position (replace a normal bucket temporarily)
    const bucketIndex = Phaser.Math.Between(2, 4); // Middle buckets only
    const bucket = this.buckets[bucketIndex];

    // Create lucky zone overlay
    const luckyZone = this.add.rectangle(
      bucket.zone.x,
      bucket.zone.y,
      bucket.visual.width + 10,
      bucket.visual.height + 10,
      0xFFD700,
      0.6
    );
    luckyZone.setStrokeStyle(4, 0xFFFFFF);
    luckyZone.setDepth(100);

    // Lucky zone label
    const luckyLabel = this.add.text(bucket.zone.x, bucket.zone.y - 15, '★ x20 ★', {
      fontSize: '24px',
      fontFamily: 'serif',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(101);

    // Pulsing animation
    this.tweens.add({
      targets: [luckyZone, luckyLabel],
      scale: { from: 1, to: 1.1 },
      alpha: { from: 1, to: 0.8 },
      duration: 300,
      yoyo: true,
      repeat: -1
    });

    // Store reference
    this.luckyZone = {
      visual: luckyZone,
      label: luckyLabel,
      bucketIndex,
      originalValue: bucket.config.value
    };

    // Temporarily modify bucket value
    bucket.config.value = 20;
    bucket.valueText.setText('20');

    // Emit spawn event
    EventBus.emit(GameEvents.LUCKY_ZONE_SPAWN, { bucketIndex });

    // Remove after duration
    this.time.delayedCall(duration, () => {
      this.removeLuckyZone();
    });
  }

  /**
   * Remove the lucky zone
   */
  removeLuckyZone() {
    if (!this.luckyZone) return;

    const { visual, label, bucketIndex, originalValue } = this.luckyZone;

    // Restore original bucket value
    const bucket = this.buckets[bucketIndex];
    bucket.config.value = originalValue;
    bucket.valueText.setText(originalValue.toString());

    // Fade out animation
    this.tweens.add({
      targets: [visual, label],
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => {
        visual.destroy();
        label.destroy();
      }
    });

    this.luckyZone = null;
    this.luckyZoneActive = false;

    EventBus.emit(GameEvents.LUCKY_ZONE_DESPAWN);
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
        // Rayon 8 pour meilleure détection de collision (évite le tunneling)
        // Ajuster le rayon selon la taille si randomSize est activé
        if (pin.body) {
          const radius = useRandomSize ? 6 * size : 6;
          const offset = useRandomSize ? 0 * size : 0;
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
    const dashIntensity = FeatureManager.getParameter("creature", "dashIntensity") || 2.0;
    const creatureSize = FeatureManager.getParameter("creature", "creatureSize") || CREATURE_CONFIG.RADIUS;

    // Creature color palette - vibrant colors for each creature
    const creatureColors = [0xFFE135, 0x00FFFF, 0xFF00FF, 0x00FF00, 0xFF6B00];

    // Create config with updated parameters
    const config = {
      ...CREATURE_CONFIG,
      SPEED: speed,
      RADIUS: creatureSize,
      DASH_INTENSITY: dashIntensity,
    };

    // Create multiple creatures if count > 1
    this.creatures = [];
    for (let i = 0; i < count; i++) {
      // Spawn creature at center of pin area with some offset for multiple creatures
      const centerX = (CREATURE_CONFIG.MIN_X + CREATURE_CONFIG.MAX_X) / 2;
      const centerY = (CREATURE_CONFIG.MIN_Y + CREATURE_CONFIG.MAX_Y) / 2;
      const offsetX = (i - (count - 1) / 2) * 100; // Spread creatures horizontally

      // Assign a unique color to each creature
      const creatureConfig = {
        ...config,
        COLOR: creatureColors[i % creatureColors.length],
      };

      const creature = new Creature(this, centerX + offsetX, centerY, creatureConfig);
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

    // Create click zone indicator
    this.createClickZoneIndicator();
  }

  /**
   * Create click zone visual indicator with cursor hint
   */
  createClickZoneIndicator() {
    // Light colored zone background
    const zoneX = this.startZone.x + this.startZone.width / 2;
    const zoneY = this.startZone.y + this.startZone.height / 2;

    this.clickZoneBg = this.add.rectangle(
      zoneX,
      zoneY,
      this.startZone.width - 10,
      this.startZone.height - 10,
      DESIGN_CONSTANTS.COLORS.GOLD,
      0.08
    );
    this.clickZoneBg.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.GOLD, 0.15);

    // Container for click indicator (cursor + clic bars)
    this.clickIndicator = this.add.container(400, 85);
    this.clickIndicator.setVisible(false); // Only visible when hovering over zone
    this.clickIndicator.setAlpha(0.9);

    // Cursor icon (pointer arrow)
    const cursorGraphics = this.add.graphics();
    cursorGraphics.fillStyle(0xFFFFFF, 1);
    cursorGraphics.beginPath();
    // Arrow pointer shape
    cursorGraphics.moveTo(0, 0);
    cursorGraphics.lineTo(0, 20);
    cursorGraphics.lineTo(5, 16);
    cursorGraphics.lineTo(8, 24);
    cursorGraphics.lineTo(12, 22);
    cursorGraphics.lineTo(9, 14);
    cursorGraphics.lineTo(14, 14);
    cursorGraphics.closePath();
    cursorGraphics.fillPath();
    cursorGraphics.lineStyle(1, 0x000000, 0.8);
    cursorGraphics.strokePath();
    this.clickIndicator.add(cursorGraphics);

    // "CLIC!" text bubble
    const clicText = this.add.text(22, 8, "CLIC!", {
      fontSize: "14px",
      fontFamily: "Arial",
      color: "#FFD700",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 2,
    });
    this.clickIndicator.add(clicText);

    // Click effect bars (3 bars radiating from click point)
    this.clickBars = [];
    const barAngles = [-30, 0, 30]; // Angles in degrees
    const barLength = 12;
    const barStartDistance = 18;

    barAngles.forEach((angle, index) => {
      const rad = Phaser.Math.DegToRad(angle - 45); // Offset to point from cursor tip
      const startX = 7 + Math.cos(rad) * barStartDistance;
      const startY = 7 + Math.sin(rad) * barStartDistance;
      const endX = startX + Math.cos(rad) * barLength;
      const endY = startY + Math.sin(rad) * barLength;

      const bar = this.add.graphics();
      bar.lineStyle(3, DESIGN_CONSTANTS.COLORS.GOLD, 0.9);
      bar.beginPath();
      bar.moveTo(startX, startY);
      bar.lineTo(endX, endY);
      bar.strokePath();

      this.clickBars.push(bar);
      this.clickIndicator.add(bar);
    });

    // Animate click bars with "pop" effect
    this.tweens.add({
      targets: this.clickBars,
      alpha: { from: 0.3, to: 1 },
      scaleX: { from: 0.5, to: 1.2 },
      scaleY: { from: 0.5, to: 1.2 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    // Subtle bounce animation for entire indicator
    this.tweens.add({
      targets: this.clickIndicator,
      y: 80,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  /**
   * Initialize hardcore launch mode with oscillating cursors
   */
  initHardcoreLaunchMode() {
    const minSize = FeatureManager.getParameter("hardcore_launch", "minSize") || HARDCORE_LAUNCH.SIZE_MIN;
    const maxSize = FeatureManager.getParameter("hardcore_launch", "maxSize") || HARDCORE_LAUNCH.SIZE_MAX;
    const minAngle = FeatureManager.getParameter("hardcore_launch", "minAngle") || HARDCORE_LAUNCH.ANGLE_MIN;
    const maxAngle = FeatureManager.getParameter("hardcore_launch", "maxAngle") || HARDCORE_LAUNCH.ANGLE_MAX;
    const minForce = FeatureManager.getParameter("hardcore_launch", "minForce") || HARDCORE_LAUNCH.FORCE_MIN;
    const maxForce = FeatureManager.getParameter("hardcore_launch", "maxForce") || HARDCORE_LAUNCH.FORCE_MAX;
    const sizeSpeed = FeatureManager.getParameter("hardcore_launch", "sizeSpeed") || HARDCORE_LAUNCH.SIZE_SPEED;
    const angleSpeed = FeatureManager.getParameter("hardcore_launch", "angleSpeed") || HARDCORE_LAUNCH.ANGLE_SPEED;
    const forceSpeed = FeatureManager.getParameter("hardcore_launch", "forceSpeed") || HARDCORE_LAUNCH.FORCE_SPEED;

    // Store min/max for force calculation
    this.hardcoreParams = { minForce, maxForce };

    // Initialize current values at midpoint
    this.hardcoreState.currentSize = (minSize + maxSize) / 2;
    this.hardcoreState.currentAngle = 0;
    this.hardcoreState.currentForce = (minForce + maxForce) / 2;

    // Create oscillator for SIZE (affects ball placeholder radius)
    this.tweens.add({
      targets: this.hardcoreState,
      currentSize: { from: minSize, to: maxSize },
      duration: sizeSpeed,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
      onUpdate: () => {
        // Update ball placeholder size
        this.ballPlaceholder.setRadius(this.hardcoreState.currentSize);
        // Notify UIScene to update size indicator
        this.scene.get('UIScene').events.emit('hardcoreSizeUpdate', this.hardcoreState.currentSize);
      }
    });

    // Create oscillator for ANGLE
    this.tweens.add({
      targets: this.hardcoreState,
      currentAngle: { from: minAngle, to: maxAngle },
      duration: angleSpeed,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
      onUpdate: () => {
        // Notify UIScene to update angle arrow
        this.scene.get('UIScene').events.emit('hardcoreAngleUpdate', this.hardcoreState.currentAngle);
      }
    });

    // Create oscillator for FORCE
    this.tweens.add({
      targets: this.hardcoreState,
      currentForce: { from: minForce, to: maxForce },
      duration: forceSpeed,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
      onUpdate: () => {
        // Notify UIScene to update force gauge
        const forcePercent = ((this.hardcoreState.currentForce - minForce) / (maxForce - minForce)) * 100;
        this.scene.get('UIScene').events.emit('hardcoreForceUpdate', forcePercent);
      }
    });
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

    // Update angle arrow position in hardcore mode
    if (this.hardcoreMode) {
      this.scene.get('UIScene').events.emit('hardcorePlaceholderMove', constrainedX, constrainedY);
    }

    // Show placeholder only if cursor is near or in the start zone
    const isNearStartZone = pointer.y < this.startZone.y + this.startZone.height + 50;
    const showPlaceholder = isNearStartZone && this.lives > 0;
    this.ballPlaceholder.setVisible(showPlaceholder);

    // Sync angle arrow visibility with placeholder in hardcore mode
    if (this.hardcoreMode) {
      this.scene.get('UIScene').events.emit('hardcoreArrowVisibility', showPlaceholder);
    }

    // Show/hide click indicator (opposite of placeholder - show when NOT hovering to guide user)
    if (this.clickIndicator) {
      // Hide click indicator when placeholder is visible (user is in the zone)
      this.clickIndicator.setVisible(!showPlaceholder && this.lives > 0);
    }
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

    // Get ball modifiers from PowerUpManager (includes golden ball chance check)
    const modifiers = PowerUpManager.getNextBallModifiers();

    // Create ball with appropriate size and modifiers
    let ballSize = this.hardcoreMode ? this.hardcoreState.currentSize : DESIGN_CONSTANTS.BALL_RADIUS;

    const ball = new Ball(this, x, y, ballSize, modifiers);
    this.balls.push(ball);
    this.activeBalls++;

    // Launch with hardcore parameters or normal mode
    if (this.hardcoreMode) {
      // Calculate velocity from angle and force
      const angleRad = Phaser.Math.DegToRad(this.hardcoreState.currentAngle);
      const velocityX = Math.sin(angleRad) * this.hardcoreState.currentForce;
      const velocityY = Math.cos(angleRad) * this.hardcoreState.currentForce * 0.5; // Downward component
      console.log(`Hardcore launch: angle=${this.hardcoreState.currentAngle.toFixed(1)}°, force=${this.hardcoreState.currentForce.toFixed(1)}, vX=${velocityX.toFixed(1)}, vY=${velocityY.toFixed(1)}`);
      ball.launch(velocityX, velocityY);
    } else {
      ball.launch();
    }

    // Emit ball launched event for achievements
    EventBus.emit(GameEvents.BALL_LAUNCHED, {
      ball,
      isGolden: modifiers.isGolden,
      modifiers
    });

    // Emit ball state change to disable CASH OUT button
    this.scene.get('UIScene').events.emit('ballStateChange', true);

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



  /**
   * Handle pin collision
   */
  onPinHit(ball, pin) {
    if (!ball.active) return;

    // Only count hit if it's a different pin than the last one
    const wasNewPin = ball.hitPin(pin);

    // Visual feedback on pin (always show)
    pin.onHit();

    // Audio and combo effects only if it's a new pin
    if (wasNewPin) {
      if (this.audioSystem) {
        this.audioSystem.play("coin");
      }

      // Screen shake effect
      this.cameras.main.shake(50, 0.002);

      // Combo effects
      const combo = ball.getCombo();

      // Emit combo event for achievements
      EventBus.emit(GameEvents.SCORE_COMBO, { combo });

      // Check combo thresholds for announcements (5, 10, 20, 50)
      const thresholds = [5, 10, 20, 50];
      for (const threshold of thresholds) {
        if (combo === threshold && this.lastComboThreshold < threshold) {
          this.lastComboThreshold = threshold;
          EventBus.emit(GameEvents.COMBO_THRESHOLD, { combo });

          // Create combo particles via EffectsManager
          EffectsManager.createComboParticles(ball.x, ball.y, combo);
          break;
        }
      }

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
        const combo = ball.getCombo();
        if (combo > 0) {
          this.sakura.setFrequency(Math.max(200, 500 - combo * 50));
        }
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

    // Apply golden ball score multiplier
    const goldenMultiplier = ball.scoreMultiplier || 1;
    const basePoints = Math.floor(bucket.config.value * multiplier);
    const points = Math.floor(basePoints * goldenMultiplier);

    this.score += points;

    // Reset combo threshold tracker
    this.lastComboThreshold = 0;

    // Emit bucket hit event for achievements
    EventBus.emit(GameEvents.BALL_HIT_BUCKET, {
      value: bucket.config.value,
      points,
      combo,
      isGolden: ball.isGolden
    });

    // Track bucket hit for hot/cold indicator
    const bucketIndex = this.buckets.indexOf(bucket);
    this.bucketHitHistory[bucketIndex] = Date.now();
    if (FeatureManager.isEnabled('hotColdIndicator')) {
      EventBus.emit(GameEvents.BUCKET_HOT, { bucketIndex });
    }

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

    // Explosion de particules dans le bucket (enhanced via EffectsManager for big wins)
    if (bucket.config.value >= 5) {
      EffectsManager.createBucketExplosion(ball.x, ball.y, bucket.config.color, bucket.config.value);
    }

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

    // Screen shake - stronger for high value buckets
    if (bucket.config.value >= 10) {
      EventBus.emit(GameEvents.SCREEN_SHAKE, { intensity: 'BIG' });
    } else if (bucket.config.value >= 5) {
      EventBus.emit(GameEvents.SCREEN_SHAKE, { intensity: 'MEDIUM' });
    } else {
      this.cameras.main.shake(200, 0.005);
    }

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

    // Show floating score text with bet multiplier applied
    const betMultiplier = this.budgetManager ? this.budgetManager.getMultiplier() : 1;
    const displayPoints = points * betMultiplier;

    // Use flying score animation for big wins
    if (bucket.config.value >= 5) {
      EffectsManager.showFlyingScore(ball.x, ball.y, 100, 40, displayPoints, bucket.config.color);
    }
    this.showFloatingText(ball.x, ball.y, `+${displayPoints}`);

    // Show combo text if significant
    if (combo >= DESIGN_CONSTANTS.COMBO_THRESHOLD) {
      this.showComboText(combo, ball.x);
    }

    // Clean up ball
    this.time.delayedCall(200, () => {
      ball.destroy();
      this.balls = this.balls.filter((b) => b !== ball);
      this.activeBalls--;

      // Re-enable CASH OUT button if no more active balls
      if (this.activeBalls === 0) {
        this.scene.get('UIScene').events.emit('ballStateChange', false);
      }
    });

    // Reset sakura frequency
    if (this.sakura) {
      this.sakura.setFrequency(500);
    }

    // Emit event for UI update
    this.events.emit("scoreUpdate", this.score);
    EventBus.emit(GameEvents.SCORE_UPDATE, { score: this.score, total: this.score });
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
      .text(ball.x, ball.y - 30, this.languageManager.getText("creature.eaten"), {
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

      // Re-enable CASH OUT button if no more active balls
      if (this.activeBalls === 0) {
        this.scene.get('UIScene').events.emit('ballStateChange', false);
      }

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
      .text(x, 400, `${combo} ${this.languageManager.getText('game.combo')}!`, {
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

    // Update creature movement for all creatures
    if (this.creatures && this.creatures.length > 0) {
      this.creatures.forEach((creature) => {
        creature.update(time, delta);
      });
    }

    // Update moving pins physics bodies
    if (FeatureManager.isEnabled('movingPins')) {
      this.pins.children.entries.forEach((pin) => {
        if (pin.rowIndex % 2 === 0 && pin.body) {
          pin.body.reset(pin.x, pin.y);
        }
      });
    }

    // === NEAR MISS DETECTION ===
    if (FeatureManager.isEnabled('nearMissEffect')) {
      this.balls.forEach((ball) => {
        if (!ball.active) return;

        // Check if ball is near bucket zone (Y position close to buckets)
        if (ball.y > 900 && ball.y < 950) {
          const { isNear, bucket } = EffectsManager.checkNearMiss(ball.x, ball.y, this.buckets);

          if (isNear && bucket && bucket.config.value >= 5) {
            // Only show once per ball per bucket
            const ballBucketKey = `${ball.uid || ball.x}-${bucket.config.value}`;
            if (!this.nearMissShown[ballBucketKey]) {
              this.nearMissShown[ballBucketKey] = true;
              EventBus.emit(GameEvents.NEAR_MISS, {
                x: ball.x,
                y: ball.y,
                bucketValue: bucket.config.value
              });
            }
          }
        }
      });
    }

    // Check for stuck balls (oscillating between 2 pins)
    this.balls.forEach((ball) => {
      if (ball.active && ball.isStuckBetweenPins()) {
        if (ball.nudgeCount < 3) {
          console.log('Ball stuck - nudging');
          ball.nudge();
        } else {
          console.log('Ball stuck between pins - removing');
          ball.destroy();
          this.activeBalls--;
          this.lives--;

          // Emit ball lost event
          EventBus.emit(GameEvents.BALL_LOST);

          // Re-enable CASH OUT button if no more active balls
          if (this.activeBalls === 0) {
            this.scene.get('UIScene').events.emit('ballStateChange', false);
          }

          this.events.emit('livesUpdate', this.lives);

          if (this.lives <= 0) {
            this.gameOver();
          }
        }
      }
    });

    // Remove destroyed balls from array
    this.balls = this.balls.filter((ball) => ball.active);

    // Check for balls that fell off screen (using filter to avoid mutation during iteration)
    const previousBallCount = this.balls.length;
    this.balls = this.balls.filter((ball) => {
      if (ball.y > 1050 && ball.active) {
        ball.destroy();
        this.activeBalls--;
        this.lives--;

        // Emit ball lost event
        EventBus.emit(GameEvents.BALL_LOST);

        // Re-enable CASH OUT button if no more active balls
        if (this.activeBalls === 0) {
          this.scene.get('UIScene').events.emit('ballStateChange', false);
        }

        this.events.emit("livesUpdate", this.lives);

        if (this.lives <= 0) {
          this.gameOver();
        }
        return false; // Remove from array
      }
      return true; // Keep in array
    });
  }

  /**
   * Handle cash out (fin volontaire de partie)
   */
  cashOut() {
    if (this.isGameOver) return;
    this.endGame(true); // true = cash out
  }

  /**
   * Handle game over (5 vies épuisées)
   */
  gameOver() {
    if (this.isGameOver) return;
    this.endGame(false); // false = game over naturel
  }

  /**
   * End game and calculate winnings
   * @param {boolean} isCashOut - True if player cashed out, false if game over
   */
  endGame(isCashOut) {
    // Prevent multiple calls
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.physics.pause();

    // Clean up creatures BEFORE stopping tweens to avoid destroy errors
    if (this.creatures) {
      this.creatures.forEach((creature) => {
        if (creature && creature.active) {
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

    // Calculate winnings - ONLY add to balance if player cashed out
    // If game over without cash out, player loses the bet and gets nothing
    let winningsResult;
    if (isCashOut) {
      // Player cashed out - add score to balance
      winningsResult = this.budgetManager.addWinnings(this.score);
    } else {
      // Game over - player loses bet, no winnings added
      winningsResult = {
        winnings: 0,
        newBalance: this.budgetManager.getBalance(),
        balanceMax: this.budgetManager.getBalanceMax(),
        isNewRecord: false
      };
    }
    const canContinue = this.budgetManager.canContinue();

    // Mono no aware - bittersweet ending
    this.cameras.main.fadeOut(1000);

    this.time.delayedCall(1000, () => {
      this.scene.stop("UIScene");
      this.scene.stop("GameScene");

      if (!canContinue) {
        // Balance < 100 : Fin du cycle, GameOverScene
        const username = this.registry.get("currentUsername") || "Player";
        stateManager.saveScoreEntry({
          username: username,
          score: winningsResult.balanceMax,
          date: new Date().toISOString()
        });

        this.scene.start("GameOverScene", {
          score: this.score,
          winnings: winningsResult.winnings,
          balance: winningsResult.newBalance,
          balanceMax: winningsResult.balanceMax,
          username: username,
          cycleEnded: true,
          isCashOut: isCashOut
        });
      } else {
        // Balance >= 100 : Retour à BettingScene
        this.scene.start("BettingScene");
      }
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
