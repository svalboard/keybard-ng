// Type definitions for Vial keyboard configuration system

export interface KeyboardInfo {
    via_proto?: number;
    vial_proto?: number;
    kbid?: string;
    payload?: KeyboardPayload;
    rows: number;
    cols: number;
    layers?: number;
    custom_keycodes?: CustomKeycode[];
    keymap?: number[][];
    macros?: MacroEntry[];
    macro_count?: number;
    macros_size?: number;
    combos?: ComboEntry[];
    tapdances?: TapdanceEntry[];
    key_overrides?: KeyOverrideEntry[];
    settings?: Record<number, number>;
    tapdance_count?: number;
    combo_count?: number;
    key_override_count?: number;

    // Svalboard-specific
    sval_proto?: number;
    sval_firmware?: string;
    layer_colors?: Array<{ hue: number; sat: number; val: number }>;
    cosmetic?: {
        layer?: Record<string, string>;
        layer_colors?: Record<string, string>;
        macros?: Record<string, string>;
    };
    keylayout?: Record<string, any>; // Using any for now to match KLE output structure
}

export interface KeyboardPayload {
    matrix: {
        rows: number;
        cols: number;
    };
    customKeycodes?: CustomKeycode[];
    layouts?: Record<string, KeyLayout>;
    lighting?: unknown;
}

export interface KeyLayout {
    col: number;
    color: string;
    decal: boolean;
    ghost: boolean;
    h: number;
    height2: number;
    labels: string[];
    nub: boolean;
    profile: string;
    rotation_angle: number;
    rotation_x: number;
    rotation_y: number;
    row: number;
    sb: string;
    sm: string;
    st: string;
    stepped: boolean;
    text: string;
    textColor: string;
    textSize: number[];
    align?: number;
    matrix?: number[];
    w: number;
    width2: number;
    x: number;
    x2: number;
    y: number;
    y2: number;
}

export interface CustomKeycode {
    name: string;
    title: string;
    shortName: string;
}

export interface MacroEntry {
    mid: number;
    actions: MacroAction[];
}

export type MacroAction = [string, string | number];

export interface ComboEntry {
    cmbid: number;
    keys: string[];
    output: string;
}


export interface TapdanceEntry {
    idx: number; // Index in the list
    tap: string;
    hold: string;
    doubletap: string;
    taphold: string;
    tapping_term: number;
}

export interface KeyOverrideEntry {
    koid: number;
    trigger: string;
    replacement: string;
    layers: number;
    trigger_mods: number;
    negative_mod_mask: number;
    suppressed_mods: number;
    options: number;
}


// Removed: QMKSettings interface (conflicted with qmk.d.ts)
// Keyboard settings values are now stored as Record<number, number> in KeyboardInfo.settings

export interface USBSendOptions {
    uint8?: boolean;
    uint16?: boolean;
    uint32?: boolean;
    index?: number;
    unpack?: string;
    bigendian?: boolean;
    slice?: number;
    bytes?: number;
}

export interface VialAPI {
    what: string;
    updateKey(layer: number, row: number, col: number, keymask: number): Promise<void>;
    updateMacros(kbinfo: KeyboardInfo): Promise<void>;
    updateTapdance(kbinfo: KeyboardInfo, tdid: number): Promise<void>;
    updateCombo(kbinfo: KeyboardInfo, cmbid: number): Promise<void>;
    updateKeyoverride(kbinfo: KeyboardInfo, koid: number): Promise<void>;
    updateQMKSetting(kbinfo: KeyboardInfo, qfield: string): Promise<void>;
}

export interface KeyContent {
    type?: string;
    str?: string;
    title?: string;
    top?: string;
    layertext?: string;
    tdid?: number;
    modids?: number;
    mods?: string;
    [key: string]: any; // Allow other properties for now until fully typed
}
