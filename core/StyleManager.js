import { ColorUtils } from "../utils/ColorUtils.js";
import { StyleUtils } from "../utils/StyleUtils.js";
import { StyleConfig } from "../models/StyleConfig.js";

// Chat elements a style applies to. The #chat prefix outranks SillyTavern's own theme rules.
const SELECTORS = {
    bubble: '#chat .mes .mes_block',
    text: '#chat .mes .mes_text',
    italic: '#chat .mes .mes_text :is(em, i)',
    bold: '#chat .mes .mes_text :is(strong, b)',
    underline: '#chat .mes .mes_text u',
    quote: '#chat .mes .mes_text q',
};

// Italic and bold text inside quotes keeps the quote color, like in SillyTavern itself
const FIXED_RULES = `${SELECTORS.quote} :is(em, i, strong, b) { color: inherit; }`;

export class StyleManager {
    constructor(settings) {
        this.settings = settings;

        // All chat styles live in one stylesheet, so newly rendered messages are styled automatically
        this.styleElement = document.createElement('style');
        this.styleElement.id = 'chat-stylist-styles';
        document.head.appendChild(this.styleElement);
    }

    /**
     * Converts a style into CSS declarations for each styled element.
     * Shared by the chat stylesheet and the editor preview.
     * @param {StyleConfig} styleConfig
     * Bold and underline are only included when a color is set.
     * @returns {{bubble: Object<string, string>, text: Object<string, string>, italic: Object<string, string>, bold?: Object<string, string>, underline?: Object<string, string>, quote: Object<string, string>}}
     */
    static getDeclarations(styleConfig) {
        const bubble = styleConfig.bubble.data;
        const text = styleConfig.text.data;

        const background = bubble.background.type === 'gradient'
            ? ColorUtils.createGradient(
                bubble.background.gradient.type,
                bubble.background.gradient.colors,
                bubble.background.gradient.positions,
                bubble.background.gradient.angle
            )
            : ColorUtils.toCssColor(bubble.background.color, bubble.background.opacity);

        const quote = { 'color': text.quoteColor };
        if (text.quoteEffect.enabled) {
            // Layered shadows with growing blur, a single shadow is barely visible on dark backgrounds
            const { radius, glowColor } = text.quoteEffect;
            quote['text-shadow'] = [1, 2, 4]
                .map(factor => `0 0 ${radius * factor}px ${glowColor}`)
                .join(', ');
        }

        const declarations = {
            bubble: {
                'background': background,
                'border': `${bubble.border.width}px ${bubble.border.style} ${bubble.border.color}`,
                'padding': `${bubble.padding.top}px ${bubble.padding.right}px ${bubble.padding.bottom}px ${bubble.padding.left}px`,
                'border-radius': bubble.shape === 'round' ? '10px' :
                                 bubble.shape === 'custom' ? bubble.customBorderRadius : '0',
            },
            text: { 'color': text.mainColor },
            italic: { 'color': text.italicColor },
            quote,
        };
        if (text.boldColor) {
            declarations.bold = { 'color': text.boldColor };
        }
        if (text.underlineColor) {
            declarations.underline = { 'color': text.underlineColor };
        }
        return declarations;
    }

    applyStylesToChat() {
        if (!this.settings.enabled || !this.settings.hasCustomStyle()) {
            this.styleElement.textContent = '';
            return;
        }

        const declarations = StyleManager.getDeclarations(this.settings.getDefaultStyle());
        const rules = Object.entries(declarations)
            .map(([target, properties]) => `${SELECTORS[target]} { ${StyleUtils.objectToCssString(properties)} }`);
        this.styleElement.textContent = [...rules, FIXED_RULES].join('\n');
    }

    saveDefaultStyle(style) {
        this.settings.setDefaultStyle(style);
        this.settings.save();
        this.applyStylesToChat();
    }

    saveCharacterStyle(characterId, style) {
        this.settings.setCharacterStyle(characterId, style);
        this.settings.save();
        this.applyStylesToChat();
    }

    resetStyles() {
        this.settings.reset();
        this.settings.save();
        this.applyStylesToChat();
    }

    exportStyles() {
        return {
            defaultStyle: this.settings.getDefaultStyle().toJSON(),
            userStyle: this.settings.getUserStyle().toJSON(),
            systemStyle: this.settings.getSystemStyle().toJSON(),
            characterStyles: Object.fromEntries(
                Object.entries(this.settings.settings.characterStyles)
                    .map(([id, style]) => [id, new StyleConfig(style).toJSON()])
            )
        };
    }

    importStyles(data) {
        try {
            if (!data) throw new Error('No data to import');

            // Validate and convert data
            const styles = {
                defaultStyle: new StyleConfig(data.defaultStyle),
                userStyle: data.userStyle ? new StyleConfig(data.userStyle) : null,
                systemStyle: data.systemStyle ? new StyleConfig(data.systemStyle) : null,
                characterStyles: {}
            };

            // Handle character styles
            if (data.characterStyles) {
                for (const [id, style] of Object.entries(data.characterStyles)) {
                    styles.characterStyles[id] = new StyleConfig(style);
                }
            }

            // Update settings
            this.settings.settings.defaultStyle = styles.defaultStyle.toJSON();
            this.settings.settings.userStyle = styles.userStyle?.toJSON() || null;
            this.settings.settings.systemStyle = styles.systemStyle?.toJSON() || null;
            this.settings.settings.characterStyles = Object.fromEntries(
                Object.entries(styles.characterStyles)
                    .map(([id, style]) => [id, style.toJSON()])
            );

            // Save and apply changes
            this.settings.save();
            this.applyStylesToChat();

            return true;
        } catch (error) {
            console.error('Failed to import styles:', error);
            return false;
        }
    }
}
