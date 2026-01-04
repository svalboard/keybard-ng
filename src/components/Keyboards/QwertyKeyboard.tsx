import { FunctionComponent, useState } from "react";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useLayer } from "@/contexts/LayerContext";
import { useVial } from "@/contexts/VialContext";
import { Key } from "@/components/Key";
import { getKeyContents } from "@/utils/keys";
import { hoverBackgroundClasses, hoverBorderClasses } from "@/utils/colors";
import { KeyContent } from "@/types/vial.types";
import { LAYOUTS, BUTTON_TO_KEYCODE_MAP, KEY_DISPLAY_OVERRIDES, LAYOUT_KEY_MAPS } from "@/components/Keyboards/layouts";
import { useLayoutSettings } from "@/contexts/LayoutSettingsContext";

interface IProps {
    onChange: (input: string) => void;
    onKeyPress?: (button: string) => void;
    keyboardRef: any;
    activeModifiers?: string[];
}

const QwertyKeyboard: FunctionComponent<IProps> = ({ onKeyPress: onKeyPressCallback, activeModifiers = [] }) => {
    const [layoutName, setLayoutName] = useState<"default" | "shift">("default");
    const { internationalLayout, setInternationalLayout } = useLayoutSettings();
    const { keyboard } = useVial();
    const { selectedLayer } = useLayer();
    const { isBinding } = useKeyBinding();

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];

    const currentLayout = LAYOUTS[internationalLayout] || LAYOUTS["us"];
    const layoutKeyMap = LAYOUT_KEY_MAPS[internationalLayout] || {};

    const isShiftActive = activeModifiers.includes("Shift") || layoutName === "shift";

    const onKeyPress = (button: string) => {
        if (!isBinding || !keyboard) return;
        if (button === "{shiftleft}" || button === "{shiftright}" || button === "{capslock}") {
            setLayoutName(layoutName === "default" ? "shift" : "default");
        }
        if (onKeyPressCallback) {
            onKeyPressCallback(button);
        }
    };

    // Helper to get key width
    const getKeyWidth = (key: string): number => {
        // Special case for ISO Shift (smaller) vs ANSI Shift
        if (key === "{shiftleft}" && currentLayout.value !== "us") return 1.25; // ISO Left Shift
        if (key === "{shiftleft}" && currentLayout.value === "us") return 2.25; // ANSI Left Shift

        switch (key) {
            case "{backspace}": return 2;
            case "{tab}": return 1.5;
            case "\\": return 1.5;
            case "|": return 1.5;
            case "{capslock}": return 1.75;
            case "{enter}": return 2.25;
            case "{shiftright}": return 2.75;
            case "{controlleft}": return 1.25;
            case "{altleft}": return 1.25;
            case "{metaleft}": return 1.25;
            case "{space}": return 6.25;
            case "{metaright}": return 1.25;
            case "{altright}": return 1.25;
            case "{controlright}": return 1.25;
            default: return 1;
        }
    };

    const renderRow = (defaultRowStr: string, shiftRowStr: string) => {
        const defaultKeys = defaultRowStr.split(" ");
        const shiftKeys = shiftRowStr.split(" ");

        return (
            <div className="flex gap-1 justify-center">
                {defaultKeys.map((defaultKey, i) => {
                    const shiftKey = shiftKeys[i] || defaultKey;

                    // Visual key is determined by shift state
                    const visualKey = isShiftActive ? shiftKey : defaultKey;

                    // Output key is ALWAYS the default key (base), so parent can apply modifiers
                    // Exception: If the key is specific to the shift layer (rare but possible), defaultKey might be weird?
                    // But in our layouts, default is strict base.
                    const outputKey = defaultKey;

                    // To get correct QMK keycode for display/icon lookup, we resolve the visual key
                    // key is "ç" or "a" or "{shift}"
                    const labelKey = visualKey;

                    const keycode = layoutKeyMap[labelKey] ||
                        layoutKeyMap[labelKey.toLowerCase()] ||
                        BUTTON_TO_KEYCODE_MAP[labelKey] ||
                        BUTTON_TO_KEYCODE_MAP[labelKey.toLowerCase()] ||
                        labelKey;

                    const displayLabel = KEY_DISPLAY_OVERRIDES[visualKey] || visualKey.replace("{", "").replace("}", "");
                    const width = getKeyWidth(defaultKey); // Use default key for width lookup to be consistent
                    const keyContents = keyboard ? getKeyContents(keyboard, keycode) : undefined;

                    return (
                        <Key
                            key={`${defaultKey}-${i}`}
                            x={0} y={0} w={width} h={1} row={0} col={0}
                            keycode={keycode}
                            label={displayLabel}
                            keyContents={keyContents as KeyContent | undefined}
                            layerColor="sidebar"
                            headerClassName="bg-kb-sidebar-dark group-hover:bg-black/30"
                            isRelative
                            variant="small"
                            hoverBorderColor={hoverBorderColor}
                            hoverBackgroundColor={hoverBackgroundColor}
                            onClick={() => onKeyPress(outputKey)}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-2 scale-[0.95] origin-top">
            <div className="flex flex-row items-center gap-2">
                <select
                    className="border rounded-md text-lg text-slate-600 py-4 border-none !outline-none focus:border-none focus:outline-none cursor-pointer font-semibold "
                    value={internationalLayout}
                    onChange={(e) => setInternationalLayout(e.target.value)}
                >
                    {Object.values(LAYOUTS).map((kb) => (
                        <option key={kb.value} value={kb.value}>
                            {kb.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-1">
                {currentLayout.default.map((row, i) => (
                    <div key={i}>{renderRow(row, currentLayout.shift[i])}</div>
                ))}
            </div>
        </div>
    );
};

export default QwertyKeyboard;
