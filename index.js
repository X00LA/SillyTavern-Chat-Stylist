// Check required dependencies
if (typeof jQuery === 'undefined') {
    console.error('Chat Stylist: jQuery is required but not loaded');
    throw new Error('jQuery is required for Chat Stylist extension');
}

import { registerLocales } from './ui/i18n/index.js';
import { Settings } from "./core/Settings.js";
import { StyleManager } from "./core/StyleManager.js";
import { StylePanel } from "./ui/StylePanel.js";
import { StyleConfig } from "./models/StyleConfig.js";

const { t } = SillyTavern.getContext();

class ChatStylist {
    constructor() {
        try {
            this.settings = new Settings();
            this.styleManager = new StyleManager(this.settings);

            // Initialize UI directly
            this.initialize();
            console.debug('ChatStylist: Initialized successfully');
        } catch (error) {
            console.error('ChatStylist initialization failed:', error);
            throw error;
        }
    }

    initialize() {
        console.debug('ChatStylist: Initializing...');
        try {
            this.addSettingsUI();
            // The styles are a stylesheet, so they also cover messages rendered later
            this.styleManager.applyStylesToChat();
            console.debug('ChatStylist: Initialization complete');
        } catch (error) {
            console.error('ChatStylist: Initialization failed', error);
        }
    }

addSettingsUI() {
    const settingsHtml = `
        <div id="chat-stylist-settings">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>Chat Stylist</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div>
                </div>
                <div class="inline-drawer-content">
                    <div class="chat-stylist-controls">
                        <button id="chat-stylist-editor" class="menu_button">
                            <i class="fa-solid fa-palette"></i>
                            <span>${t`Style Editor`}</span>
                        </button>
                        <div class="flex-container">
                            <button id="chat-stylist-import" class="menu_button" title="${t`Import styles`}">
                                <i class="fa-solid fa-file-import"></i>
                            </button>
                            <button id="chat-stylist-export" class="menu_button" title="${t`Export styles`}">
                                <i class="fa-solid fa-file-export"></i>
                            </button>
                            <button id="chat-stylist-reset" class="menu_button" title="${t`Reset styles`}">
                                <i class="fa-solid fa-rotate-left"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    
    // Append the extension settings to the page's settings area
    $('#extensions_settings2').append(settingsHtml);

    // Bind floating panel events
    $('#chat-stylist-editor').on('click', () => {
        this.showStyleEditor(); // show panel on click
    });

    // Import, export, reset actions
    $('#chat-stylist-import').on('click', () => this.importStyles());
    $('#chat-stylist-export').on('click', () => this.exportStyles());
    $('#chat-stylist-reset').on('click', () => {
        if (confirm(t`Are you sure you want to reset all style settings?`)) {
            this.resetStyles();
        }
    });
}

    bindSettingsControls() {
        $('#chat-stylist-editor').on('click', () => {
            this.showStyleEditor();
        });

        $('#chat-stylist-import').on('click', () => {
            this.importStyles();
        });

        $('#chat-stylist-export').on('click', () => {
            this.exportStyles();
        });

        $('#chat-stylist-reset').on('click', () => {
            if (confirm(t`Are you sure you want to reset all style settings?`)) {
                this.resetStyles();
            }
        });
    }

    showStyleEditor() {
        if (this.styleEditor?.popup) return;

        // Build a fresh editor for every opening, the popup discards its content when closed
        this.styleEditor = new StylePanel({
            initialStyle: this.settings.getDefaultStyle().toJSON(),
            onSave: (style) => this.saveStyles(style),
            onReset: () => this.resetStyles(),
        });
        this.styleEditor.show();
    }

    /**
 * Make the panel draggable
 */
makeDraggable(element, dragHandle) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    dragHandle.style.cursor = 'move'; // set mouse cursor

    dragHandle.addEventListener('mousedown', (event) => {
        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
        const rect = element.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        document.body.style.userSelect = 'none'; // disable text selection
    });

    document.addEventListener('mousemove', (event) => {
        if (!isDragging) return;
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        element.style.left = `${initialX + deltaX}px`;
        element.style.top = `${initialY + deltaY}px`;
        element.style.transform = 'none'; // remove initial centering after moving
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = ''; // restore text selection
        }
    });
}

/**
 * Make the panel resizable
 */
makeResizable(element, resizeHandle) {
    let isResizing = false;
    let startWidth, startHeight, startX, startY;

    resizeHandle.addEventListener('mousedown', (event) => {
        isResizing = true;
        startWidth = element.offsetWidth;
        startHeight = element.offsetHeight;
        startX = event.clientX;
        startY = event.clientY;
        document.body.style.userSelect = 'none'; // disable text selection
    });

    document.addEventListener('mousemove', (event) => {
        if (!isResizing) return;
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        element.style.width = `${startWidth + deltaX}px`;
        element.style.height = `${startHeight + deltaY}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.userSelect = ''; // restore text selection
        }
    });
}
    
    importStyles() {
        console.log('Import clicked');
    }

    exportStyles() {
        console.log('Export clicked');
    }

    saveStyles(style) {
        this.styleManager.saveDefaultStyle(new StyleConfig(style));
        toastr.success(t`Style saved`);
    }

    resetStyles() {
        this.styleManager.resetStyles();
    }
}

// Initialize the extension
jQuery(async () => {
    try {
        registerLocales();
        window.chatStylist = new ChatStylist();
    } catch (error) {
        console.error('Failed to initialize Chat Stylist:', error);
    }
});
