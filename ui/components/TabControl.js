import { DOMUtils } from "../../utils/DOMUtils.js";

export class TabControl {
    constructor(options = {}) {
        this.options = {
            tabs: options.tabs || [], // [{id, label, icon}]
            onTabChanged: options.onTabChanged || null,
            activeTab: options.activeTab || null
        };

        this.element = null;
        this.activeTab = this.options.activeTab || (this.options.tabs[0]?.id);
    }

createElement() {
    const container = DOMUtils.createElement('div', 'tab-container');

    // Create tab buttons
    const buttonsContainer = DOMUtils.createElement('div', 'tab-buttons');
    this.options.tabs.forEach(tab => {
        const button = DOMUtils.createElement('button', 'tab-button');
        if (tab.id === this.activeTab) {
            button.classList.add('active');
        }

        if (tab.icon) {
            const icon = DOMUtils.createElement('i', tab.icon);
            button.appendChild(icon);
        }

        const label = document.createTextNode(tab.label);
        button.appendChild(label);
        button.dataset.tabId = tab.id;

        button.addEventListener('click', () => this.switchTab(tab.id));
        buttonsContainer.appendChild(button);
    });

    // Create content containers
    const contentContainer = DOMUtils.createElement('div', 'tab-content-container');
    this.options.tabs.forEach(tab => {
        const content = DOMUtils.createElement('div', 'tab-content');
        content.dataset.tabId = tab.id; // Make sure the data-tab-id attribute is set
        if (tab.id === this.activeTab) {
            content.classList.add('active');
        }
        contentContainer.appendChild(content);
    });

    container.appendChild(buttonsContainer);
    container.appendChild(contentContainer);

    this.element = container;

    return container;
}

    switchTab(tabId) {
        if(tabId === this.activeTab) return;

        const buttons = this.element.querySelectorAll('.tab-button');
        buttons.forEach(button => {
            button.classList.toggle('active', button.dataset.tabId === tabId);
        });

        const contents = this.element.querySelectorAll('.tab-content');
        contents.forEach(content => {
            content.classList.toggle('active', content.dataset.tabId === tabId);
        });

        this.activeTab = tabId;
        if(this.options.onTabChanged) {
            this.options.onTabChanged(tabId);
        }
    }

    getContentContainer(tabId) {
        if (!this.element) {
            console.error('TabControl element not initialized');
            return null;
        }
        return this.element.querySelector(`.tab-content[data-tab-id="${tabId}"]`);
    }

    setTabContent(tabId, content) {
        const container = this.getContentContainer(tabId);

        if (!container) {
            console.error(`Tab content container not found for tabId: ${tabId}`);
            return;
        }

        // Clear existing content
        container.innerHTML = '';

        // Add new content
        if (typeof content === 'string') {
            container.innerHTML = content;
        } else if (content instanceof Node) {
            container.appendChild(content);
        }
}
}
