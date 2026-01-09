import "react-simple-keyboard/build/css/index.css";

import { FunctionComponent, useState } from "react";

import Keyboard from "react-simple-keyboard";

interface IProps {
    onChange: (input: string) => void;
    onKeyPress?: (button: string) => void;
    keyboardRef: any;
}

const SpecialKeyboard: FunctionComponent<IProps> = ({ onChange, onKeyPress: onKeyPressCallback, keyboardRef }) => {
    const [layoutName] = useState("default");

    const onKeyPress = (button: string) => {
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
                "QK_REPEAT_KEY QK_LAYER_LOCK",
            ],
        },

        // Map display labels to make keys readable. QMK keycodes are preserved as key names.
        display: {
            QK_REPEAT_KEY: "Repeat Key",
            QK_LAYER_LOCK: "Layer Lock",
        },
    };

    return (
        <div className="w-[60%] mx-auto py-6">
            <Keyboard keyboardRef={(r) => (keyboardRef.current = r)} layoutName={layoutName} onRender={() => console.log("Rendered")} {...keyboardOptions} />
        </div>
    );
};

export default SpecialKeyboard;
