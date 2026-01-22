import "react-simple-keyboard/build/css/index.css";

import { FunctionComponent, useState } from "react";

import Keyboard from "react-simple-keyboard";

interface IProps {
    onChange: (input: string) => void;
    onKeyPress?: (button: string) => void;
    keyboardRef: any;
}

const InternationalKeyboard: FunctionComponent<IProps> = ({ onChange, onKeyPress: onKeyPressCallback, keyboardRef }) => {
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
     * - kb-spam: a flat list of symbol keys used for quick binding
     * - kb-group / kb-row: primary keyboard rows with labels and some JIS/Korean keys
     */
    const keyboardOptions = {
        ...commonKeyboardOptions,
        layout: {
            default: [
                // Represent kb-spam as a single long row of QMK keycodes (space separated)
                // Note: react-simple-keyboard will render them as separate keys
                "KC_NONUS_HASH KC_NONUS_BSLASH KC_RO KC_KP_COMMA KC_TILD",
                "KC_AT KC_CIRC KC_AMPR KC_ASTR KC_LPRN KC_RPRN KC_UNDS",
                "KC_PLUS KC_LCBR KC_RCBR KC_LT KC_GT KC_COLN KC_QUES",
                "KC_DQUO KC_PIPE KC_DLR KC_EXLM KC_HASH KC_PERC",
            ],
        },

        // Map display labels to make keys readable. QMK keycodes are preserved as key names.
        display: {
            KC_NONUS_HASH: "~ #",
            KC_NONUS_BSLASH: "| \\",
            KC_RO: "_ \\",
            KC_KP_COMMA: "KP ,",
            KC_TILD: "~",
            KC_AT: "@",
            KC_CIRC: "^",
            KC_AMPR: "&",
            KC_ASTR: "*",
            KC_LPRN: "(",
            KC_RPRN: ")",
            KC_UNDS: "_",
            KC_PLUS: "+",
            KC_LCBR: "{",
            KC_RCBR: "}",
            KC_LT: "<",
            KC_GT: ">",
            KC_COLN: ":",
            KC_QUES: "?",
            KC_DQUO: '"',
            KC_PIPE: "|",
            KC_DLR: "$",
            KC_EXLM: "!",
            KC_HASH: "#",
            KC_PERC: "%",
            "{escape}": "esc",
            "{tab}": "tab",
            "{backspace}": "bksp",
            "{enter}": "enter",
            "{capslock}": "caps",
            "{shiftleft}": "lshift",
            "{shiftright}": "rshift",
            "{controlleft}": "lctrl",
            "{controlright}": "rctrl",
            "{altleft}": "alt",
            "{altright}": "alt",
            "{metaleft}": "GUI",
            "{metaright}": "GUI",
        },
    };

    return (
        <div className="w-[60%] mx-auto py-6">
            <Keyboard keyboardRef={(r) => (keyboardRef.current = r)} layoutName={layoutName} onRender={() => console.log("Rendered")} {...keyboardOptions} />
        </div>
    );
};

export default InternationalKeyboard;
