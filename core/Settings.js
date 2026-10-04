import { StyleConfig } from "../models/StyleConfig.js";

const { extensionSettings, saveSettingsDebounced } = SillyTavern.getContext();

export class Settings {
    constructor() {
        this.defaultSettings = {
            enabled: true,
            defaultStyle: null, // null = no custom style, the chat keeps the theme's look
            userStyle: null,
            systemStyle: null,
            characterStyles: {},
            templates: {}
        };

        // Initialize settings (stored in SillyTavern's extension settings)
        this.settings = extensionSettings.chat_stylist || structuredClone(this.defaultSettings);
        extensionSettings.chat_stylist = this.settings;
    }

    get enabled() {
        return this.settings.enabled;
    }

    set enabled(value) {
        this.settings.enabled = value;
    }

    hasCustomStyle() {
        return !!this.settings.defaultStyle;
    }

    getDefaultStyle() {
        return this.settings.defaultStyle
            ? new StyleConfig(this.settings.defaultStyle)
            : StyleConfig.createDefault();
    }

    setDefaultStyle(style) {
        if (!(style instanceof StyleConfig)) {
            throw new Error('Invalid style configuration');
        }
        this.settings.defaultStyle = style.toJSON();
    }

    getUserStyle() {
        return this.settings.userStyle ? new StyleConfig(this.settings.userStyle) : this.getDefaultStyle();
    }

    getSystemStyle() {
        return this.settings.systemStyle ? new StyleConfig(this.settings.systemStyle) : this.getDefaultStyle();
    }

    getCharacterStyle(characterId) {
        return this.settings.characterStyles[characterId] 
            ? new StyleConfig(this.settings.characterStyles[characterId])
            : this.getDefaultStyle();
    }

    setCharacterStyle(characterId, style) {
        if (!(style instanceof StyleConfig)) {
            throw new Error('Invalid style configuration');
        }
        this.settings.characterStyles[characterId] = style.toJSON();
    }

    reset() {
        this.settings = structuredClone(this.defaultSettings);
        extensionSettings.chat_stylist = this.settings;
    }

    save() {
        extensionSettings.chat_stylist = this.settings;
        saveSettingsDebounced();
    }
}
