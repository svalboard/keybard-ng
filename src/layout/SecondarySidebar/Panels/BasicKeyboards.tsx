import { useEffect, useState } from "react";

import QwertyKeyboard from "@/components/Keyboards/QwertyKeyboard";
import { Button } from "@/components/ui/button";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useLayer } from "@/contexts/LayerContext";
import { useVial } from "@/contexts/VialContext";
import { hoverBackgroundClasses, hoverBorderClasses, hoverHeaderClasses } from "@/utils/colors";
import { cn } from "@/lib/utils";
import { KeyboardInfo, KeyContent } from "@/types/vial.types";
import { Key } from "@/components/Key";
import { getKeyContents } from "@/utils/keys";
import { keyService } from "@/services/key.service";

import { BUTTON_TO_KEYCODE_MAP } from "@/components/Keyboards/layouts";

const getKeyCodeForButton = (keyboard: KeyboardInfo, button: string): string | undefined => {
    const k = BUTTON_TO_KEYCODE_MAP[button] || BUTTON_TO_KEYCODE_MAP[button.toLowerCase()];
    if (k) return k;
    const customKeycode = keyboard.custom_keycodes?.findIndex((ck) => ck.name === button);
    if (customKeycode === undefined || customKeycode < 0) return button;
    return `USER${customKeycode?.toString().padStart(2, "0")}`;
};

export const modifierOptions = ["Shift", "Ctrl", "Alt", "Gui"] as const;
export type Modifier = typeof modifierOptions[number];

// Helper to apply modifiers to a keycode
const MODIFIER_MAP: Record<number, string> = {
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

// Helper to apply modifiers to a keycode
const applyModifiers = (keycode: string, activeModifiers: Modifier[]) => {
    if (activeModifiers.length === 0) return keycode;

    const hasCtrl = activeModifiers.includes("Ctrl");
    const hasShift = activeModifiers.includes("Shift");
    const hasAlt = activeModifiers.includes("Alt");
    const hasGui = activeModifiers.includes("Gui");

    // bitmask: Ctrl=1, Shift=2, Alt=4, Gui=8
    const mask = (hasCtrl ? 1 : 0) | (hasShift ? 2 : 0) | (hasAlt ? 4 : 0) | (hasGui ? 8 : 0);

    const modifierFunc = MODIFIER_MAP[mask];
    return modifierFunc ? `${modifierFunc}(${keycode})` : keycode;
};

interface Props {
    isPicker?: boolean;
}

const BasicKeyboards = ({ isPicker }: Props) => {
    const [activeModifiers, setActiveModifiers] = useState<Modifier[]>([]);
    const { assignKeycode, isBinding } = useKeyBinding();
    const { keyboard } = useVial();
    const { selectedLayer } = useLayer();

    useEffect(() => {
        setActiveModifiers([]);
    }, []);

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];
    const hoverHeaderClass = hoverHeaderClasses[layerColorName] || hoverHeaderClasses["primary"];

    const handleModifierToggle = (modifier: Modifier) => {
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
        { keycode: "KC_NLCK", label: "Lock" }, { keycode: "KC_PEQL", label: "=" }, { keycode: "KC_KP_SLASH", label: "/" }, { keycode: "KC_KP_ASTERISK", label: "*" },

        { keycode: "KC_INS", label: "Ins" }, { keycode: "KC_HOME", label: "Home" }, { keycode: "KC_PGUP", label: "PgUp" },
        { keycode: "KC_KP_7", label: "7" }, { keycode: "KC_KP_8", label: "8" }, { keycode: "KC_KP_9", label: "9" }, { keycode: "KC_KP_MINUS", label: "-" },

        { keycode: "KC_DEL", label: "Del" }, { keycode: "KC_END", label: "End" }, { keycode: "KC_PGDN", label: "PgDn" },
        { keycode: "KC_KP_4", label: "4" }, { keycode: "KC_KP_5", label: "5" }, { keycode: "KC_KP_6", label: "6" }, { keycode: "KC_KP_PLUS", label: "+" },

        { keycode: "BLANK", label: "" }, { keycode: "KC_UP", label: "↑" }, { keycode: "BLANK", label: "" },
        { keycode: "KC_KP_1", label: "1" }, { keycode: "KC_KP_2", label: "2" }, { keycode: "KC_KP_3", label: "3" }, { keycode: "KC_KP_ENTER", label: "Enter" },

        { keycode: "KC_LEFT", label: "←" }, { keycode: "KC_DOWN", label: "↓" }, { keycode: "KC_RGHT", label: "→" },
        { keycode: "KC_KP_0", label: "0" }, { keycode: "KC_KP_DOT", label: "." },
    ];


    const blankKeys = [
        { keycode: "KC_NO", label: "" },
        { keycode: "KC_TRNS", label: "▽" },
    ];

    const otherKeys = [
        { keycode: "QK_REPEAT_KEY", label: "Repeat" },
        { keycode: "QK_LAYER_LOCK", label: "Lyr Lock" },
    ];

    const renderKeyGrid = (keys: { keycode: string, label: string }[], gridCols?: string) => (
        <div className={cn("gap-2", gridCols ? `grid ${gridCols}` : "flex flex-wrap")}>
            {keys.map((k, i) => {
                if (k.keycode === "BLANK") {
                    return <div key={`blank-${i}`} className="w-[60px] h-[60px]" />;
                }
                const keyContents = keyboard ? getKeyContents(keyboard, k.keycode) : undefined;
                const displayLabel = keyService.define(k.keycode)?.str || k.label || k.keycode;
                const isDoubleHeight = k.keycode === "KC_KP_ENTER";

                return (
                    <Key
                        key={`${k.keycode}-${i}`}
                        x={0} y={0} w={1} h={1} row={0} col={0}
                        keycode={k.keycode}
                        label={displayLabel}
                        keyContents={keyContents as KeyContent | undefined}
                        layerColor="sidebar"
                        headerClassName={`bg-kb-sidebar-dark ${hoverHeaderClass}`}
                        isRelative
                        className={cn(
                            "w-[60px]",
                            isDoubleHeight ? "h-[128px] row-span-2" : "h-[60px]"
                        )}
                        hoverBorderColor={hoverBorderColor}
                        hoverBackgroundColor={hoverBackgroundColor}
                        hoverLayerColor={layerColorName}
                        onClick={() => handleKeyClick(k.keycode)}
                    />
                );
            })}
        </div>
    );

    return (
        <div className="space-y-6 relative">
            {isPicker && (
                <div className="pb-2">
                    <span className="font-semibold text-xl text-slate-700">Keyboard</span>
                </div>
            )}
            <section className="flex flex-col gap-2 sticky top-0 z-20 bg-white pt-4 pb-4 -mt-4">
                <span className="font-semibold text-lg text-slate-700">Modifiers</span>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant={activeModifiers.length === 0 ? "default" : "secondary"}
                        size="sm"
                        className={cn(
                            "rounded-md px-5 transition-all text-sm font-medium border-none",
                            activeModifiers.length === 0 ? "bg-kb-sidebar-dark text-white shadow-sm" : "bg-kb-gray-medium text-slate-700 hover:bg-white"
                        )}
                        onClick={() => setActiveModifiers([])}
                    >
                        NONE
                    </Button>
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
                                    isActive ? "bg-kb-sidebar-dark text-white shadow-sm" : "bg-kb-gray-medium text-slate-700 hover:bg-white"
                                )}
                                onClick={() => handleModifierToggle(modifier)}
                            >
                                {modifier.toUpperCase()}
                            </Button>
                        );
                    })}
                </div>
            </section>

            <QwertyKeyboard onKeyPress={handleKeyboardInput} activeModifiers={activeModifiers} />

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-lg text-slate-700">Blank and Transparent</span>
                    {renderKeyGrid(blankKeys)}
                </div>
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-lg text-slate-700">Numpad</span>
                    {renderKeyGrid(numpadKeys, "grid-cols-[repeat(7,60px)]")}
                </div>
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-lg text-slate-700">Others</span>
                    {renderKeyGrid(otherKeys)}
                </div>
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-lg text-slate-700">Function Keys</span>
                    {renderKeyGrid(Array.from({ length: 24 }, (_, i) => ({
                        keycode: `KC_F${i + 1}`,
                        label: `F${i + 1}`
                    })))}
                </div>
            </div>
        </div>
    );
};

export default BasicKeyboards;
