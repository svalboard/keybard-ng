// Svalboard keyboard layout configuration
// Based on the layout from pages/js/svalboard.js

export interface KeyLayout {
    row: number;
    col: number;
    x: number;
    y: number;
    w: number;
    h: number;
    color?: string;
    text?: string;
}

// Unit size in pixels (1u = 40px as per original implementation)
export const UNIT_SIZE = 60;

// Svalboard layout keyed by matrix position (row * cols + col)
// Positions are in key units (1u = 40px)
export const SVALBOARD_LAYOUT: Record<number, KeyLayout> = {
    // Row 0
    0: { row: 0, col: 0, x: 10.6, y: 6, w: 1.5, h: 1 }, // KC_LCTRL
    1: { row: 0, col: 1, x: 10.6, y: 5, w: 1.5, h: 1 }, // KC_TAB
    2: { row: 0, col: 2, x: 9.5, y: 6, w: 1, h: 1 }, // KC_LSHIFT
    3: { row: 0, col: 3, x: 7.9, y: 5, w: 1.5, h: 1 }, // KC_ENTER
    4: { row: 0, col: 4, x: 7.4, y: 6, w: 2, h: 1 }, // MO(14)
    5: { row: 0, col: 5, x: 9.5, y: 5, w: 1, h: 1 }, // KC_CAPSLOCK

    // Row 1
    6: { row: 1, col: 0, x: 9.5, y: 3.5, w: 1, h: 1 }, // KC_V
    7: { row: 1, col: 1, x: 10.5, y: 2.5, w: 1, h: 1 }, // KC_G
    8: { row: 1, col: 2, x: 9.5, y: 2.5, w: 1, h: 1 }, // KC_F
    9: { row: 1, col: 3, x: 9.5, y: 1.5, w: 1, h: 1 }, // KC_R
    10: { row: 1, col: 4, x: 8.5, y: 2.5, w: 1, h: 1 }, // LSFT(KC_QUOTE)

    // Row 2
    12: { row: 2, col: 0, x: 7, y: 2, w: 1, h: 1 }, // KC_C
    13: { row: 2, col: 1, x: 8, y: 1, w: 1, h: 1 }, // KC_T
    14: { row: 2, col: 2, x: 7, y: 1, w: 1, h: 1 }, // KC_D
    15: { row: 2, col: 3, x: 7, y: 0, w: 1, h: 1 }, // KC_E
    16: { row: 2, col: 4, x: 6, y: 1, w: 1, h: 1 }, // KC_GRAVE

    // Row 3
    18: { row: 3, col: 0, x: 3.5, y: 2, w: 1, h: 1 }, // KC_X
    19: { row: 3, col: 1, x: 4.5, y: 1, w: 1, h: 1 }, // KC_B
    20: { row: 3, col: 2, x: 3.5, y: 1, w: 1, h: 1 }, // KC_S
    21: { row: 3, col: 3, x: 3.5, y: 0, w: 1, h: 1 }, // KC_W
    22: { row: 3, col: 4, x: 2.5, y: 1, w: 1, h: 1 }, // KC_ESCAPE

    // Row 4
    24: { row: 4, col: 0, x: 1, y: 3.5, w: 1, h: 1 }, // KC_Z
    25: { row: 4, col: 1, x: 2, y: 2.5, w: 1, h: 1 }, // KC_LBRACKET
    26: { row: 4, col: 2, x: 1, y: 2.5, w: 1, h: 1 }, // KC_A
    27: { row: 4, col: 3, x: 1, y: 1.5, w: 1, h: 1 }, // KC_Q
    28: { row: 4, col: 4, x: 0, y: 2.5, w: 1, h: 1 }, // KC_DELETE

    // Row 5 (thumb cluster left)
    30: { row: 5, col: 0, x: 12.9, y: 6, w: 1.5, h: 1 }, // KC_LALT
    31: { row: 5, col: 1, x: 12.9, y: 5, w: 1.5, h: 1 }, // KC_BSPACE
    32: { row: 5, col: 2, x: 14.5, y: 6, w: 1, h: 1 }, // MO(4)
    33: { row: 5, col: 3, x: 15.6, y: 5, w: 1.5, h: 1 }, // KC_SPACE
    34: { row: 5, col: 4, x: 15.6, y: 6, w: 2, h: 1 }, // MO(2)
    35: { row: 5, col: 5, x: 14.5, y: 5, w: 1, h: 1 }, // MO(5)

    // Row 6
    36: { row: 6, col: 0, x: 14.5, y: 3.5, w: 1, h: 1 }, // KC_M
    37: { row: 6, col: 1, x: 15.5, y: 2.5, w: 1, h: 1 }, // KC_QUOTE
    38: { row: 6, col: 2, x: 14.5, y: 2.5, w: 1, h: 1 }, // KC_J
    39: { row: 6, col: 3, x: 14.5, y: 1.5, w: 1, h: 1 }, // KC_U
    40: { row: 6, col: 4, x: 13.5, y: 2.5, w: 1, h: 1 }, // KC_H

    // Row 7
    42: { row: 7, col: 0, x: 17, y: 2, w: 1, h: 1 }, // KC_COMMA
    43: { row: 7, col: 1, x: 18, y: 1, w: 1, h: 1 }, // LSFT(KC_SCOLON)
    44: { row: 7, col: 2, x: 17, y: 1, w: 1, h: 1 }, // KC_K
    45: { row: 7, col: 3, x: 17, y: 0, w: 1, h: 1 }, // KC_I
    46: { row: 7, col: 4, x: 16, y: 1, w: 1, h: 1 }, // KC_Y

    // Row 8
    48: { row: 8, col: 0, x: 20.5, y: 2, w: 1, h: 1 }, // KC_DOT
    49: { row: 8, col: 1, x: 21.5, y: 1, w: 1, h: 1 }, // KC_NO
    50: { row: 8, col: 2, x: 20.5, y: 1, w: 1, h: 1 }, // KC_L
    51: { row: 8, col: 3, x: 20.5, y: 0, w: 1, h: 1 }, // KC_O
    52: { row: 8, col: 4, x: 19.5, y: 1, w: 1, h: 1 }, // KC_N

    // Row 9
    54: { row: 9, col: 0, x: 23, y: 3.5, w: 1, h: 1 }, // KC_SLASH
    55: { row: 9, col: 1, x: 24, y: 2.5, w: 1, h: 1 }, // KC_BSLASH
    56: { row: 9, col: 2, x: 23, y: 2.5, w: 1, h: 1 }, // KC_SCOLON
    57: { row: 9, col: 3, x: 23, y: 1.5, w: 1, h: 1 }, // KC_P
    58: { row: 9, col: 4, x: 22, y: 2.5, w: 1, h: 1 }, // KC_RBRACKET
};

// Total matrix size
export const MATRIX_ROWS = 10;
export const MATRIX_COLS = 6;
