/**
 * Button - Reusable button component with hover effects
 * 
 * Single Responsibility: Creates styled buttons with consistent
 * hover/press animations across all scenes.
 * 
 * @module ui/Button
 */

import Phaser from "phaser";
import { DESIGN_CONSTANTS } from "../config/gameConfig.js";

export default class Button extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene - The parent scene
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} config - Button configuration
     * @param {string} config.text - Button label text
     * @param {Function} config.onClick - Click callback
     * @param {number} [config.width=200] - Button width
     * @param {number} [config.height=50] - Button height
     * @param {number} [config.fontSize=24] - Font size
     * @param {number} [config.backgroundColor] - Background color (default: ACCENT)
     * @param {number} [config.hoverColor] - Hover color (default: GOLD)
     * @param {string} [config.fontFamily='serif'] - Font family
     * @param {boolean} [config.disabled=false] - Whether button is disabled
     */
    constructor(scene, x, y, config) {
        super(scene, x, y);
        
        this.scene = scene;
        this.config = {
            text: config.text || 'Button',
            onClick: config.onClick || (() => {}),
            width: config.width || 200,
            height: config.height || 50,
            fontSize: config.fontSize || 24,
            backgroundColor: config.backgroundColor ?? DESIGN_CONSTANTS.COLORS.ACCENT,
            hoverColor: config.hoverColor ?? DESIGN_CONSTANTS.COLORS.GOLD,
            fontFamily: config.fontFamily || 'serif',
            disabled: config.disabled || false,
        };
        
        this.isDisabled = this.config.disabled;
        this.createButton();
        
        scene.add.existing(this);
    }

    /**
     * Create the button visual and interactive elements
     */
    createButton() {
        // Background rectangle
        this.background = this.scene.add.rectangle(
            0, 0,
            this.config.width,
            this.config.height,
            this.config.backgroundColor,
            0.8
        );
        this.background.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.PRIMARY);
        
        // Text label
        this.label = this.scene.add.text(0, 0, this.config.text, {
            fontSize: `${this.config.fontSize}px`,
            color: '#FFFFFF',
            fontFamily: this.config.fontFamily,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        // Add to container
        this.add([this.background, this.label]);
        
        // Set interactive area
        this.setSize(this.config.width, this.config.height);
        this.setInteractive({ useHandCursor: true });
        
        // Setup events
        this.setupEvents();
        
        // Apply disabled state if needed
        if (this.isDisabled) {
            this.applyDisabledStyle();
        }
    }

    /**
     * Setup pointer events for hover and click
     */
    setupEvents() {
        this.on('pointerover', () => {
            if (this.isDisabled) return;
            
            this.background.setFillStyle(this.config.hoverColor, 0.9);
            this.scene.tweens.add({
                targets: this,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
                ease: 'Back.easeOut',
            });
        });

        this.on('pointerout', () => {
            if (this.isDisabled) return;
            
            this.background.setFillStyle(this.config.backgroundColor, 0.8);
            this.scene.tweens.add({
                targets: this,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: 'Quad.easeOut',
            });
        });

        this.on('pointerdown', () => {
            if (this.isDisabled) return;
            
            this.scene.tweens.add({
                targets: this,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
            });
        });

        this.on('pointerup', () => {
            if (this.isDisabled) return;
            
            this.scene.tweens.add({
                targets: this,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 50,
                onComplete: () => {
                    this.config.onClick();
                },
            });
        });
    }

    /**
     * Apply disabled visual style
     */
    applyDisabledStyle() {
        this.background.setFillStyle(0x666666, 0.5);
        this.label.setAlpha(0.5);
        this.disableInteractive();
    }

    /**
     * Apply enabled visual style
     */
    applyEnabledStyle() {
        this.background.setFillStyle(this.config.backgroundColor, 0.8);
        this.label.setAlpha(1);
        this.setInteractive({ useHandCursor: true });
    }

    /**
     * Enable the button
     */
    enable() {
        this.isDisabled = false;
        this.applyEnabledStyle();
    }

    /**
     * Disable the button
     */
    disable() {
        this.isDisabled = true;
        this.applyDisabledStyle();
    }

    /**
     * Update button text
     * @param {string} text - New button text
     */
    setText(text) {
        this.label.setText(text);
    }

    /**
     * Update button colors
     * @param {number} backgroundColor - New background color
     * @param {number} hoverColor - New hover color
     */
    setColors(backgroundColor, hoverColor) {
        this.config.backgroundColor = backgroundColor;
        this.config.hoverColor = hoverColor;
        if (!this.isDisabled) {
            this.background.setFillStyle(backgroundColor, 0.8);
        }
    }
}
