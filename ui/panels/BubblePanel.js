import { DOMUtils } from "../../utils/DOMUtils.js";
import { StylePanel } from "../StylePanel.js";
import { ColorPicker } from "../components/ColorPicker.js";

const { t } = SillyTavern.getContext();

export class BubblePanel {
    constructor(options = {}) {
        this.options = {
            onChange: options.onChange || null,
            initialStyle: options.initialStyle || {}
        };

        this.element = null;
        this.colorPickers = new Map();
    }

    createElement() {
        const container = DOMUtils.createElement('div', 'bubble-panel');

        // Background section
        const backgroundSection = this.createBackgroundSection();
        container.appendChild(backgroundSection);

        // Border section
        const borderSection = this.createBorderSection();
        container.appendChild(borderSection);

        // Padding section
        const paddingSection = this.createPaddingSection();
        container.appendChild(paddingSection);

        this.element = container;
        return container;
    }

    createBackgroundSection() {
        const section = DOMUtils.createElement('div', 'style-section');

        // Add title
        const title = DOMUtils.createElement('h3', 'section-title');
        title.textContent = t`Background`;
        section.appendChild(title);

        // Background type selection
        const typeSelect = DOMUtils.createElement('select', 'style-select background-type');
        typeSelect.innerHTML = `
            <option value="solid">${t`Solid color`}</option>
            <option value="gradient">${t`Gradient`}</option>
        `;
        typeSelect.value = this.options.initialStyle.background?.type || 'solid';
        typeSelect.addEventListener('change', () => this.notifyChange('background', { type: typeSelect.value }));
        section.appendChild(typeSelect);

        // Solid color picker
        const solidColorPicker = new ColorPicker({
            label: t`Background color`,
            initialColor: this.options.initialStyle.background?.color || '#ffffff',
            onChange: (color) => {
                if(this.options.onChange) {
                    this.options.onChange({
                        type: 'background',
                        value: {
                            type: 'solid',
                            color: color
                        }
                    });
                }
            }
        });
        this.colorPickers.set('backgroundColor', solidColorPicker);
        const solidControls = solidColorPicker.createElement();
        section.appendChild(solidControls);

        // Gradient controls (linear gradient from start to end color)
        const gradient = this.options.initialStyle.background?.gradient || {};
        const gradientControls = DOMUtils.createElement('div', 'gradient-controls');
        const gradientColors = [
            {key: 'gradientStart', label: t`Start color`, color: gradient.colors?.[0] || '#ffffff'},
            {key: 'gradientEnd', label: t`End color`, color: gradient.colors?.[1] || '#f0f0f0'}
        ];
        gradientColors.forEach(({key, label, color}) => {
            const picker = new ColorPicker({
                label,
                initialColor: color,
                onChange: (value) => this.notifyChange('background', { [key]: value })
            });
            this.colorPickers.set(key, picker);
            gradientControls.appendChild(picker.createElement());
        });

        const angleControl = DOMUtils.createElement('div', 'gradient-angle-control');
        angleControl.innerHTML = `
            <label>${t`Angle`}</label>
            <input type="number" class="style-input" min="0" max="360" value="${gradient.angle ?? 90}" />
            <span>°</span>
        `;
        const angleInput = angleControl.querySelector('input');
        angleInput.addEventListener('input', () => this.notifyChange('background', { angle: parseInt(angleInput.value) }));
        gradientControls.appendChild(angleControl);
        section.appendChild(gradientControls);

        // Only show the controls of the selected background type
        const updateVisibility = () => {
            const isGradient = typeSelect.value === 'gradient';
            solidControls.classList.toggle('hidden', isGradient);
            gradientControls.classList.toggle('hidden', !isGradient);
        };
        typeSelect.addEventListener('change', updateVisibility);
        updateVisibility();

        return section;
    }

    createBorderSection() {
        const section = DOMUtils.createElement('div', 'style-section');

        // Add title
        const title = DOMUtils.createElement('h3', 'section-title');
        title.textContent = t`Border`;
        section.appendChild(title);

        // Border controls container
        const borderControls = DOMUtils.createElement('div', 'border-controls');

        // Border color
        const colorPicker = new ColorPicker({
            label: t`Border color`,
            initialColor: this.options.initialStyle.border?.color || '#e0e0e0',
            onChange: (color) => {
                if(this.options.onChange) {
                    this.options.onChange({
                        type: 'border',
                        value: {
                            color: color
                        }
                    });
                }
            }
        });
        this.colorPickers.set('borderColor', colorPicker);
        borderControls.appendChild(colorPicker.createElement());

        // Border width
        const widthControl = DOMUtils.createElement('div', 'border-width-control');
        widthControl.innerHTML = `
            <label>${t`Border width`}</label>
            <input type="number" class="style-input" min="0" max="10" value="${this.options.initialStyle.border?.width ?? 1}" />
        `;
        const widthInput = widthControl.querySelector('input');
        widthInput.addEventListener('input', () => this.notifyChange('border', { width: parseInt(widthInput.value) }));
        borderControls.appendChild(widthControl);

        // Border style
        const styleSelect = DOMUtils.createElement('select', 'style-select border-style');
        styleSelect.innerHTML = `
            <option value="solid">${t`Solid`}</option>
            <option value="dashed">${t`Dashed`}</option>
            <option value="dotted">${t`Dotted`}</option>
        `;
        styleSelect.value = this.options.initialStyle.border?.style || 'solid';
        styleSelect.addEventListener('change', () => this.notifyChange('border', { style: styleSelect.value }));
        borderControls.appendChild(styleSelect);

        section.appendChild(borderControls);
        return section;
    }

    createPaddingSection() {
        const section = DOMUtils.createElement('div', 'style-section');

        // Add title
        const title = DOMUtils.createElement('h3', 'section-title');
        title.textContent = t`Padding`;
        section.appendChild(title);

        // Padding controls
        const paddingControls = DOMUtils.createElement('div', 'padding-controls');

        // Padding inputs for all four sides
        const directions = [
            {name: 'top', label: t`Top`},
            {name: 'right', label: t`Right`},
            {name: 'bottom', label: t`Bottom`},
            {name: 'left', label: t`Left`}
        ];

        directions.forEach(dir => {
            const control = DOMUtils.createElement('div', 'padding-input');
            control.innerHTML = `
                <label>${dir.label}</label>
                <input type="number"
                       class="style-input"
                       data-side="${dir.name}"
                       min="0"
                       value="${this.options.initialStyle.padding?.[dir.name] ?? 15}" />
            `;
            const input = control.querySelector('input');
            input.addEventListener('input', () => this.notifyChange('padding', { [dir.name]: parseInt(input.value) }));
            paddingControls.appendChild(control);
        });

        section.appendChild(paddingControls);
        return section;
    }

    notifyChange(type, value) {
        if(this.options.onChange) {
            this.options.onChange({ type, value });
        }
    }

    getCurrentStyle() {
        if(!this.element) return null;

        // Empty number fields count as 0
        const readNumber = (selector) => parseInt(this.element.querySelector(selector).value) || 0;

        return {
            background: {
                // Keep values without controls (e.g. opacity, gradient positions)
                ...this.options.initialStyle.background,
                type: this.element.querySelector('.background-type').value,
                color: this.colorPickers.get('backgroundColor').getValue(),
                gradient: {
                    ...this.options.initialStyle.background?.gradient,
                    colors: [
                        this.colorPickers.get('gradientStart').getValue(),
                        this.colorPickers.get('gradientEnd').getValue()
                    ],
                    angle: readNumber('.gradient-angle-control input')
                }
            },
            border: {
                color: this.colorPickers.get('borderColor').getValue(),
                width: readNumber('.border-width-control input'),
                style: this.element.querySelector('.border-style').value
            },
            padding: {
                top: readNumber('input[data-side="top"]'),
                right: readNumber('input[data-side="right"]'),
                bottom: readNumber('input[data-side="bottom"]'),
                left: readNumber('input[data-side="left"]')
            }
        };
    }
}
