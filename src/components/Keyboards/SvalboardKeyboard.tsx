import "./Svalboard.css";

import { FunctionComponent, useState } from "react";

import Keyboard from "react-simple-keyboard";

interface IProps {
    onChange: (input: string) => void;
    onKeyPress?: (button: string) => void;
    keyboardRef: any;
    customKeyboardRef?: any;
}

const SvalboardKeyboard: FunctionComponent<IProps> = ({ onChange, onKeyPress: onKeyPressCallback, keyboardRef, customKeyboardRef }) => {
    const [layoutName, setLayoutName] = useState("default");

    const onKeyPress = (button: string) => {
        // toggle between default and shift layouts for shift/lock
        if (button === "{shift}" || button === "{lock}" || button === "{shiftleft}" || button === "{shiftright}") {
            setLayoutName((prev) => (prev === "default" ? "shift" : "default"));
        }
        if (onKeyPressCallback) onKeyPressCallback(button);
    };

    const commonKeyboardOptions = {
        onChange: (input: string) => onChange(input),
        onKeyPress: (button: any) => onKeyPress(button),
        theme: "simple-keyboard hg-theme-default hg-layout-default",
        physicalKeyboardHighlight: true,
        syncInstanceInputs: true,
        mergeDisplay: true,
        debug: true,
    };

    /**
     * Build a layout that mirrors the provided HTML structure and uses QMK keycodes
     * - Groups: mouse events, custom keys header, and special keys
     * - Headers (kbdesc) are represented as special pseudo-keys so they can receive the kbdesc class
     */
    const keyboardOptions = {
        ...commonKeyboardOptions,
        layout: {
            default: ["KC_BTN1 KC_BTN2 KC_BTN3 KC_BTN4", "KC_WH_U KC_WH_D KC_WH_L KC_WH_R", "KC_MS_U KC_MS_D KC_MS_L KC_MS_R", "KC_ACL0 KC_ACL1 KC_ACL2 KC_BTN5"],
        },

        display: {
            // Mouse buttons
            KC_BTN1: "Mouse 1",
            KC_BTN2: "Mouse 2",
            KC_BTN3: "Mouse 3",
            KC_BTN4: "Mouse 4",
            KC_BTN5: "Mouse 5",

            // Scroll
            KC_WH_U: "Scroll Up",
            KC_WH_D: "Scroll Down",
            KC_WH_L: "Scroll Left",
            KC_WH_R: "Scroll Right",

            // Movement
            KC_MS_U: "Mouse Up",
            KC_MS_D: "Mouse Down",
            KC_MS_L: "Mouse Left",
            KC_MS_R: "Mouse Right",

            // Acceleration
            KC_ACL0: "Mouse Accel 0",
            KC_ACL1: "Mouse Accel 1",
            KC_ACL2: "Mouse Accel 2",

            // Special keys
            QK_REPEAT_KEY: "Repeat",
            QK_LAYER_LOCK: "Layer Lock",
        },
    };

    const customKeyboardOptions = {
        ...commonKeyboardOptions,
        // Arrange the custom keycodes into 3 rows of 6 (last row may be shorter)
        layout: {
            default: [
                "SV_LEFT_DPI_INC SV_LEFT_DPI_DEC SV_RIGHT_DPI_INC SV_RIGHT_DPI_DEC",
                "SV_LEFT_SCROLL_TOGGLE SV_RIGHT_SCROLL_TOGGLE SV_RECALIBRATE_POINTER SV_MH_CHANGE_TIMEOUTS",
                "SV_CAPS_WORD SV_TOGGLE_ACHORDION SV_TOGGLE_23_67 SV_TOGGLE_45_67",
                "SV_SNIPER_2 SV_SNIPER_3 SV_SNIPER_5 SV_SCROLL_HOLD",
                "SV_SCROLL_TOGGLE SV_OUTPUT_STATUS",
            ],
        },

        display: {
            SV_LEFT_DPI_INC: "Left\nDPI +",
            SV_LEFT_DPI_DEC: "Left\nDPI -",
            SV_RIGHT_DPI_INC: "Right\nDPI +",
            SV_RIGHT_DPI_DEC: "Right\nDPI -",
            SV_LEFT_SCROLL_TOGGLE: "Scroll\nLeft\nToggle",
            SV_RIGHT_SCROLL_TOGGLE: "Scroll\nRight\nToggle",

            SV_RECALIBRATE_POINTER: "Fix\nDrift",
            SV_MH_CHANGE_TIMEOUTS: "Mouse\nKey\nTimer",
            SV_CAPS_WORD: "Caps\nWord\nToggle",
            SV_TOGGLE_ACHORDION: "Toggle\nACH",
            SV_TOGGLE_23_67: "MO 23\n(45=67)",
            SV_TOGGLE_45_67: "MO 45\n(23=67)",

            SV_SNIPER_2: "Sniper\n2x",
            SV_SNIPER_3: "Sniper\n3x",
            SV_SNIPER_5: "Sniper\n5x",
            SV_SCROLL_HOLD: "Scroll\nToggle\nHold",
            SV_SCROLL_TOGGLE: "Scroll\nToggle",
            SV_OUTPUT_STATUS: "Output\nStatus",
        },

        buttonTheme: [
            {
                class: "kb-key",
                buttons:
                    "SV_LEFT_DPI_INC SV_LEFT_DPI_DEC SV_RIGHT_DPI_INC SV_RIGHT_DPI_DEC SV_LEFT_SCROLL_TOGGLE SV_RIGHT_SCROLL_TOGGLE SV_RECALIBRATE_POINTER SV_MH_CHANGE_TIMEOUTS SV_CAPS_WORD SV_TOGGLE_ACHORDION SV_TOGGLE_23_67 SV_TOGGLE_45_67 SV_SNIPER_2 SV_SNIPER_3 SV_SNIPER_5 SV_SCROLL_HOLD SV_SCROLL_TOGGLE SV_OUTPUT_STATUS",
            },
            {
                class: "kb-norender",
                buttons:
                    "SV_LEFT_DPI_INC SV_LEFT_DPI_DEC SV_RIGHT_DPI_INC SV_RIGHT_DPI_DEC SV_LEFT_SCROLL_TOGGLE SV_RIGHT_SCROLL_TOGGLE SV_RECALIBRATE_POINTER SV_MH_CHANGE_TIMEOUTS SV_CAPS_WORD SV_TOGGLE_ACHORDION SV_TOGGLE_23_67 SV_TOGGLE_45_67 SV_SNIPER_2 SV_SNIPER_3 SV_SNIPER_5 SV_SCROLL_HOLD SV_SCROLL_TOGGLE SV_OUTPUT_STATUS",
            },
        ],
    };

    return (
        <div className="py-6 sval flex flex-row gap-2">
            <Keyboard keyboardRef={(r) => (keyboardRef.current = r)} layoutName={layoutName} onRender={() => console.log("Rendered")} {...keyboardOptions} />
            <Keyboard keyboardRef={(r) => (customKeyboardRef.current = r)} layoutName={layoutName} onRender={() => console.log("Rendered")} {...customKeyboardOptions} />
        </div>
    );
};

export default SvalboardKeyboard;
