import "react-simple-keyboard/build/css/index.css";
import "./NumpadKeyboard.css";

import { FunctionComponent, useState } from "react";

import Keyboard from "react-simple-keyboard";

interface IProps {
    onChange: (input: string) => void;
    onKeyPress?: (button: string) => void;
    keyboardRef: any;
}

const NumpadKeyboard: FunctionComponent<IProps> = ({ onChange, onKeyPress: onKeyPressCallback, keyboardRef: _keyboardRef }) => {
    const [layoutName, setLayoutName] = useState("default");
    const onKeyPress = (button: string) => {
        if (button === "{shift}" || button === "{lock}") {
            setLayoutName(layoutName === "default" ? "shift" : "default");
        }
        // Call the callback if provided
        if (onKeyPressCallback) {
            onKeyPressCallback(button);
        }
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

    const keyboardNumPadOptions = {
        ...commonKeyboardOptions,
        layout: {
            default: [
                "{numlock} {numpaddivide} {numpadmultiply}",
                "{numpad7} {numpad8} {numpad9}",
                "{numpad4} {numpad5} {numpad6}",
                "{numpad1} {numpad2} {numpad3}",
                "{numpad0} {numpaddecimal}",
            ],
        },
    };

    const keyboardControlPadOptions = {
        ...commonKeyboardOptions,
        layout: {
            default: ["{prtscr} {scrolllock} {pause}", "{insert} {home} {pageup}", "{delete} {end} {pagedown}"],
        },
    };

    const keyboardArrowsOptions = {
        ...commonKeyboardOptions,
        layout: {
            default: ["{arrowup}", "{arrowleft} {arrowdown} {arrowright}"],
        },
    };

    const keyboardNumPadEndOptions = {
        ...commonKeyboardOptions,
        layout: {
            default: ["{numpadsubtract}", "{numpadadd}", "{numpadenter}"],
        },
    };

    return (
        <div className="flex justify-center rounded-md py-6 gap-10">
            <div className="flex flex-col items-center justify-between">
                <Keyboard baseClass={"simple-keyboard-control"} {...keyboardControlPadOptions} />
                <Keyboard baseClass={"simple-keyboard-arrows"} {...keyboardArrowsOptions} />
            </div>

            <div className="flex flex-row items-stretch">
                <Keyboard baseClass={"simple-keyboard-numpad"} {...keyboardNumPadOptions} />
                <Keyboard baseClass={"simple-keyboard-numpadEnd"} {...keyboardNumPadEndOptions} />
            </div>
        </div>
    );
};

export default NumpadKeyboard;
