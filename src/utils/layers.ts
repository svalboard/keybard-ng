import { KEYMAP } from "../constants/keygen";
import type { KeyboardInfo } from "../types/vial.types";
import { getKeyContents } from "./keys";
import { keyService } from "../services/key.service";
// Convert HSV to RGB for CSS color
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
        console.log("Key contents:", keyContents);
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
