// Convert hex color to RGB array (supports formats like "#RRGGBB" or "RRGGBB")
const hexToRgb = (hex) => {
    if (!hex || typeof hex !== 'string') {
        throw new Error('Invalid hex color: must be a string');
    }

    // Remove '#' if present
    const color = hex.startsWith('#') ? hex.slice(1) : hex;

    // Ensure it's a valid 6-digit hex
    if (!/^[0-9A-Fa-f]{6}$/.test(color)) {
        throw new Error('Invalid hex color: must be 6 hexadecimal digits (e.g., "#RRGGBB")');
    }

    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);

    return [r, g, b];
};

// Get black or white depending on background brightness
export const getContrastColor = (hex) => {
    const [r, g, b] = hexToRgb(hex); // Assuming hexToRgb is defined elsewhere
    // Calculate perceived brightness (weighted for human eye sensitivity)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    // Use black text on light colors (brightness > 160), white on dark
    return brightness > 160 ? '#000000' : '#ffffff';
};

// Generate color shades (lighter to darker)
export const generateShades = (baseColor, count) => {
    const [r, g, b] = hexToRgb(baseColor);
    const shades = [];

    for (let i = 0; i < count; i++) {
        const factor = 1 - (0.7 * i) / (count - 1); // 1.0 → 0.3
        shades.push(`rgba(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)}, 1)`);
    }

    return shades;
};