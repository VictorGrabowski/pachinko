/**
 * Slider - Reusable slider control component
 * 
 * Single Responsibility: Creates a draggable slider with label and value display.
 * Extracted from ModalComponent to follow ISP (Interface Segregation Principle).
 * 
 * @module ui/controls/Slider
 */

import { DESIGN_CONSTANTS } from "../../config/gameConfig.js";

export default class Slider {
    /**
     * @param {Object} config - Slider configuration
     * @param {HTMLElement} config.container - Parent container element
     * @param {string} config.label - Slider label text
     * @param {number} config.value - Current value
     * @param {number} config.min - Minimum value
     * @param {number} config.max - Maximum value
     * @param {number} [config.step=1] - Step increment
     * @param {Function} config.onChange - Callback when value changes
     * @param {string} [config.unit=''] - Unit suffix to display
     */
    constructor(config) {
        this.config = {
            label: config.label || 'Value',
            value: config.value ?? 50,
            min: config.min ?? 0,
            max: config.max ?? 100,
            step: config.step ?? 1,
            onChange: config.onChange || (() => {}),
            unit: config.unit || '',
        };
        
        this.container = config.container;
        this.element = null;
        this.input = null;
        this.valueDisplay = null;
        
        this.create();
    }

    /**
     * Create the slider DOM elements
     */
    create() {
        this.element = document.createElement('div');
        this.element.className = 'slider-control';
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 16px;
        `;

        // Label row with value display
        const labelRow = document.createElement('div');
        labelRow.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const label = document.createElement('label');
        label.textContent = this.config.label;
        label.style.cssText = `
            color: #fff;
            font-size: 14px;
            font-family: serif;
        `;

        this.valueDisplay = document.createElement('span');
        this.valueDisplay.textContent = `${this.config.value}${this.config.unit}`;
        this.valueDisplay.style.cssText = `
            color: #FFD700;
            font-size: 14px;
            font-weight: bold;
            font-family: monospace;
        `;

        labelRow.appendChild(label);
        labelRow.appendChild(this.valueDisplay);

        // Slider input
        this.input = document.createElement('input');
        this.input.type = 'range';
        this.input.min = this.config.min;
        this.input.max = this.config.max;
        this.input.step = this.config.step;
        this.input.value = this.config.value;
        this.input.style.cssText = `
            width: 100%;
            height: 8px;
            border-radius: 4px;
            background: linear-gradient(to right, 
                #8B0000 0%, 
                #FFD700 ${((this.config.value - this.config.min) / (this.config.max - this.config.min)) * 100}%, 
                #333 ${((this.config.value - this.config.min) / (this.config.max - this.config.min)) * 100}%);
            outline: none;
            cursor: pointer;
            -webkit-appearance: none;
        `;

        // Add custom thumb styling
        const style = document.createElement('style');
        style.textContent = `
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #FFD700;
                cursor: pointer;
                border: 2px solid #8B0000;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            input[type="range"]::-moz-range-thumb {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #FFD700;
                cursor: pointer;
                border: 2px solid #8B0000;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
        `;
        document.head.appendChild(style);

        // Event listener
        this.input.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.valueDisplay.textContent = `${value}${this.config.unit}`;
            this.updateSliderBackground(value);
            this.config.onChange(value);
        });

        this.element.appendChild(labelRow);
        this.element.appendChild(this.input);
        
        if (this.container) {
            this.container.appendChild(this.element);
        }
    }

    /**
     * Update slider background gradient based on value
     * @param {number} value - Current value
     */
    updateSliderBackground(value) {
        const percent = ((value - this.config.min) / (this.config.max - this.config.min)) * 100;
        this.input.style.background = `linear-gradient(to right, 
            #8B0000 0%, 
            #FFD700 ${percent}%, 
            #333 ${percent}%)`;
    }

    /**
     * Get current value
     * @returns {number}
     */
    getValue() {
        return parseFloat(this.input.value);
    }

    /**
     * Set slider value
     * @param {number} value - New value
     */
    setValue(value) {
        this.input.value = value;
        this.valueDisplay.textContent = `${value}${this.config.unit}`;
        this.updateSliderBackground(value);
    }

    /**
     * Destroy the slider
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
