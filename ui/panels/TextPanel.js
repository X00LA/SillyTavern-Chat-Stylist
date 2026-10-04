import { DOMUtils } from "../../utils/DOMUtils.js";
import { StylePanel } from "../StylePanel.js";
import { ColorPicker } from "../components/ColorPicker.js";

const { t } = SillyTavern.getContext();

// Reads a color of the active SillyTavern theme, e.g. '--SmartThemeUnderlineColor'
const getThemeColor = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export class TextPanel {
    constructor(options = {}) {
        this.options = {
            onChange: options.onChange || null,
            initialStyle: options.initialStyle || {}
        };

        this.element = null;
        this.colorPickers = new Map();
    }

    createElement() {
        const container = DOMUtils.createElement('div', 'text-panel');

        // Main text style
        const mainTextSection = this.createMainTextSection();
        container.appendChild(mainTextSection);

        // Italic text style
        const italicTextSection = this.createItalicTextSection();
        container.appendChild(italicTextSection);

        // Bold text style (**text**), without own color it uses the main text color like in SillyTavern
        const boldTextSection = this.createColorSection(
            t`Bold text`,
            t`Bold color`,
            'boldTextColor',
            this.options.initialStyle.boldColor || this.options.initialStyle.mainColor || '#000000'
        );
        container.appendChild(boldTextSection);

        // Underlined text style (__text__), without own color it uses the theme's underline color
        const underlineTextSection = this.createColorSection(
            t`Underlined text`,
            t`Underline color`,
            'underlineTextColor',
            this.options.initialStyle.underlineColor || getThemeColor('--SmartThemeUnderlineColor') || '#000000'
        );
        container.appendChild(underlineTextSection);

        // Quoted text style
        const quoteTextSection = this.createQuoteTextSection();
        container.appendChild(quoteTextSection);

        this.element = container;
        return container;
    }

    createMainTextSection() {
        const section = DOMUtils.createElement('div', 'style-section');

        // Title
        const title = DOMUtils.createElement('h3', 'section-title');
        title.textContent = t`Main text`;
        section.appendChild(title);

        // Color picker
        const colorPicker = new ColorPicker({
            label: t`Text color`,
            initialColor: this.options.initialStyle.mainColor || '#000000',
            onChange: (color) => {
                if(this.options.onChange) {
                    this.options.onChange({
                        type: 'mainText',
                        value: { color }
                    });
                }
            }
        });
        this.colorPickers.set('mainTextColor', colorPicker);
        section.appendChild(colorPicker.createElement());

        return section;
    }

    createItalicTextSection() {
        const section = DOMUtils.createElement('div', 'style-section');

        // Title
        const title = DOMUtils.createElement('h3', 'section-title');
        title.textContent = t`Italic text`;
        section.appendChild(title);

        // Color picker
        const colorPicker = new ColorPicker({
            label: t`Italic color`,
            initialColor: this.options.initialStyle.italicColor || '#666666',
            onChange: (color) => {
                if(this.options.onChange) {
                    this.options.onChange({
                        type: 'italicText',
                        value: { color }
                    });
                }
            }
        });
        this.colorPickers.set('italicTextColor', colorPicker);
        section.appendChild(colorPicker.createElement());

        return section;
    }

    // Section with a title and a single color picker
    createColorSection(titleText, label, pickerKey, initialColor) {
        const section = DOMUtils.createElement('div', 'style-section');

        // Title
        const title = DOMUtils.createElement('h3', 'section-title');
        title.textContent = titleText;
        section.appendChild(title);

        // Color picker
        const colorPicker = new ColorPicker({
            label,
            initialColor,
            onChange: (color) => {
                if(this.options.onChange) {
                    this.options.onChange({
                        type: pickerKey,
                        value: { color }
                    });
                }
            }
        });
        this.colorPickers.set(pickerKey, colorPicker);
        section.appendChild(colorPicker.createElement());

        return section;
    }

    createQuoteTextSection() {
        const section = DOMUtils.createElement('div', 'style-section');

        // Title
        const title = DOMUtils.createElement('h3', 'section-title');
        title.textContent = t`Quoted text`;
        section.appendChild(title);

        // Quoted text controls container
        const quoteControls = DOMUtils.createElement('div', 'quote-controls');

        // Color picker
        const colorPicker = new ColorPicker({
            label: t`Quote color`,
            initialColor: this.options.initialStyle.quoteColor || '#3388ff',
            onChange: (color) => {
                if(this.options.onChange) {
                    this.options.onChange({
                        type: 'quoteText',
                        value: { color }
                    });
                }
            }
        });
        this.colorPickers.set('quoteTextColor', colorPicker);
        quoteControls.appendChild(colorPicker.createElement());

        // Glow effect controls
        const glowControls = DOMUtils.createElement('div', 'glow-effect-controls');

        // Enable toggle
        const glowToggle = DOMUtils.createElement('label', 'checkbox-label');
        glowToggle.innerHTML = `
            <input type="checkbox"
                   ${this.options.initialStyle.quoteEffect?.enabled ? 'checked' : ''}/>
            <span>${t`Enable glow effect`}</span>
        `;
        glowControls.appendChild(glowToggle);

        // Glow color and intensity controls
        const glowOptions = DOMUtils.createElement('div', 'glow-options');
        glowOptions.style.display = this.options.initialStyle.quoteEffect?.enabled ? '' : 'none';

        // Glow color
        const glowColorPicker = new ColorPicker({
            label: t`Glow color`,
            initialColor: this.options.initialStyle.quoteEffect?.glowColor || '#3388ff',
            onChange: (color) => {
                if(this.options.onChange) {
                    this.options.onChange({
                        type: 'quoteGlow',
                        value: {
                            enabled: true,
                            color: color
                        }
                    });
                }
            }
        });
        this.colorPickers.set('quoteGlowColor', glowColorPicker);
        glowOptions.appendChild(glowColorPicker.createElement());

        // Glow intensity
        const glowIntensity = DOMUtils.createElement('div', 'glow-intensity');
        glowIntensity.innerHTML = `
            <label>${t`Glow intensity`}</label>
            <div class="slider-container">
                <input type="range"
                       min="1" max="20"
                       value="${this.options.initialStyle.quoteEffect?.radius || 2}" />
                <span class="slider-value">
                    ${this.options.initialStyle.quoteEffect?.radius || 2}px
                </span>
            </div>
        `;
        glowOptions.appendChild(glowIntensity);

        glowControls.appendChild(glowOptions);
        quoteControls.appendChild(glowControls);

        // Bind events
        glowToggle.querySelector('input').addEventListener('change', (e) => {
            glowOptions.style.display = e.target.checked ? '' : 'none';
            if(this.options.onChange) {
                this.options.onChange({
                    type: 'quoteGlow',
                    value: {
                        enabled: e.target.checked
                    }
                });
            }
        });

        glowIntensity.querySelector('input').addEventListener('input', (e) => {
            const value = e.target.value;
            glowIntensity.querySelector('.slider-value').textContent = `${value}px`;
            if(this.options.onChange) {
                this.options.onChange({
                    type: 'quoteGlow',
                    value: {
                        enabled: true,
                        radius: parseInt(value)
                    }
                });
            }
        });

        section.appendChild(quoteControls);
        return section;
    }

    getCurrentStyle() {
        if(!this.element) return null;

        return {
            mainColor: this.colorPickers.get('mainTextColor').getValue(),
            italicColor: this.colorPickers.get('italicTextColor').getValue(),
            boldColor: this.colorPickers.get('boldTextColor').getValue(),
            underlineColor: this.colorPickers.get('underlineTextColor').getValue(),
            quoteColor: this.colorPickers.get('quoteTextColor').getValue(),
            quoteEffect: {
                enabled: this.element.querySelector('.glow-effect-controls input[type="checkbox"]').checked,
                glowColor: this.colorPickers.get('quoteGlowColor').getValue(),
                radius: parseInt(this.element.querySelector('.glow-intensity input').value)
            }
        };
    }
}
