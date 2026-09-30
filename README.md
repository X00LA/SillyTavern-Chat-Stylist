# Chat Stylist for SillyTavern

A lightweight extension for customizing the visual style of chat messages in SillyTavern. It lets you adjust bubble appearance, text colors, and other presentation details without editing core UI assets directly.

## Overview

This project is designed to run as a SillyTavern extension. It adds a settings panel and a floating style editor that can be used to:

- change chat bubble background, border, padding, and shape
- adjust main/italic/quote text colors
- apply quote glow effects
- preview changes in real time
- reset or persist styling configuration

The extension stores style data in browser settings and applies it to message elements when the chat updates.

## Features

- Bubble styling editor
  - solid or gradient backgrounds
  - border width, color, and style
  - padding and rounded corners
  - custom border radius support
- Text styling editor
  - primary text color
  - italic text color
  - quote color and glow effect
- Per-context styling support
  - user messages
  - system messages
  - character-specific messages
- Live preview panel
- drag-and-resize editor window
- settings reset support
- JSON-style export/import support in the core manager logic

## Project structure

```text
.
├── core/
│   ├── EventManager.js      # event bus for style updates and state changes
│   ├── Settings.js          # persistence and style retrieval logic
│   └── StyleManager.js      # applies styles to messages and handles import/export
├── models/
│   └── StyleConfig.js       # bubble/text style definitions
├── ui/
│   ├── StylePanel.js        # floating style editor container
│   ├── components/
│   ├── panels/
│   └── styles/
├── utils/
│   ├── ColorUtils.js
│   ├── DOMUtils.js
│   └── StyleUtils.js
├── index.js                 # extension bootstrap and UI entry point
├── manifest.json            # SillyTavern extension metadata
├── style.css                # extension CSS and editor styling
└── README.md                # project documentation
