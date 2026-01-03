import { useEffect, useRef, useState } from "react";

import QwertyKeyboard from "@/components/Keyboards/QwertyKeyboard";
import { Button } from "@/components/ui/button";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useLayer } from "@/contexts/LayerContext";
import { useVial } from "@/contexts/VialContext";
import { colorClasses, hoverBackgroundClasses, hoverBorderClasses } from "@/utils/colors";
import { cn } from "@/lib/utils";
import { KeyboardInfo } from "@/types/vial.types";
import { Key } from "@/components/Key";
import { getKeyContents } from "@/utils/keys";
import { keyService } from "@/services/key.service";

// Mapping from react-simple-keyboard button text to QMK keycodes (kept for QwertyKeyboard compatibility if needed, though QwertyKeyboard likely handles its own)
// QwertyKeyboard seems to use BUTTON_TO_KEYCODE internally or via callback. In BasicKeyboards original, BUTTON_TO_KEYCODE was used in getKeyCodeForButton.
// QwertyKeyboard props: onChange, onKeyPress. onKeyPress sends "button".
// We need getKeyCodeForButton to handle standard inputs from QwertyKeyboard.

const BUTTON_TO_KEYCODE: Record<string, string> = {
    // Letters
    a: "KC_A", b: "KC_B", c: "KC_C", d: "KC_D", e: "KC_E", f: "KC_F", g: "KC_G", h: "KC_H", i: "KC_I",
    j: "KC_J", k: "KC_K", l: "KC_L", m: "KC_M", n: "KC_N", o: "KC_O", p: "KC_P", q: "KC_Q", r: "KC_R",
    s: "KC_S", t: "KC_T", u: "KC_U", v: "KC_V", w: "KC_W", x: "KC_X", y: "KC_Y", z: "KC_Z",
    // Numbers
    "0": "KC_0", "1": "KC_1", "2": "KC_2", "3": "KC_3", "4": "KC_4", "5": "KC_5", "6": "KC_6", "7": "KC_7", "8": "KC_8", "9": "KC_9",
    // Special characters
    "`": "KC_GRV", "-": "KC_MINS", "=": "KC_EQL", "[": "KC_LBRC", "]": "KC_RBRC", "\\": "KC_BSLS",
    ";": "KC_SCLN", "'": "KC_QUOT", ",": "KC_COMM", ".": "KC_DOT", "/": "KC_SLSH",
    // Function keys
    "{f1}": "KC_F1", "{f2}": "KC_F2", "{f3}": "KC_F3", "{f4}": "KC_F4", "{f5}": "KC_F5", "{f6}": "KC_F6",
    "{f7}": "KC_F7", "{f8}": "KC_F8", "{f9}": "KC_F9", "{f10}": "KC_F10", "{f11}": "KC_F11", "{f12}": "KC_F12",
    // Modifiers and special keys
    "{escape}": "KC_ESC", "{tab}": "KC_TAB", "{backspace}": "KC_BSPC", "{enter}": "KC_ENT", "{capslock}": "KC_CAPS",
    "{shiftleft}": "KC_LSFT", "{shiftright}": "KC_RSFT", "{controlleft}": "KC_LCTL", "{controlright}": "KC_RCTL",
    "{altleft}": "KC_LALT", "{altright}": "KC_RALT", "{metaleft}": "KC_LGUI", "{metaright}": "KC_RGUI", "{space}": "KC_SPC",
};

const getKeyCodeForButton = (keyboard: KeyboardInfo, button: string): string | undefined => {
    const k = BUTTON_TO_KEYCODE[button.toLowerCase()];
    if (k) return k;
    const customKeycode = keyboard.custom_keycodes?.findIndex((ck) => ck.name === button);
    if (customKeycode === undefined || customKeycode < 0) return button;
    return `USER${customKeycode?.toString().padStart(2, "0")}`;
};

const modifierOptions = ["Shift", "Ctrl", "Alt", "Gui"] as const;

// Helper to apply modifiers to a keycode
const applyModifiers = (keycode: string, activeModifiers: string[]) => {
    if (activeModifiers.length === 0) return keycode;

    const hasCtrl = activeModifiers.includes("Ctrl");
    const hasShift = activeModifiers.includes("Shift");
    const hasAlt = activeModifiers.includes("Alt");
    const hasGui = activeModifiers.includes("Gui");

    // bitmask: Ctrl=1, Shift=2, Alt=4, Gui=8
    const mask = (hasCtrl ? 1 : 0) | (hasShift ? 2 : 0) | (hasAlt ? 4 : 0) | (hasGui ? 8 : 0);

    const MAP: Record<number, string> = {
        1: "LCTL",
        2: "LSFT",
        3: "C_S",
        4: "LALT",
        5: "LCA",
        6: "LSA",
        7: "MEH",
        8: "LGUI",
        9: "LCG",
        10: "SGUI",
        11: "LSCG",
        12: "LAG",
        13: "LCAG",
        14: "LSAG",
        15: "HYPR",
    };

    const modifierFunc = MAP[mask];
    return modifierFunc ? `${modifierFunc}(${keycode})` : keycode;
};

const BasicKeyboards = () => {
    const keyboardRef = useRef(null);
    const [activeModifiers, setActiveModifiers] = useState<string[]>([]);
    const { assignKeycode, isBinding } = useKeyBinding();
    const { keyboard } = useVial();
    const { selectedLayer } = useLayer();

    useEffect(() => {
        setActiveModifiers([]);
    }, []);

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];

    const handleModifierToggle = (modifier: string) => {
        setActiveModifiers((prev) => {
            if (prev.includes(modifier)) {
                return prev.filter((item) => item !== modifier);
            }
            return [...prev, modifier];
        });
    };

    const handleKeyClick = (keycode: string) => {
        if (!isBinding || !keyboard) return;

        // Ensure we translate names like 'SV_...' to actual keycodes if needed
        const mappedKeycode = getKeyCodeForButton(keyboard, keycode) || keycode;
        const finalKeycode = applyModifiers(mappedKeycode, activeModifiers);
        assignKeycode(finalKeycode);
    };

    const handleKeyboardInput = (button: string) => {
        if (!isBinding || !keyboard) return;
        handleKeyClick(button);
    };

    const numpadKeys = [
        { keycode: "KC_PSCR", label: "PrtSc" }, { keycode: "KC_SLCK", label: "ScrLk" }, { keycode: "KC_PAUS", label: "Pause" },
        { keycode: "KC_NLCK", label: "Lock" }, { keycode: "KC_PEQL", label: "=" }, { keycode: "KC_KP_SLASH", label: "/" }, { keycode: "KC_KP_PLUS", label: "+" },

        { keycode: "KC_INS", label: "Ins" }, { keycode: "KC_HOME", label: "Home" }, { keycode: "KC_PGUP", label: "PgUp" },
        { keycode: "KC_KP_7", label: "7" }, { keycode: "KC_KP_8", label: "8" }, { keycode: "KC_KP_9", label: "9" }, { keycode: "KC_KP_MINUS", label: "-" },

        { keycode: "KC_DEL", label: "Del" }, { keycode: "KC_END", label: "End" }, { keycode: "KC_PGDN", label: "PgDn" },
        { keycode: "KC_KP_4", label: "4" }, { keycode: "KC_KP_5", label: "5" }, { keycode: "KC_KP_6", label: "6" }, { keycode: "KC_KP_ASTERISK", label: "*" },

        { keycode: "KC_UP", label: "↑" }, { keycode: "KC_LEFT", label: "←" }, { keycode: "KC_DOWN", label: "↓" },
        { keycode: "KC_KP_1", label: "1" }, { keycode: "KC_KP_2", label: "2" }, { keycode: "KC_KP_3", label: "3" }, { keycode: "KC_KP_ENTER", label: "Enter" },

        { keycode: "KC_RGHT", label: "→" },
        { keycode: "KC_KP_0", label: "0" }, { keycode: "KC_KP_DOT", label: "." },
    ];

    const internationalKeys = [
        "KC_NONUS_HASH", "KC_NONUS_BSLASH", "KC_RO", "KC_KP_COMMA", "KC_TILD",
        "KC_AT", "KC_CIRC", "KC_AMPR", "KC_ASTR", "KC_LPRN", "KC_RPRN", "KC_UNDS",
        "KC_PLUS", "KC_LCBR", "KC_RCBR", "KC_LT", "KC_GT", "KC_COLN", "KC_QUES",
        "KC_DQUO", "KC_PIPE", "KC_DLR", "KC_EXLM", "KC_HASH", "KC_PERC"
    ].map(k => ({ keycode: k, label: k }));

    const specialKeys = [
        { keycode: "KC_NO", label: "" },
        { keycode: "KC_TRNS", label: "▽" },
        { keycode: "QK_REPEAT_KEY", label: "Repeat" },
        { keycode: "QK_LAYER_LOCK", label: "Lyr Lock" },
    ];

    const renderKeyGrid = (keys: { keycode: string, label: string }[]) => (
        <div className="flex flex-wrap gap-2">
            {keys.map((k) => {
                const keyContents = keyboard ? getKeyContents(keyboard, k.keycode) : undefined;
                const displayLabel = keyService.define(k.keycode)?.str || k.label || k.keycode;
                return (
                    <Key
                        key={k.keycode}
                        x={0} y={0} w={1} h={1} row={0} col={0}
                        keycode={k.keycode}
                        label={displayLabel}
                        keyContents={keyContents}
                        layerColor="sidebar"
                        headerClassName="bg-kb-sidebar-dark group-hover:bg-black/30"
                        isRelative
                        className="h-[60px] w-[60px]"
                        hoverBorderColor={hoverBorderColor}
                        hoverBackgroundColor={hoverBackgroundColor}
                        onClick={() => handleKeyClick(k.keycode)}
                    />
                );
            })}
        </div>
    );

    return (
        <div className="space-y-6">
            <section className="flex flex-col gap-2">
                <span className="font-semibold text-lg text-slate-700">Modifiers</span>
                <div className="flex flex-wrap gap-2">
                    {modifierOptions.map((modifier) => {
                        const isActive = activeModifiers.includes(modifier);
                        return (
                            <Button
                                key={modifier}
                                type="button"
                                variant={isActive ? "default" : "secondary"}
                                size="sm"
                                className={cn(
                                    "rounded-md px-5 transition-all text-sm font-medium border-none",
                                    isActive ? `${colorClasses[layerColorName] || "bg-kb-primary"} shadow-[inset_0_0_0_1000px_rgba(0,0,0,0.2)]` : "bg-kb-gray-medium text-slate-700 hover:bg-slate-200"
                                )}
                                onClick={() => handleModifierToggle(modifier)}
                            >
                                {modifier.toUpperCase()}
                            </Button>
                        );
                    })}
                </div>
            </section>

            <QwertyKeyboard keyboardRef={keyboardRef} onChange={() => { }} onKeyPress={handleKeyboardInput} />

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-lg text-slate-700">Blank and Transparent</span>
                    {renderKeyGrid(specialKeys)}
                </div>
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-lg text-slate-700">Numpad</span>
                    {renderKeyGrid(numpadKeys)}
                </div>
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-lg text-slate-700">International</span>
                    {renderKeyGrid(internationalKeys)}
                </div>
            </div>
        </div>
    );
};

export default BasicKeyboards;
