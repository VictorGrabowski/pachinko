/**
 * Toggle - Reusable toggle switch component
 * 
 * Single Responsibility: Creates a styled toggle switch with label.
 * Extracted from ModalComponent to follow ISP.
 * 
 * @module ui/controls/Toggle
 */

export default class Toggle {
    /**
     * @param {Object} config - Toggle configuration
     * @param {HTMLElement} config.container - Parent container element
     * @param {string} config.label - Toggle label text
     * @param {boolean} config.checked - Initial checked state
     * @param {Function} config.onChange - Callback when state changes
     */
    constructor(config) {
        this.config = {
            label: config.label || 'Toggle',
            checked: config.checked ?? false,
            onChange: config.onChange || (() => {}),
        };
        
        this.container = config.container;
        this.element = null;
        this.input = null;
        
        this.create();
    }

    /**
     * Create the toggle DOM elements
     */
    create() {
        this.element = document.createElement('div');
        this.element.className = 'toggle-control';
        this.element.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding: 8px 0;
        `;

        // Label
        const label = document.createElement('label');
        label.textContent = this.config.label;
        label.style.cssText = `
            color: #fff;
            font-size: 14px;
            font-family: serif;
            cursor: pointer;
        `;

        // Toggle switch container
        const switchContainer = document.createElement('div');
        switchContainer.style.cssText = `
            position: relative;
            width: 50px;
            height: 26px;
        `;

        // Hidden checkbox
        this.input = document.createElement('input');
        this.input.type = 'checkbox';
        this.input.checked = this.config.checked;
        this.input.style.cssText = `
            opacity: 0;
            width: 0;
            height: 0;
        `;

        // Visual switch track
        const track = document.createElement('span');
        track.className = 'toggle-track';
        track.style.cssText = `
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: ${this.config.checked ? '#8B0000' : '#333'};
            transition: 0.3s;
            border-radius: 26px;
            border: 2px solid ${this.config.checked ? '#FFD700' : '#666'};
        `;

        // Visual switch thumb
        const thumb = document.createElement('span');
        thumb.className = 'toggle-thumb';
        thumb.style.cssText = `
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: ${this.config.checked ? '26px' : '4px'};
            bottom: 4px;
            background-color: ${this.config.checked ? '#FFD700' : '#999'};
            transition: 0.3s;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        // Event listeners
        const updateVisual = (checked) => {
            track.style.backgroundColor = checked ? '#8B0000' : '#333';
            track.style.borderColor = checked ? '#FFD700' : '#666';
            thumb.style.left = checked ? '26px' : '4px';
            thumb.style.backgroundColor = checked ? '#FFD700' : '#999';
        };

        this.input.addEventListener('change', (e) => {
            updateVisual(e.target.checked);
            this.config.onChange(e.target.checked);
        });

        // Allow clicking the track/thumb to toggle
        switchContainer.addEventListener('click', () => {
            this.input.checked = !this.input.checked;
            updateVisual(this.input.checked);
            this.config.onChange(this.input.checked);
        });

        label.addEventListener('click', () => {
            this.input.checked = !this.input.checked;
            updateVisual(this.input.checked);
            this.config.onChange(this.input.checked);
        });

        switchContainer.appendChild(this.input);
        switchContainer.appendChild(track);
        switchContainer.appendChild(thumb);

        this.element.appendChild(label);
        this.element.appendChild(switchContainer);

        if (this.container) {
            this.container.appendChild(this.element);
        }
    }

    /**
     * Get current checked state
     * @returns {boolean}
     */
    isChecked() {
        return this.input.checked;
    }

    /**
     * Set checked state
     * @param {boolean} checked - New state
     */
    setChecked(checked) {
        this.input.checked = checked;
        // Trigger visual update
        this.input.dispatchEvent(new Event('change'));
    }

    /**
     * Destroy the toggle
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
