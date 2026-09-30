import { ColorUtils } from "../utils/ColorUtils.js";
import { StyleConfig } from "../models/StyleConfig.js";
import { EventTypes } from "./EventManager.js";

export class StyleManager {
    constructor(settings, eventManager) {
        this.settings = settings;
        this.eventManager = eventManager;
        
        // Cache style instances
        this.styleCache = new Map();
        
        this.initializeEvents();
    }

    initializeEvents() {
        this.eventManager.on(EventTypes.STYLE_CHANGED, (data) => {
            this.applyStyle(data.target, data.style);
        });

        this.eventManager.on(EventTypes.STYLE_RESET, () => {
            this.resetStyles();
        });
    }

    getStyleForMessage(messageElement) {
        const isUser = messageElement.getAttribute('is_user') === 'true';
        const isSystem = messageElement.getAttribute('is_system') === 'true';
        const characterId = messageElement.getAttribute('chid');

        let style;
        if (isUser) {
            style = this.settings.getUserStyle();
        } else if (isSystem) {
            style = this.settings.getSystemStyle();
        } else {
            style = this.settings.getCharacterStyle(characterId);
        }

        return style;
    }

    applyStyleToMessage(messageElement, styleConfig) {
        const mesBlock = messageElement.querySelector('.mes_block');
        const mesText = messageElement.querySelector('.mes_text');
        
        if (!mesBlock || !mesText) return;

        // Apply bubble style
        const bubble = styleConfig.bubble.data;
        
        // Background style
        if (bubble.background.type === 'solid') {
            mesBlock.style.background = ColorUtils.hexToRgba(
                bubble.background.color,
                bubble.background.opacity
            );
        } else {
            mesBlock.style.background = ColorUtils.createGradient(
                bubble.background.gradient.type,
                bubble.background.gradient.colors,
                bubble.background.gradient.positions,
                bubble.background.gradient.angle
            );
        }

        // Border style
        mesBlock.style.border = `${bubble.border.width}px ${bubble.border.style} ${bubble.border.color}`;
        
        // Padding
        mesBlock.style.padding = `${bubble.padding.top}px ${bubble.padding.right}px ${bubble.padding.bottom}px ${bubble.padding.left}px`;

        // Border radius
        mesBlock.style.borderRadius = bubble.shape === 'round' ? '10px' : 
                                    bubble.shape === 'custom' ? bubble.customBorderRadius : '0';

        // Apply text style
        const text = styleConfig.text.data;
        
        // Main text color
        mesText.style.color = text.mainColor;

        // Italic text color
        mesText.querySelectorAll('em, i').forEach(em => {
            em.style.color = text.italicColor;
        });

        // Quote text style
        mesText.querySelectorAll('q').forEach(q => {
            q.style.color = text.quoteColor;
            if (text.quoteEffect.enabled) {
                q.style.textShadow = `0 0 ${text.quoteEffect.radius}px ${text.quoteEffect.glowColor}`;
            } else {
                q.style.textShadow = 'none';
            }
        });
    }

    applyStylesToChat() {
        try {
            if (!this.settings.enabled) return;

            document.querySelectorAll('.mes').forEach(messageElement => {
                const style = this.getStyleForMessage(messageElement);
                this.applyStyleToMessage(messageElement, style);
            });
        } catch (error) {
            console.error('ChatStylist: Failed to apply styles:', error);
        }
    }

    saveCharacterStyle(characterId, style) {
        if (!(style instanceof StyleConfig)) {
            throw new Error('Invalid style configuration');
        }

        this.settings.setCharacterStyle(characterId, style);
        this.settings.save();
        
        this.applyStylesToChat();
        this.eventManager.emit(EventTypes.STYLE_APPLIED, {
            characterId,
            style
        });
    }

    resetStyles() {
        this.settings.reset();
        this.settings.save();
        this.applyStylesToChat();
        this.eventManager.emit(EventTypes.STYLE_RESET);
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
            this.eventManager.emit(EventTypes.STYLE_CHANGED, styles);

            return true;
        } catch (error) {
            console.error('Failed to import styles:', error);
            return false;
        }
    }
}
