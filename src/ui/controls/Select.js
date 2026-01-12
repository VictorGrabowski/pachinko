/**
 * Select - Reusable dropdown select component
 * 
 * Single Responsibility: Creates a styled dropdown select with label.
 * Extracted from ModalComponent to follow ISP.
 * 
 * @module ui/controls/Select
 */

export default class Select {
    /**
     * @param {Object} config - Select configuration
     * @param {HTMLElement} config.container - Parent container element
     * @param {string} config.label - Select label text
     * @param {Array<{value: string, label: string}>} config.options - Available options
     * @param {string} config.value - Currently selected value
     * @param {Function} config.onChange - Callback when selection changes
     */
    constructor(config) {
        this.config = {
            label: config.label || 'Select',
            options: config.options || [],
            value: config.value || '',
            onChange: config.onChange || (() => {}),
        };
        
        this.container = config.container;
        this.element = null;
        this.input = null;
        
        this.create();
    }

    /**
     * Create the select DOM elements
     */
    create() {
        this.element = document.createElement('div');
        this.element.className = 'select-control';
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 16px;
        `;

        // Label
        const label = document.createElement('label');
        label.textContent = this.config.label;
        label.style.cssText = `
            color: #fff;
            font-size: 14px;
            font-family: serif;
        `;

        // Select dropdown
        this.input = document.createElement('select');
        this.input.style.cssText = `
            width: 100%;
            padding: 10px 12px;
            font-size: 14px;
            font-family: serif;
            color: #FFD700;
            background-color: #1a1a2e;
            border: 2px solid #8B0000;
            border-radius: 6px;
            cursor: pointer;
            outline: none;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FFD700' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
        `;

        // Add options
        this.config.options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            option.style.cssText = `
                background-color: #1a1a2e;
                color: #FFD700;
            `;
            if (opt.value === this.config.value) {
                option.selected = true;
            }
            this.input.appendChild(option);
        });

        // Hover and focus styles
        this.input.addEventListener('mouseenter', () => {
            this.input.style.borderColor = '#FFD700';
        });
        this.input.addEventListener('mouseleave', () => {
            if (document.activeElement !== this.input) {
                this.input.style.borderColor = '#8B0000';
            }
        });
        this.input.addEventListener('focus', () => {
            this.input.style.borderColor = '#FFD700';
            this.input.style.boxShadow = '0 0 8px rgba(255, 215, 0, 0.3)';
        });
        this.input.addEventListener('blur', () => {
            this.input.style.borderColor = '#8B0000';
            this.input.style.boxShadow = 'none';
        });

        // Change event
        this.input.addEventListener('change', (e) => {
            this.config.onChange(e.target.value);
        });

        this.element.appendChild(label);
        this.element.appendChild(this.input);

        if (this.container) {
            this.container.appendChild(this.element);
        }
    }

    /**
     * Get current selected value
     * @returns {string}
     */
    getValue() {
        return this.input.value;
    }

    /**
     * Set selected value
     * @param {string} value - New value
     */
    setValue(value) {
        this.input.value = value;
    }

    /**
     * Update available options
     * @param {Array<{value: string, label: string}>} options - New options
     */
    setOptions(options) {
        this.input.innerHTML = '';
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            option.style.cssText = `
                background-color: #1a1a2e;
                color: #FFD700;
            `;
            this.input.appendChild(option);
        });
    }

    /**
     * Destroy the select
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
