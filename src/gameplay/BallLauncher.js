/**
 * BallLauncher - Manages ball creation, placeholder, and launching
 * 
 * Single Responsibility: Handles all ball spawning logic including
 * the visual placeholder, launch mechanics, and hardcore mode oscillators.
 * 
 * @module gameplay/BallLauncher
 */

import Phaser from "phaser";
import Ball from "../entities/Ball.js";
import { DESIGN_CONSTANTS, HARDCORE_LAUNCH } from "../config/gameConfig.js";
import FeatureManager from "../managers/FeatureManager.js";
import EventBus, { GameEvents } from "../core/EventBus.js";

export default class BallLauncher {
    /**
     * @param {Phaser.Scene} scene - The game scene
     * @param {Object} startZone - The ball spawn zone boundaries
     */
    constructor(scene, startZone) {
        this.scene = scene;
        this.startZone = startZone;
        
        this.ballPlaceholder = null;
        this.hardcoreMode = false;
        this.hardcoreState = {
            currentSize: DESIGN_CONSTANTS.BALL_RADIUS,
            currentAngle: 0,
            currentForce: 0,
        };
        this.hardcoreParams = null;
    }

    /**
     * Create ball placeholder that follows the cursor
     */
    createPlaceholder() {
        this.ballPlaceholder = this.scene.add.circle(
            400,
            100,
            DESIGN_CONSTANTS.BALL_RADIUS,
            DESIGN_CONSTANTS.COLORS.PRIMARY,
            0.4
        );
        this.ballPlaceholder.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.GOLD, 0.6);
        this.ballPlaceholder.setBlendMode(Phaser.BlendModes.ADD);
        this.ballPlaceholder.setVisible(false);

        return this.ballPlaceholder;
    }

    /**
     * Initialize hardcore launch mode with oscillating cursors
     */
    initHardcoreMode() {
        this.hardcoreMode = FeatureManager.isEnabled("hardcore_launch");
        
        if (!this.hardcoreMode) {
            return;
        }

        const minSize = FeatureManager.getParameter("hardcore_launch", "minSize") || HARDCORE_LAUNCH.SIZE_MIN;
        const maxSize = FeatureManager.getParameter("hardcore_launch", "maxSize") || HARDCORE_LAUNCH.SIZE_MAX;
        const minAngle = FeatureManager.getParameter("hardcore_launch", "minAngle") || HARDCORE_LAUNCH.ANGLE_MIN;
        const maxAngle = FeatureManager.getParameter("hardcore_launch", "maxAngle") || HARDCORE_LAUNCH.ANGLE_MAX;
        const minForce = FeatureManager.getParameter("hardcore_launch", "minForce") || HARDCORE_LAUNCH.FORCE_MIN;
        const maxForce = FeatureManager.getParameter("hardcore_launch", "maxForce") || HARDCORE_LAUNCH.FORCE_MAX;
        const sizeSpeed = FeatureManager.getParameter("hardcore_launch", "sizeSpeed") || HARDCORE_LAUNCH.SIZE_SPEED;
        const angleSpeed = FeatureManager.getParameter("hardcore_launch", "angleSpeed") || HARDCORE_LAUNCH.ANGLE_SPEED;
        const forceSpeed = FeatureManager.getParameter("hardcore_launch", "forceSpeed") || HARDCORE_LAUNCH.FORCE_SPEED;

        this.hardcoreParams = { minForce, maxForce };

        // Initialize current values at midpoint
        this.hardcoreState.currentSize = (minSize + maxSize) / 2;
        this.hardcoreState.currentAngle = 0;
        this.hardcoreState.currentForce = (minForce + maxForce) / 2;

        // Create oscillator for SIZE
        this.scene.tweens.add({
            targets: this.hardcoreState,
            currentSize: { from: minSize, to: maxSize },
            duration: sizeSpeed,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            onUpdate: () => {
                this.ballPlaceholder.setRadius(this.hardcoreState.currentSize);
                EventBus.emit('hardcore:sizeUpdate', this.hardcoreState.currentSize);
            }
        });

        // Create oscillator for ANGLE
        this.scene.tweens.add({
            targets: this.hardcoreState,
            currentAngle: { from: minAngle, to: maxAngle },
            duration: angleSpeed,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            onUpdate: () => {
                EventBus.emit('hardcore:angleUpdate', this.hardcoreState.currentAngle);
            }
        });

        // Create oscillator for FORCE
        this.scene.tweens.add({
            targets: this.hardcoreState,
            currentForce: { from: minForce, to: maxForce },
            duration: forceSpeed,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            onUpdate: () => {
                const forcePercent = ((this.hardcoreState.currentForce - minForce) / (maxForce - minForce)) * 100;
                EventBus.emit('hardcore:forceUpdate', forcePercent);
            }
        });
    }

    /**
     * Update ball placeholder position to follow cursor
     * @param {Phaser.Input.Pointer} pointer - The mouse pointer
     * @param {number} livesRemaining - Current lives remaining
     */
    updatePlaceholder(pointer, livesRemaining) {
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

        this.ballPlaceholder.setPosition(constrainedX, constrainedY);

        // Update angle arrow position in hardcore mode
        if (this.hardcoreMode) {
            EventBus.emit('hardcore:placeholderMove', constrainedX, constrainedY);
        }

        // Show placeholder only if cursor is near start zone and lives remain
        const isNearStartZone = pointer.y < this.startZone.y + this.startZone.height + 50;
        this.ballPlaceholder.setVisible(isNearStartZone && livesRemaining > 0);
    }

    /**
     * Launch a new ball at the specified position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate (default 100)
     * @returns {Ball} The created ball
     */
    launchBall(x, y = 100) {
        const ballSize = this.hardcoreMode 
            ? this.hardcoreState.currentSize 
            : DESIGN_CONSTANTS.BALL_RADIUS;
        
        const ball = new Ball(this.scene, x, y, ballSize);

        // Launch with hardcore parameters or normal mode
        if (this.hardcoreMode) {
            const angleRad = Phaser.Math.DegToRad(this.hardcoreState.currentAngle);
            const velocityX = Math.sin(angleRad) * this.hardcoreState.currentForce;
            const velocityY = Math.cos(angleRad) * this.hardcoreState.currentForce * 0.5;
            
            console.log(`Hardcore launch: angle=${this.hardcoreState.currentAngle.toFixed(1)}°, force=${this.hardcoreState.currentForce.toFixed(1)}, vX=${velocityX.toFixed(1)}, vY=${velocityY.toFixed(1)}`);
            ball.launch(velocityX, velocityY);
        } else {
            ball.launch();
        }

        EventBus.emit(GameEvents.BALL_LAUNCHED, { ball, x, y });
        
        return ball;
    }

    /**
     * Check if placeholder is visible and can launch
     * @returns {boolean}
     */
    canLaunch() {
        return this.ballPlaceholder && this.ballPlaceholder.visible;
    }

    /**
     * Get placeholder position
     * @returns {{x: number, y: number}}
     */
    getPlaceholderPosition() {
        return {
            x: this.ballPlaceholder.x,
            y: this.ballPlaceholder.y
        };
    }

    /**
     * Check if hardcore mode is enabled
     * @returns {boolean}
     */
    isHardcoreMode() {
        return this.hardcoreMode;
    }

    /**
     * Update start zone reference
     * @param {Object} startZone - New start zone boundaries
     */
    setStartZone(startZone) {
        this.startZone = startZone;
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.ballPlaceholder) {
            this.ballPlaceholder.destroy();
            this.ballPlaceholder = null;
        }
        this.hardcoreMode = false;
        this.hardcoreParams = null;
    }
}
