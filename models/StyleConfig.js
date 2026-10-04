export class BaseStyle {
    constructor(data = {}) {
        this.data = { ...this.getDefaultData(), ...data };
    }

    toJSON() {
        return this.data;
    }

    getDefaultData() {
        throw new Error('Must be implemented by subclass');
    }
}

export class BubbleStyle extends BaseStyle {
    getDefaultData() {
        return {
            shape: 'round', // round, square, custom
            background: {
                type: 'solid', // solid, gradient
                color: '#ffffff',
                opacity: 1.0,
                gradient: {
                    type: 'linear', // linear, radial
                    colors: ['#ffffff', '#f0f0f0'],
                    positions: [0, 100],
                    angle: 90
                }
            },
            border: {
                color: '#e0e0e0',
                width: 1,
                style: 'solid' // solid, dashed, dotted
            },
            padding: {
                top: 15,
                right: 20,
                bottom: 15,
                left: 20
            }
        };
    }
}

export class TextStyle extends BaseStyle {
    getDefaultData() {
        return {
            mainColor: '#000000',
            italicColor: '#666666',
            boldColor: null, // null = keep the main text color
            underlineColor: null, // null = keep the theme's underline color
            quoteColor: '#3388ff',
            quoteEffect: {
                enabled: false,
                glowColor: '#3388ff',
                radius: 2
            }
        };
    }
}

export class StyleConfig {
    constructor(data = {}) {
        this.id = data.id || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));
        this.name = data.name || '';
        this.bubble = new BubbleStyle(data.bubble);
        this.text = new TextStyle(data.text);
    }

    static createDefault() {
        return new StyleConfig({
            name: 'Default Style'
        });
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            bubble: this.bubble.toJSON(),
            text: this.text.toJSON()
        };
    }
}
