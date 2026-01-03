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
}

const QwertyKeyboard: FunctionComponent<IProps> = ({ onKeyPress: onKeyPressCallback }) => {
    const [layoutName, setLayoutName] = useState<"default" | "shift">("default");
    const { internationalLayout, setInternationalLayout } = useLayoutSettings();
    const { keyboard } = useVial();
    const { selectedLayer } = useLayer();
    const { isBinding } = useKeyBinding();

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];

    const currentLayout = LAYOUTS[internationalLayout] || LAYOUTS["us"];
    const layoutRows = layoutName === "shift" ? currentLayout.shift : currentLayout.default;
    const layoutKeyMap = LAYOUT_KEY_MAPS[internationalLayout] || {};

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

    const renderRow = (row: string) => {
        const keys = row.split(" ");
        return (
            <div className="flex gap-1 justify-center">
                {keys.map((key, i) => {
                    // key is "ç" or "a" or "{shift}"
                    // 1. Try layout specific map first
                    // 2. Fallback to global map
                    // 3. Fallback to key itself
                    const keycode = layoutKeyMap[key] ||
                        layoutKeyMap[key.toLowerCase()] ||
                        BUTTON_TO_KEYCODE_MAP[key] ||
                        BUTTON_TO_KEYCODE_MAP[key.toLowerCase()] ||
                        key;

                    const displayLabel = KEY_DISPLAY_OVERRIDES[key] || key.replace("{", "").replace("}", "");
                    const width = getKeyWidth(key);
                    const keyContents = keyboard ? getKeyContents(keyboard, keycode) : undefined;

                    return (
                        <Key
                            key={`${key}-${i}`}
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
                            onClick={() => onKeyPress(key)}
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
                {layoutRows.map((row, i) => (
                    <div key={i}>{renderRow(row)}</div>
                ))}
            </div>
        </div>
    );
};

export default QwertyKeyboard;
