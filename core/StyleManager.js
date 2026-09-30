import { TabControl } from "./components/TabControl.js";
import { BubblePanel } from "./panels/BubblePanel.js";
import { TextPanel } from "./panels/TextPanel.js";
import { DOMUtils } from "../utils/DOMUtils.js";

export class StylePanel {
    constructor(options = {}) {
        this.options = {
            onSave: options.onSave || null,
            onReset: options.onReset || null,
            onClose: options.onClose || null,
            initialStyle: options.initialStyle || null,
        };

        this.element = null;
        this.tabControl = null;
        this.bubblePanel = null;
        this.textPanel = null;
        this.currentStyle = structuredClone(this.options.initialStyle) || {};
    }

    createElement() {
        const panel = DOMUtils.createElement("div", "chat-stylist-editor");

        // Add title bar
        const header = this.createHeader();
        panel.appendChild(header);

        // Add tab controller
        this.tabControl = new TabControl({
            tabs: [
                { id: "bubble", label: "Bubble Style", icon: "fa-solid fa-message" },
                { id: "text", label: "Text Style", icon: "fa-solid fa-font" },
            ],
            onTabChanged: (tabId) => this.handleTabChange(tabId),
        });
        panel.appendChild(this.tabControl.createElement());

        // Create bubble style panel
        this.bubblePanel = new BubblePanel({
            initialStyle: this.currentStyle.bubble,
            onChange: (change) => this.handleStyleChange("bubble", change),
        });

        // Create text style panel
        this.textPanel = new TextPanel({
            initialStyle: this.currentStyle.text,
            onChange: (change) => this.handleStyleChange("text", change),
        });

        // Add panel content
        this.tabControl.setTabContent("bubble", this.bubblePanel.createElement());
        this.tabControl.setTabContent("text", this.textPanel.createElement());

        // Add footer preview and buttons
        const footer = this.createFooter();
        panel.appendChild(footer);

        // Add drag and resize functionality
        this.makeDraggable(panel, header);
        panel.style.resize = "both";

        this.element = panel;
        return panel;
    }

    createHeader() {
        const header = DOMUtils.createElement("div", "editor-header");
        const title = DOMUtils.createElement("span", "editor-title");
        title.textContent = "Style Settings Panel";

        const buttonContainer = DOMUtils.createElement("div", "editor-buttons");

        // Top buttons
        const saveButton = DOMUtils.createButton("", this.handleSave.bind(this), "action-button save");
        saveButton.innerHTML = `<i class="fa-solid fa-save"></i> Save`;
        const resetButton = DOMUtils.createButton("", this.reset.bind(this), "action-button reset");
        resetButton.innerHTML = `<i class="fa-solid fa-rotate-left"></i> Reset`;
        const minimizeButton = DOMUtils.createButton("", this.handleMinimize.bind(this), "action-button minimize");
        minimizeButton.innerHTML = `<i class="fa-solid fa-window-minimize"></i> Minimize`;
        const closeButton = DOMUtils.createButton("", this.handleClose.bind(this), "action-button close");
        closeButton.innerHTML = `<i class="fa-solid fa-times"></i> Close`;

        buttonContainer.append(saveButton, resetButton, minimizeButton, closeButton);
        header.append(title, buttonContainer);

        return header;
    }

    createFooter() {
        const footer = DOMUtils.createElement("div", "editor-footer");

        const preview = DOMUtils.createElement("div", "style-preview");
        preview.innerHTML = `
            <div class="preview-message">
                <div class="preview-bubble">
                    This is preview text
                    <em>This is italic text</em>
                    <q>This is quoted text</q>
                </div>
            </div>
        `;

        footer.appendChild(preview);
        return footer;
    }

    makeDraggable(panel, handle) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        handle.addEventListener("mousedown", (e) => {
            isDragging = true;
            offsetX = e.clientX - panel.offsetLeft;
            offsetY = e.clientY - panel.offsetTop;

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });

        const onMouseMove = (e) => {
            if (isDragging) {
                panel.style.left = `${e.clientX - offsetX}px`;
                panel.style.top = `${e.clientY - offsetY}px`;
            }
        };

        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
    }

    handleStyleChange(type, change) {
        if (type === "bubble") {
            this.currentStyle.bubble = {
                ...this.currentStyle.bubble,
                ...change,
            };
        } else if (type === "text") {
            this.currentStyle.text = {
                ...this.currentStyle.text,
                ...change,
            };
        }
        this.updatePreview();
    }

    handleTabChange(tabId) {
        this.updatePreview();
    }

    handleSave() {
        this.options.onSave && this.options.onSave(this.currentStyle);
    }

    reset() {
        this.options.onReset && this.options.onReset();
    }

    handleMinimize() {
        const content = this.element.querySelector(".editor-footer");
        content.style.display = content.style.display === "none" ? "block" : "none";
    }

    handleClose() {
        this.options.onClose && this.options.onClose();
        this.element.remove();
    }

    updatePreview() {
        const previewBubble = this.element.querySelector(".preview-bubble");
        if (!previewBubble) return;

        // Update preview styles
        const { bubble, text } = this.currentStyle;

        if (bubble.background.type === "solid") {
            previewBubble.style.backgroundColor = bubble.background.color;
            previewBubble.style.opacity = bubble.background.opacity;
        } else {
            // TODO: update gradient preview
        }

        previewBubble.style.color = text.mainColor;
    }

    show() {
        if (!this.element) {
            document.body.appendChild(this.createElement());
        }
        this.element.classList.add("show");
    }

    hide() {
        if (this.element) {
            this.element.classList.remove("show");
        }
    }
}
