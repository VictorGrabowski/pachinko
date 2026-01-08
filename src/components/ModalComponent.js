import { DESIGN_CONSTANTS } from '../config/gameConfig.js';

/**
 * ModalComponent - Reusable modal for configuring feature parameters
 * 
 * This class creates a modal overlay with parameter controls (sliders, toggles, etc.)
 * The modal dynamically generates UI based on the parameter definitions.
 * 
 * Usage:
 *   const modal = new ModalComponent(scene);
 *   modal.show(featureDefinition, currentValues, (updatedValues) => {
 *     // Handle save
 *   });
 */
export default class ModalComponent {
  constructor(scene) {
    this.scene = scene;
    this.container = null;
    this.isVisible = false;
    this.onSaveCallback = null;
    this.parameterControls = [];
  }

  /**
   * Show the modal with feature configuration
   * @param {Object} feature - Feature definition with parameters
   * @param {Object} currentValues - Current parameter values
   * @param {Function} onSave - Callback when save is clicked
   */
  show(feature, currentValues, onSave) {
    if (this.isVisible) {
      this.hide();
    }

    this.onSaveCallback = onSave;
    this.parameterControls = [];
    
    // Create container
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1000);

    // Background dimmer
    const dimmer = this.scene.add.rectangle(
      400, 500, 800, 1000, 0x000000, 0.8
    );
    dimmer.setInteractive();
    this.container.add(dimmer);

    // Modal background
    const modalWidth = 600;
    const modalHeight = 500;
    const modalBg = this.scene.add.rectangle(
      400, 500, modalWidth, modalHeight,
      DESIGN_CONSTANTS.COLORS.BACKGROUND
    );
    modalBg.setStrokeStyle(3, DESIGN_CONSTANTS.COLORS.GOLD);
    this.container.add(modalBg);

    // Title
    const title = this.scene.add.text(400, 280, feature.name, {
      fontSize: "32px",
      fontFamily: "serif",
      color: "#ffd700",
      align: "center"
    }).setOrigin(0.5);
    this.container.add(title);

    // Description
    const desc = this.scene.add.text(400, 320, feature.description, {
      fontSize: "16px",
      fontFamily: "serif",
      color: "#ffb7c5",
      align: "center",
      wordWrap: { width: modalWidth - 80 }
    }).setOrigin(0.5);
    this.container.add(desc);

    // Generate parameter controls
    let yPos = 360;
    if (feature.parameters && feature.parameters.length > 0) {
      feature.parameters.forEach(param => {
        const control = this.createParameterControl(
          param,
          currentValues[param.key],
          yPos,
          modalWidth
        );
        this.parameterControls.push(control);
        yPos += 70;
      });
    } else {
      // No parameters message
      const noParams = this.scene.add.text(400, 380, "Pas de paramètres configurables", {
        fontSize: "18px",
        fontFamily: "serif",
        color: "#888888",
        align: "center"
      }).setOrigin(0.5);
      this.container.add(noParams);
    }

    // Buttons
    this.createButtons(modalWidth);

    this.isVisible = true;

    // Fade in animation
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });
  }

  /**
   * Create control for a parameter
   * @param {Object} param - Parameter definition
   * @param {any} currentValue - Current value
   * @param {number} y - Y position
   * @param {number} modalWidth - Modal width
   * @returns {Object} Control object with getValue method
   */
  createParameterControl(param, currentValue, y, modalWidth) {
    // Clamp currentValue to min/max range
    if (param.type === 'number') {
      currentValue = Phaser.Math.Clamp(currentValue, param.min, param.max);
    }
    
    const control = {
      param: param,
      getValue: () => currentValue
    };

    // Label
    const label = this.scene.add.text(150, y, param.label, {
      fontSize: "18px",
      fontFamily: "serif",
      color: "#ffffff"
    });
    this.container.add(label);

    if (param.type === 'number') {
      // Slider control
      const sliderWidth = 300;
      const sliderX = 350;

      // Slider background
      const sliderBg = this.scene.add.rectangle(
        sliderX, y, sliderWidth, 6,
        0x555555
      );
      this.container.add(sliderBg);

      // Slider track
      const trackWidth = ((currentValue - param.min) / (param.max - param.min)) * sliderWidth;
      const sliderTrack = this.scene.add.rectangle(
        sliderX - sliderWidth/2, y,
        trackWidth, 6,
        DESIGN_CONSTANTS.COLORS.GOLD
      );
      sliderTrack.setOrigin(0, 0.5);
      this.container.add(sliderTrack);

      // Slider handle
      const handleX = sliderX - sliderWidth/2 + trackWidth;
      const sliderHandle = this.scene.add.circle(
        handleX, y, 12,
        DESIGN_CONSTANTS.COLORS.ACCENT
      );
      sliderHandle.setStrokeStyle(2, 0xffffff);
      sliderHandle.setInteractive({ draggable: true });
      this.container.add(sliderHandle);

      // Value display
      const valueText = this.scene.add.text(sliderX + sliderWidth/2 + 30, y, currentValue.toFixed(param.step < 1 ? 1 : 0), {
        fontSize: "20px",
        fontFamily: "serif",
        color: "#ffd700",
        fontStyle: "bold"
      }).setOrigin(0, 0.5);
      this.container.add(valueText);

      // Drag handler
      sliderHandle.on('drag', (pointer, dragX, dragY) => {
        const minX = sliderX - sliderWidth/2;
        const maxX = sliderX + sliderWidth/2;
        const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);
        
        sliderHandle.x = clampedX;
        
        // Update track - only change width, keep origin at left
        const newTrackWidth = clampedX - minX;
        sliderTrack.width = newTrackWidth;
        
        // Calculate value
        const ratio = (clampedX - minX) / sliderWidth;
        const value = param.min + ratio * (param.max - param.min);
        const steppedValue = Math.round(value / param.step) * param.step;
        
        currentValue = steppedValue;
        valueText.setText(steppedValue.toFixed(param.step < 1 ? 1 : 0));
      });

      control.getValue = () => currentValue;

    } else if (param.type === 'boolean') {
      // Toggle control
      const toggleX = 400;
      const toggleWidth = 60;
      const toggleHeight = 30;

      // Toggle background
      const toggleBg = this.scene.add.rectangle(
        toggleX, y, toggleWidth, toggleHeight,
        currentValue ? DESIGN_CONSTANTS.COLORS.GOLD : 0x555555
      );
      toggleBg.setStrokeStyle(2, 0xffffff);
      toggleBg.setInteractive();
      this.container.add(toggleBg);

      // Toggle handle
      const handleX = currentValue ? toggleX + 15 : toggleX - 15;
      const toggleHandle = this.scene.add.circle(
        handleX, y, 12, 0xffffff
      );
      this.container.add(toggleHandle);

      // State text
      const stateText = this.scene.add.text(toggleX + 50, y, currentValue ? "ON" : "OFF", {
        fontSize: "18px",
        fontFamily: "serif",
        color: currentValue ? DESIGN_CONSTANTS.COLORS.GOLD : "#888888",
        fontStyle: "bold"
      }).setOrigin(0, 0.5);
      this.container.add(stateText);

      // Click handler
      toggleBg.on('pointerdown', () => {
        currentValue = !currentValue;
        
        // Update visual
        toggleBg.setFillStyle(currentValue ? DESIGN_CONSTANTS.COLORS.GOLD : 0x555555);
        
        this.scene.tweens.add({
          targets: toggleHandle,
          x: currentValue ? toggleX + 15 : toggleX - 15,
          duration: 150,
          ease: 'Power2'
        });

        stateText.setText(currentValue ? "ON" : "OFF");
        stateText.setColor(currentValue ? "#ffd700" : "#888888");
      });

      control.getValue = () => currentValue;
    }

    return control;
  }

  /**
   * Create save/cancel buttons
   * @param {number} modalWidth - Modal width
   */
  createButtons(modalWidth) {
    const buttonY = 680;

    // Cancel button
    const cancelBtn = this.scene.add.rectangle(
      300, buttonY, 140, 50,
      0x555555
    );
    cancelBtn.setStrokeStyle(2, 0xffffff);
    cancelBtn.setInteractive();
    this.container.add(cancelBtn);

    const cancelText = this.scene.add.text(300, buttonY, "Annuler", {
      fontSize: "20px",
      fontFamily: "serif",
      color: "#ffffff"
    }).setOrigin(0.5);
    this.container.add(cancelText);

    // Save button
    const saveBtn = this.scene.add.rectangle(
      500, buttonY, 140, 50,
      DESIGN_CONSTANTS.COLORS.GOLD
    );
    saveBtn.setStrokeStyle(2, 0xffffff);
    saveBtn.setInteractive();
    this.container.add(saveBtn);

    const saveText = this.scene.add.text(500, buttonY, "Enregistrer", {
      fontSize: "20px",
      fontFamily: "serif",
      color: "#000000",
      fontStyle: "bold"
    }).setOrigin(0.5);
    this.container.add(saveText);

    // Hover effects
    cancelBtn.on('pointerover', () => {
      this.scene.tweens.add({
        targets: cancelBtn,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100
      });
    });

    cancelBtn.on('pointerout', () => {
      this.scene.tweens.add({
        targets: cancelBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
    });

    saveBtn.on('pointerover', () => {
      this.scene.tweens.add({
        targets: saveBtn,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100
      });
    });

    saveBtn.on('pointerout', () => {
      this.scene.tweens.add({
        targets: saveBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
    });

    // Click handlers
    cancelBtn.on('pointerdown', () => {
      this.hide();
    });

    saveBtn.on('pointerdown', () => {
      this.save();
    });
  }

  /**
   * Save and close
   */
  save() {
    if (this.onSaveCallback) {
      // Collect all parameter values
      const values = {};
      this.parameterControls.forEach(control => {
        values[control.param.key] = control.getValue();
      });
      
      this.onSaveCallback(values);
    }
    this.hide();
  }

  /**
   * Hide the modal
   */
  hide() {
    if (!this.isVisible || !this.container) {
      return;
    }

    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        if (this.container) {
          this.container.destroy();
          this.container = null;
        }
      }
    });

    this.isVisible = false;
    this.onSaveCallback = null;
    this.parameterControls = [];
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    this.isVisible = false;
    this.onSaveCallback = null;
    this.parameterControls = [];
  }
}
