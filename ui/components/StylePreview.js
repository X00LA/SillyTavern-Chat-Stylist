import { StyleManager } from "../../core/StyleManager.js";
import { StylePanel } from "../components/StylePanel.js";
import { DOMUtils } from "../../utils/DOMUtils.js";
import { BubblePanel } from "../panels/BubblePanel.js";
import { TextPanel } from "../panels/TextPanel.js";
import { TabControl } from "./TabControl.js";

const { t } = SillyTavern.getContext();

export class StylePanel {
    constructor(options = {}) {
        this.options = {
            onSave: options.onSave || null,
            onClose: options.onClose || null,
            initialStyle: options.initialStyle || null
        };

        this.element = null;
        this.tabControl = null;
        this.bubblePanel = null;
        this.textPanel = null;
        this.currentStyle = structuredClone(this.options.initialStyle) || {};
    }

    createElement() {
        const panel = DOMUtils.createElement('div', 'chat-stylist-editor');

        // Character selection
        const characterSelect = this.createCharacterSelect();
        panel.appendChild(characterSelect);

        // Create tab control
        this.tabControl = new TabControl({
            tabs: [
                {id: 'bubble', label: t`Bubble Style`, icon: 'fa-solid fa-message'},
                {id: 'text', label: t`Text Style`, icon: 'fa-solid fa-font'}
            ],
            onTabChanged: (tabId) => this.handleTabChange(tabId)
        });
        panel.appendChild(this.tabControl.createElement());

        // Create bubble style panel
        this.bubblePanel = new BubblePanel({
            initialStyle: this.currentStyle.bubble,
            onChange: (change) => this.handleStyleChange('bubble', change)
        });

        // Create text style panel
        this.textPanel = new TextPanel({
            initialStyle: this.currentStyle.text,
            onChange: (change) => this.handleStyleChange('text', change)
        });

        // Add panel content
        this.tabControl.setTabContent('bubble', this.bubblePanel.createElement());
        this.tabControl.setTabContent('text', this.textPanel.createElement());

        // Footer with preview and buttons
        const footer = this.createFooter();
        panel.appendChild(footer);

        // Add drag functionality
        this.makeDraggable(panel);

        this.element = panel;
        return panel;
    }

    createCharacterSelect() {
        const container = DOMUtils.createElement('div', 'character-select-container');

        const select = DOMUtils.createElement('select', 'character-select');
        select.innerHTML = `
            <option value="default">${t`Default style`}</option>
            <option value="user">${t`User style`}</option>
            <option value="system">${t`System style`}</option>
            <optgroup label="${t`Character styles`}" id="characterStyleOptions">
            </optgroup>
        `;

        // Tool button group
        const toolButtons = DOMUtils.createElement('div', 'tool-buttons');
        toolButtons.innerHTML = `
            <button title="${t`Import styles`}" class="tool-button">
                <i class="fa-solid fa-file-import"></i>
            </button>
            <button title="${t`Export styles`}" class="tool-button">
                <i class="fa-solid fa-file-export"></i>
            </button>
            <button title="${t`Save as template`}" class="tool-button">
                <i class="fa-solid fa-save"></i>
            </button>
        `;

        container.append(select, toolButtons);
        return container;
    }

    createFooter() {
        const footer = DOMUtils.createElement('div', 'editor-footer');

        // Preview area
        const preview = DOMUtils.createElement('div', 'style-preview');
        preview.innerHTML = `
            <div class="preview-message">
                <div class="preview-bubble">
                    ${t`This is preview text`}
                    <em>${t`This is italic text`}</em>
                    <q>${t`This is quoted text`}</q>
                </div>
            </div>
        `;

        // Action buttons
        const actions = DOMUtils.createElement('div', 'editor-actions');
        actions.innerHTML = `
            <button class="action-button cancel">${t`Cancel`}</button>
            <button class="action-button apply">${t`Apply`}</button>
            <button class="action-button save primary">${t`Save`}</button>
        `;

        // Bind events
        actions.querySelector('.cancel').addEventListener('click', () => this.handleClose());
        actions.querySelector('.apply').addEventListener('click', () => this.handleApply());
        actions.querySelector('.save').addEventListener('click', () => this.handleSave());

        footer.append(preview, actions);
        return footer;
    }

    makeDraggable(panel) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        const dragStart = (e) => {
            if (e.target.closest('.editor-actions, .tool-buttons, select, button')) return;
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === panel || e.target.closest('.character-select-container')) {
                isDragging = true;
                panel.classList.add('dragging');
            }
        };

        const dragEnd = () => {
            isDragging = false;
            panel.classList.remove('dragging');
        };

        const drag = (e) => {
            if (!isDragging) return;

            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            panel.style.transform = `translate(${currentX}px, ${currentY}px)`;
        };

        panel.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
    }

    // Event handlers
    handleTabChange(tabId) {
        this.updatePreview();
    }

    handleStyleChange(type, change) {
        if (type === 'bubble') {
            this.currentStyle.bubble = {
                ...this.currentStyle.bubble,
                ...change
            };
        } else if (type === 'text') {
            this.currentStyle.text = {
                ...this.currentStyle.text,
                ...change.value
            };
        }
        this.updatePreview();
    }

    handleClose() {
        if (this.options.onClose) {
            this.options.onClose();
        }
    }

    handleApply() {
        this.updatePreview();
        // Apply the style temporarily without saving it
    }

    handleSave() {
        if (this.options.onSave) {
            this.options.onSave(this.getCurrentStyle());
        }
    }

    getCurrentStyle() {
        return {
            bubble: this.bubblePanel.getCurrentStyle(),
            text: this.textPanel.getCurrentStyle()
        };
    }

    updatePreview() {
        const style = this.getCurrentStyle();
        const previewBubble = this.element.querySelector('.preview-bubble');
        if (!previewBubble) return;

        // Apply preview style
        const { bubble, text } = style;

        // Bubble style
        if (bubble.background.type === 'solid') {
            previewBubble.style.background = bubble.background.color;
            previewBubble.style.opacity = bubble.background.opacity;
        } else {
            // Gradient background
            // ...
        }

        previewBubble.style.border = `${bubble.border.width}px ${bubble.border.style} ${bubble.border.color}`;
        previewBubble.style.padding = `${bubble.padding.top}px ${bubble.padding.right}px ${bubble.padding.bottom}px ${bubble.padding.left}px`;

        // Text style
        previewBubble.style.color = text.mainColor;
        
        const italicText = previewBubble.querySelector('em');
        if (italicText) {
            italicText.style.color = text.italicColor;
        }

        const quoteText = previewBubble.querySelector('q');
        if (quoteText) {
            quoteText.style.color = text.quoteColor;
            if (text.quoteEffect.enabled) {
                quoteText.style.textShadow = `0 0 ${text.quoteEffect.radius}px ${text.quoteEffect.glowColor}`;
            } else {
                quoteText.style.textShadow = 'none';
            }
        }
    }

    show() {
        if (!this.element) {
            document.body.appendChild(this.createElement());
        }
        this.element.classList.add('show');
        this.updatePreview();
    }

    hide() {
        if (this.element) {
            this.element.classList.remove('show');
        }
    }
}
