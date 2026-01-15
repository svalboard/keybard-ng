import { KEYMAP } from "../constants/keygen";
import { keyService } from "../services/key.service";
import type { KeyboardInfo } from "../types/vial.types";
import { getKeyContents } from "./keys";
// Convert HSV to RGB for CSS color

export const colorsToHsv = {
    "green": { hue: 85, sat: 255, val: 255 },
    "blue": { hue: 140, sat: 255, val: 255 },
    "purple": { hue: 200, sat: 255, val: 255 },
    "cyan": { hue: 106, sat: 255, val: 255 },
    "pink": { hue: 234, sat: 255, val: 255 },
    "orange": { hue: 16, sat: 255, val: 94 },
    "yellow": { hue: 43, sat: 255, val: 255 },
    "grey": { hue: 180, sat: 100, val: 50 },
    "red": { hue: 0, sat: 255, val: 255 },
    "brown": { hue: 0, sat: 255, val: 255 },
    "white": { hue: 0, sat: 0, val: 255 },
}

export const hsvToRgb = (h: number, s: number, v: number): string => {
    // HSV values are typically 0-255, normalize them
    h = (h / 255) * 360; // Convert to degrees
    s = s / 255; // Convert to 0-1
    v = v / 255; // Convert to 0-1

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0,
        g = 0,
        b = 0;

    if (h >= 0 && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (h >= 60 && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (h >= 180 && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (h >= 240 && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (h >= 300 && h < 360) {
        r = c;
        g = 0;
        b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `rgb(${r}, ${g}, ${b})`;
};

// Convert RGB hex color to HSV for comparison
export const rgbToHsv = (hex: string): { hue: number; sat: number; val: number } => {
    // Remove # if present
    const cleanHex = hex.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    
    // Find max, min, and delta
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    // Calculate value
    const val = max * 255;
    
    // Calculate saturation
    const sat = max === 0 ? 0 : (delta / max) * 255;
    
    // Calculate hue
    let hue = 0;
    if (delta !== 0) {
        if (max === r) {
            hue = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
        } else if (max === g) {
            hue = ((b - r) / delta + 2) * 60;
        } else {
            hue = ((r - g) / delta + 4) * 60;
        }
    }
    
    // Convert to 0-255 range
    return {
        hue: Math.round((hue / 360) * 255),
        sat: Math.round(sat),
        val: Math.round(val)
    };
};

// Calculate weighted distance between two HSV colors
export const calculateHsvDistance = (hsv1: {h: number, s: number, v: number}, hsv2: {h: number, s: number, v: number}): number => {
    const hueWeight = 2.0; // Hue is most perceptually important
    const satWeight = 1.0;
    const valWeight = 1.0;
    
    // Handle hue wraparound (0-255 circular)
    let hueDiff = Math.abs(hsv1.h - hsv2.h);
    if (hueDiff > 127.5) { // More than half the circle
        hueDiff = 255 - hueDiff;
    }
    
    const satDiff = Math.abs(hsv1.s - hsv2.s);
    const valDiff = Math.abs(hsv1.v - hsv2.v);
    
    return Math.sqrt(
        Math.pow(hueWeight * hueDiff, 2) +
        Math.pow(satWeight * satDiff, 2) +
        Math.pow(valWeight * valDiff, 2)
    );
};

// Threshold for color synchronization (tune based on testing)
const COLOR_SYNC_THRESHOLD = 30;

// Check if color should be synced based on threshold
export const shouldSyncColor = (physicalHsv: {h: number, s: number, v: number}, currentFrontendColor: string): boolean => {
    const currentHsv = colorsToHsv[currentFrontendColor as keyof typeof colorsToHsv];
    if (!currentHsv) return true; // Always sync if current color not in mapping
    
    const distance = calculateHsvDistance(physicalHsv, {
        h: currentHsv.hue,
        s: currentHsv.sat,
        v: currentHsv.val
    });
    return distance > COLOR_SYNC_THRESHOLD;
};

// Find the closest frontend color for a given HSV color
export const findClosestFrontendColor = (physicalHsv: {h: number, s: number, v: number}): string => {
    let closestColor = "green"; // Default fallback
    let minDistance = Infinity;
    
    for (const [colorName, colorHsv] of Object.entries(colorsToHsv)) {
        const distance = calculateHsvDistance(physicalHsv, {
            h: colorHsv.hue,
            s: colorHsv.sat,
            v: colorHsv.val
        });
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = colorName;
        }
    }
    
    return closestColor;
};

// Get layer color for current layer
export const getLayerColor = (keyboard: KeyboardInfo, layerIndex: number): string => {
    if (keyboard.layer_colors && keyboard.layer_colors[layerIndex]) {
        const { hue, sat, val } = keyboard.layer_colors[layerIndex];
        return hsvToRgb(hue, sat, val);
    }
    return "#888"; // Default gray color
};

// Get label for a keycode
export const getKeyLabel = (
    kbInfo: KeyboardInfo,
    keycode: number
): {
    label: string;
    keyContents: ReturnType<typeof getKeyContents>;
} => {
    // First get the string representation (e.g., "KC_C" or "LCA(KC_NO)")
    const keyString = keyService.stringify(keycode);
    const keyContents = getKeyContents(kbInfo, keyString);

    // If it's a simple key (no modifiers), look it up in KEYMAP
    if (KEYMAP[keyString]) {
        return {
            label: KEYMAP[keyString].str || keyString,
            keyContents,
        };
    }

    // For modifier combinations, try to parse and get the base key
    // Check if it's a modifier combination like "LCA(KC_NO)"

    // Fallback to the string representation
    const modifierMatch = keyString.match(/^([A-Z]+)\((KC_[A-Z0-9_]+)\)$/);
    if (modifierMatch) {
        // console.log("Key contents:", keyContents);
    }
    return {
        label: keyString,
        keyContents,
    };
};

// Get keycode name for data attribute
export const getKeycodeName = (keycode: number): string => {
    return keyService.stringify(keycode);
};
