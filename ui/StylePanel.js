import { TabControl } from "./components/TabControl.js";
import { BubblePanel } from "./panels/BubblePanel.js";
import { TextPanel } from "./panels/TextPanel.js";
import { DOMUtils } from "../utils/DOMUtils.js";
import { StyleConfig } from "../models/StyleConfig.js";
import { StyleManager } from "../core/StyleManager.js";

const { t, Popup, POPUP_TYPE } = SillyTavern.getContext();

export class StylePanel {
    constructor(options = {}) {
        this.options = {
            onSave: options.onSave || null,
            onReset: options.onReset || null,
            onClose: options.onClose || null,
            initialStyle: options.initialStyle || null,
        };

        this.element = null;
        this.popup = null;
        this.tabControl = null;
        this.bubblePanel = null;
        this.textPanel = null;
        this.currentStyle = structuredClone(this.options.initialStyle) || StyleConfig.createDefault().toJSON();
    }

    createElement() {
        const panel = DOMUtils.createElement("div", "chat-stylist-editor");

        // Add title bar
        const header = this.createHeader();
        panel.appendChild(header);

        // Add tab controller
        this.tabControl = new TabControl({
            tabs: [
                { id: "bubble", label: t`Bubble Style`, icon: "fa-solid fa-message" },
                { id: "text", label: t`Text Style`, icon: "fa-solid fa-font" },
            ],
            onTabChanged: (tabId) => this.handleTabChange(tabId),
        });
        panel.appendChild(this.tabControl.createElement());

        // Create bubble style panel
        this.bubblePanel = new BubblePanel({
            initialStyle: this.currentStyle.bubble,
            onChange: () => this.handleStyleChange(),
        });

        // Create text style panel
        this.textPanel = new TextPanel({
            initialStyle: this.currentStyle.text,
            onChange: () => this.handleStyleChange(),
        });

        // Add panel content
        this.tabControl.setTabContent("bubble", this.bubblePanel.createElement());
        this.tabControl.setTabContent("text", this.textPanel.createElement());

        // Add footer preview
        const footer = this.createFooter();
        panel.appendChild(footer);

        this.element = panel;
        this.updatePreview();
        return panel;
    }

    createHeader() {
        const header = DOMUtils.createElement("div", "editor-header");
        const title = DOMUtils.createElement("span", "editor-title");
        title.textContent = t`Style Settings Panel`;

        const buttonContainer = DOMUtils.createElement("div", "editor-buttons");

        // Top buttons (the popup provides its own close button)
        const saveButton = DOMUtils.createButton("", this.handleSave.bind(this), "action-button save");
        saveButton.innerHTML = `<i class="fa-solid fa-save"></i> ${t`Save`}`;
        const resetButton = DOMUtils.createButton("", this.reset.bind(this), "action-button reset");
        resetButton.innerHTML = `<i class="fa-solid fa-rotate-left"></i> ${t`Reset`}`;

        buttonContainer.append(saveButton, resetButton);
        header.append(title, buttonContainer);

        return header;
    }

    createFooter() {
        const footer = DOMUtils.createElement("div", "editor-footer");

        const preview = DOMUtils.createElement("div", "style-preview");
        preview.innerHTML = `
            <div class="preview-message">
                <div class="preview-bubble">
                    ${t`This is preview text`}
                    <em>${t`This is italic text`}</em>
                    <strong>${t`This is bold text`}</strong>
                    <u>${t`This is underlined text`}</u>
                    <q>${t`This is quoted text`}</q>
                </div>
            </div>
        `;

        footer.appendChild(preview);
        return footer;
    }

    handleStyleChange() {
        this.currentStyle = this.getCurrentStyle();
        this.updatePreview();
    }

    handleTabChange(tabId) {
        this.updatePreview();
    }

    /**
     * Reads the complete style from the panels. Values without a control (e.g. id, shape) are kept.
     */
    getCurrentStyle() {
        return {
            ...this.currentStyle,
            bubble: { ...this.currentStyle.bubble, ...this.bubblePanel.getCurrentStyle() },
            text: { ...this.currentStyle.text, ...this.textPanel.getCurrentStyle() },
        };
    }

    handleSave() {
        this.options.onSave && this.options.onSave(this.getCurrentStyle());
    }

    reset() {
        if (!confirm(t`Are you sure you want to reset all style settings?`)) return;
        this.options.onReset && this.options.onReset();

        // Show the default values in the editor again
        this.currentStyle = StyleConfig.createDefault().toJSON();
        const oldElement = this.element;
        oldElement.replaceWith(this.createElement());
    }

    updatePreview() {
        const previewBubble = this.element.querySelector(".preview-bubble");
        if (!previewBubble) return;

        // Same CSS declarations as in the chat, so the preview matches the result
        const declarations = StyleManager.getDeclarations(new StyleConfig(this.currentStyle));
        const targets = {
            bubble: [previewBubble],
            text: [previewBubble],
            italic: [...previewBubble.querySelectorAll("em")],
            bold: [...previewBubble.querySelectorAll("strong")],
            underline: [...previewBubble.querySelectorAll("u")],
            quote: [...previewBubble.querySelectorAll("q")],
        };

        // Clear old inline styles first, so removed properties (e.g. a disabled glow) disappear
        for (const element of [previewBubble, ...previewBubble.querySelectorAll("em, strong, u, q")]) {
            element.removeAttribute("style");
        }
        for (const [target, properties] of Object.entries(declarations)) {
            for (const element of targets[target]) {
                for (const [name, value] of Object.entries(properties)) {
                    element.style.setProperty(name, value);
                }
            }
        }
    }

    show() {
        if (this.popup) return;

        // A modal SillyTavern popup blocks the page behind it and removes its content from the DOM when closed
        this.popup = new Popup(this.createElement(), POPUP_TYPE.DISPLAY, "", {
            wider: true,
            leftAlign: true,
            onClose: () => {
                this.popup = null;
                this.options.onClose && this.options.onClose();
            },
        });
        this.popup.show();
    }

    hide() {
        this.popup?.completeCancelled();
    }
}
