# Chat Stylist for SillyTavern

Customize the look of chat messages in SillyTavern: bubble background, border and padding, plus the colors of normal, italic, bold, underlined and quoted text. The style applies to all chat messages without editing your theme.

## Installation

1. Open the Extensions panel in SillyTavern and click **Install extension**.
2. Enter `https://github.com/X00LA/SillyTavern-Chat-Stylist` and confirm.

## Usage

1. Open the Extensions panel and expand **Chat Stylist**.
2. Click **Style Editor**. The editor opens as a popup with a live preview.
3. Adjust the style in the **Bubble Style** and **Text Style** tabs.
4. Click **Save** to apply the style to the chat.

**Reset** (in the editor, or the ↺ button in the Extensions panel) removes your style, and the chat returns to your theme's look.

## Options

**Bubble Style**

- Background: solid color, or a linear gradient with start color, end color and angle
- Border: width, color and style (solid, dashed, dotted)
- Padding: top, right, bottom, left

Colors can be transparent, using the alpha channel of the color picker. Bubbles have rounded corners (10px).

**Text Style**

- Colors for main, italic, bold, underlined and quoted text. Bold and underlined text keep their normal color until you pick one.
- Glow effect for quoted text, with color and intensity

## How it works

- The style is applied through a single stylesheet, so newly rendered messages are styled automatically.
- Without a saved style, the chat keeps your theme's look.
- Settings are stored in SillyTavern's settings (`extension_settings.chat_stylist` in `settings.json`).
- The interface is available in English and German and follows SillyTavern's interface language.

## Limitations

- One style applies to all messages. Separate styles for user, system or individual characters are prepared in the settings but not available yet.
- The import and export buttons in the Extensions panel have no function yet.

## Project structure

```text
.
├── core/
│   ├── Settings.js          # stores the style in SillyTavern's extension settings
│   └── StyleManager.js      # turns a style into CSS and applies it to the chat
├── models/
│   └── StyleConfig.js       # bubble and text style definitions with defaults
├── ui/
│   ├── StylePanel.js        # style editor popup with tabs and preview
│   ├── panels/              # Bubble Style and Text Style tabs
│   ├── components/          # color picker and tab control
│   ├── i18n/                # German translation
│   └── styles/              # editor CSS
├── utils/                   # color, DOM and CSS helpers
├── index.js                 # entry point and Extensions panel entry
├── manifest.json            # SillyTavern extension metadata
└── style.css                # extension CSS
```

## Credits

Based on the original extension by 既殊.
