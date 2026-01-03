import { useEffect, useRef, useState } from "react";

import InternationalKeyboard from "@/components/Keyboards/InternationalKeyboard";
import NumpadKeyboard from "@/components/Keyboards/NumpadKeyboard";
import QwertyKeyboard from "@/components/Keyboards/QwertyKeyboard";
import SpecialKeyboard from "@/components/Keyboards/SpecialKeyboard";
import SvalboardKeyboard from "@/components/Keyboards/SvalboardKeyboard";
import { Button } from "@/components/ui/button";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useLayer } from "@/contexts/LayerContext";
import { useVial } from "@/contexts/VialContext";
import { hoverBackgroundClasses, hoverBorderClasses } from "@/utils/colors";
import { cn } from "@/lib/utils";
import { KeyboardInfo } from "@/types/vial.types";

// Mapping from react-simple-keyboard button text to QMK keycodes
const BUTTON_TO_KEYCODE: Record<string, string> = {
    // Letters
    a: "KC_A",
    b: "KC_B",
    c: "KC_C",
    d: "KC_D",
    e: "KC_E",
    f: "KC_F",
    g: "KC_G",
    h: "KC_H",
    i: "KC_I",
    j: "KC_J",
    k: "KC_K",
    l: "KC_L",
    m: "KC_M",
    n: "KC_N",
    o: "KC_O",
    p: "KC_P",
    q: "KC_Q",
    r: "KC_R",
    s: "KC_S",
    t: "KC_T",
    u: "KC_U",
    v: "KC_V",
    w: "KC_W",
    x: "KC_X",
    y: "KC_Y",
    z: "KC_Z",
    // Numbers
    "0": "KC_0",
    "1": "KC_1",
    "2": "KC_2",
    "3": "KC_3",
    "4": "KC_4",
    "5": "KC_5",
    "6": "KC_6",
    "7": "KC_7",
    "8": "KC_8",
    "9": "KC_9",
    // Special characters
    "`": "KC_GRV",
    "-": "KC_MINS",
    "=": "KC_EQL",
    "[": "KC_LBRC",
    "]": "KC_RBRC",
    "\\": "KC_BSLS",
    ";": "KC_SCLN",
    "'": "KC_QUOT",
    ",": "KC_COMM",
    ".": "KC_DOT",
    "/": "KC_SLSH",
    // Function keys
    "{f1}": "KC_F1",
    "{f2}": "KC_F2",
    "{f3}": "KC_F3",
    "{f4}": "KC_F4",
    "{f5}": "KC_F5",
    "{f6}": "KC_F6",
    "{f7}": "KC_F7",
    "{f8}": "KC_F8",
    "{f9}": "KC_F9",
    "{f10}": "KC_F10",
    "{f11}": "KC_F11",
    "{f12}": "KC_F12",
    // Modifiers and special keys
    "{escape}": "KC_ESC",
    "{tab}": "KC_TAB",
    "{backspace}": "KC_BSPC",
    "{enter}": "KC_ENT",
    "{capslock}": "KC_CAPS",
    "{shiftleft}": "KC_LSFT",
    "{shiftright}": "KC_RSFT",
    "{controlleft}": "KC_LCTL",
    "{controlright}": "KC_RCTL",
    "{altleft}": "KC_LALT",
    "{altright}": "KC_RALT",
    "{metaleft}": "KC_LGUI",
    "{metaright}": "KC_RGUI",
    "{space}": "KC_SPC",
    // Numpad keys
    "{numpad0}": "KC_KP_0",
    "{numpad1}": "KC_KP_1",
    "{numpad2}": "KC_KP_2",
    "{numpad3}": "KC_KP_3",
    "{numpad4}": "KC_KP_4",
    "{numpad5}": "KC_KP_5",
    "{numpad6}": "KC_KP_6",
    "{numpad7}": "KC_KP_7",
    "{numpad8}": "KC_KP_8",
    "{numpad9}": "KC_KP_9",
    "{numlock}": "KC_NLCK",
    "{numpaddivide}": "KC_KP_SLASH",
    "{numpadmultiply}": "KC_KP_ASTERISK",
    "{numpadsubtract}": "KC_KP_MINUS",
    "{numpadadd}": "KC_KP_PLUS",
    "{numpadenter}": "KC_KP_ENTER",
    "{numpaddecimal}": "KC_KP_DOT",
    // Navigation keys
    "{insert}": "KC_INS",
    "{delete}": "KC_DEL",
    "{home}": "KC_HOME",
    "{end}": "KC_END",
    "{pageup}": "KC_PGUP",
    "{pagedown}": "KC_PGDN",
    "{arrowup}": "KC_UP",
    "{arrowdown}": "KC_DOWN",
    "{arrowleft}": "KC_LEFT",
    "{arrowright}": "KC_RGHT",
    // Other special keys
    "{prtscr}": "KC_PSCR",
    "{scrolllock}": "KC_SLCK",
    "{pause}": "KC_PAUS",
};

const getKeyCodeForButton = (keyboard: KeyboardInfo, button: string): string | undefined => {
    const k = BUTTON_TO_KEYCODE[button.toLowerCase()];
    if (k) {
        return k;
    }
    const customKeycode = keyboard.custom_keycodes?.findIndex((ck) => ck.name === button);
    if (customKeycode === undefined || customKeycode < 0) {
        return button;
    }
    return `USER${customKeycode?.toString().padStart(2, "0")}`;
};

const modifierOptions = ["Shift", "Ctrl", "Alt", "Gui"] as const;
const keyboardCategories = ["Numpad", "International", "Svalboard", "Special"] as const;
type DetailCategory = (typeof keyboardCategories)[number];

const BasicKeyboards = () => {
    const keyboardRef = useRef(null);
    const numpadKeyboardRef = useRef(null);
    const internationalKeyboardRef = useRef(null);
    const svalboardKeyboardRef = useRef(null);
    const customKeyboardRef = useRef(null);
    const specialKeyboardRef = useRef(null);
    const [activeCategory, setActiveCategory] = useState<DetailCategory>("Numpad");
    const [activeModifiers, setActiveModifiers] = useState<string[]>([]);
    const { assignKeycode, isBinding } = useKeyBinding();
    const { keyboard } = useVial();
    const { selectedLayer } = useLayer();
    console.log("BasicKeyboards keyboard:", keyboard);

    useEffect(() => {
        setActiveCategory("Numpad");
        setActiveModifiers([]);
    }, []);

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];

    const handleModifierToggle = (modifier: string) => {
        setActiveModifiers((prev) => (prev.includes(modifier) ? prev.filter((item) => item !== modifier) : [...prev, modifier]));
    };

    const handleKeyboardInput = (button: string) => {
        if (!isBinding) return;

        let keycode = getKeyCodeForButton(keyboard!, button);
        console.log("Button pressed:", button, "Mapped keycode:", keycode);
        if (!keycode) {
            console.warn(`No keycode mapping for button: ${button}`);
            return;
        }

        // Apply modifiers using QMK modifier function names
        if (activeModifiers.length > 0) {
            const hasShift = activeModifiers.includes("Shift");
            const hasCtrl = activeModifiers.includes("Ctrl");
            const hasAlt = activeModifiers.includes("Alt");
            const hasGui = activeModifiers.includes("Gui");

            let modifierFunc = "";

            // Map modifier combinations to QMK modifier functions
            if (hasShift && hasCtrl && hasAlt && hasGui) {
                modifierFunc = "HYPR"; // All modifiers
            } else if (hasCtrl && hasAlt && hasGui) {
                modifierFunc = "LCAG"; // Ctrl + Alt + Gui
            } else if (hasShift && hasAlt && hasGui) {
                modifierFunc = "LSAG"; // Shift + Alt + Gui
            } else if (hasShift && hasCtrl && hasGui) {
                modifierFunc = "LSCG"; // Shift + Ctrl + Gui
            } else if (hasShift && hasCtrl && hasAlt) {
                modifierFunc = "MEH"; // Shift + Ctrl + Alt
            } else if (hasShift && hasGui) {
                modifierFunc = "SGUI"; // Shift + Gui
            } else if (hasCtrl && hasGui) {
                modifierFunc = "LCG"; // Ctrl + Gui
            } else if (hasAlt && hasGui) {
                modifierFunc = "LAG"; // Alt + Gui
            } else if (hasShift && hasAlt) {
                modifierFunc = "LSA"; // Shift + Alt
            } else if (hasCtrl && hasAlt) {
                modifierFunc = "LCA"; // Ctrl + Alt
            } else if (hasShift && hasCtrl) {
                modifierFunc = "C_S"; // Ctrl + Shift
            } else if (hasShift) {
                modifierFunc = "LSFT"; // Shift only
            } else if (hasCtrl) {
                modifierFunc = "LCTL"; // Ctrl only
            } else if (hasAlt) {
                modifierFunc = "LALT"; // Alt only
            } else if (hasGui) {
                modifierFunc = "LGUI"; // Gui only
            }

            keycode = `${modifierFunc}(${keycode})`;
        }

        assignKeycode(keycode);
    };

    return (
        <div className="space-y-6">
            <QwertyKeyboard keyboardRef={keyboardRef} onChange={() => { }} onKeyPress={handleKeyboardInput} />
            <section className="flex flex-row justify-around items-center">
                <p className="text-sm font-normal uppercase tracking-wide text-muted-foreground">Modifiers</p>
                <div className="flex flex-wrap gap-2">
                    {modifierOptions.map((modifier) => {
                        const isActive = activeModifiers.includes(modifier);
                        return (
                            <Button
                                key={modifier}
                                type="button"
                                variant={isActive ? "default" : "secondary"}
                                size="sm"
                                className={cn("rounded-full px-5", isActive ? "bg-kb-red" : "bg-muted", "hover:bg-kb-red hover:text-white hover:shadow-md transition")}
                                onClick={() => handleModifierToggle(modifier)}
                            >
                                {modifier.toUpperCase()}
                            </Button>
                        );
                    })}
                </div>
            </section>
            <section className="pt-2 flex flex-row items-center gap-4">
                <p className="text-sm font-normal uppercase tracking-wide text-muted-foreground ml-6">Special</p>
                <div className="flex flex-wrap gap-2 flex-grow flex-row items-center justify-center ">
                    <div
                        className={cn(
                            "bg-black w-25 h-10 rounded-[4px] hover:shadow-md cursor-pointer transition-all border-2 border-transparent",
                            hoverBorderColor,
                            hoverBackgroundColor
                        )}
                        data-bind="key"
                        data-key="KC_NO"
                        onClick={() => assignKeycode("KC_NO")}
                    >
                        &nbsp;
                    </div>
                    <div
                        className={cn(
                            "bg-black w-25 h-10 rounded-[4px] hover:shadow-md text-white flex items-center justify-center cursor-pointer transition-all border-2 border-transparent",
                            hoverBorderColor,
                            hoverBackgroundColor
                        )}
                        data-bind="key"
                        data-key="KC_TRNS"
                        onClick={() => assignKeycode("KC_TRNS")}
                    >
                        ▽
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <div className="flex items-center justify-between rounded-full p-1 gap-3 bg-muted/30">
                        {keyboardCategories.map((category) => {
                            const isActive = category === activeCategory;
                            return (
                                <Button
                                    key={category}
                                    type="button"
                                    size="sm"
                                    variant={isActive ? "default" : "ghost"}
                                    className={cn("px-3 py-1 text-xs rounded-full", isActive ? "shadow" : "text-muted-foreground")}
                                    onClick={() => setActiveCategory(category)}
                                >
                                    {category}
                                </Button>
                            );
                        })}
                    </div>
                </div>
                <div className="space-y-4">
                    {activeCategory === "Numpad" && <NumpadKeyboard keyboardRef={numpadKeyboardRef} onChange={() => { }} onKeyPress={handleKeyboardInput} />}
                    {activeCategory === "International" && <InternationalKeyboard keyboardRef={internationalKeyboardRef} onChange={() => { }} onKeyPress={handleKeyboardInput} />}
                    {activeCategory === "Svalboard" && (
                        <SvalboardKeyboard keyboardRef={svalboardKeyboardRef} customKeyboardRef={customKeyboardRef} onChange={() => { }} onKeyPress={handleKeyboardInput} />
                    )}
                    {activeCategory === "Special" && <SpecialKeyboard keyboardRef={specialKeyboardRef} onChange={() => { }} onKeyPress={handleKeyboardInput} />}
                </div>
            </section>
        </div>
    );
};

export default BasicKeyboards;
