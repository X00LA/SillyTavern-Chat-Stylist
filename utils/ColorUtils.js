export class ColorUtils {
    static hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Returns a CSS color. Hex colors get the opacity applied, other formats (e.g. rgba from the color picker) already carry their alpha.
     */
    static toCssColor(color, opacity = 1) {
        return /^#[0-9a-f]{6}$/i.test(color) ? this.hexToRgba(color, opacity) : color;
    }

    static rgbaToHex(rgba) {
        const parts = rgba.match(/[\d.]+/g);
        if (!parts || parts.length < 3) return '#000000';
        
        const r = parseInt(parts[0]);
        const g = parseInt(parts[1]);
        const b = parseInt(parts[2]);
        
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    static createGradient(type, colors, positions, angle = 90) {
        const stops = colors.map((color, i) => `${color} ${positions[i]}%`).join(', ');
        return type === 'linear'
            ? `linear-gradient(${angle}deg, ${stops})`
            : `radial-gradient(circle, ${stops})`;
    }

    static getContrastColor(backgroundColor) {
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }
}
