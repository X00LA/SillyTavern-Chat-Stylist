import { DOMUtils } from "../../utils/DOMUtils.js";

export class ColorPicker {
    constructor(options = {}) {
        this.options = {
            label: options.label || '',
            initialColor: options.initialColor || 'rgb(208, 206, 196)',
            onChange: options.onChange || null
        };

        this.element = null;
        this.picker = null;
        this.value = this.options.initialColor;
    }

    createElement() {
        const container = DOMUtils.createElement('div', 'color-picker-wrapper');

        if (this.options.label) {
            const label = DOMUtils.createElement('label', 'color-picker-label');
            label.textContent = this.options.label;
            container.appendChild(label);
        }

        // Compact color swatch that opens a picker (with alpha) on click, same as in SillyTavern's own settings
        const picker = document.createElement('toolcool-color-picker');
        picker.setAttribute('color', this.options.initialColor);
        // The swatch sits at the right edge, so the picker has to open towards the left to stay visible
        picker.setAttribute('popup-position', 'right');
        container.appendChild(picker);

        this.element = container;
        this.picker = picker;

        this.bindEvents();

        return container;
    }

    bindEvents() {
        this.picker.addEventListener('change', (event) => {
            this.value = event.detail.rgba;
            if (this.options.onChange) {
                this.options.onChange(this.value);
            }
        });
    }

    getValue() {
        return this.value;
    }

    setValue(color) {
        this.value = color;
        if (this.picker) {
            this.picker.setAttribute('color', color);
        }
    }
}
