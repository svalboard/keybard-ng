import React, { useMemo } from "react";

import SidebarItemRow from "@/layout/SecondarySidebar/components/SidebarItemRow";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useLayer } from "@/contexts/LayerContext";
import { useVial } from "@/contexts/VialContext";
import { hoverBackgroundClasses, hoverBorderClasses, hoverHeaderClasses } from "@/utils/colors";
import { getKeyContents } from "@/utils/keys";
import { keyService } from "@/services/key.service";
import { KeyContent } from "@/types/vial.types";

/**
 * Mouse key definition with keycode and display label
 */
interface MouseKeyDefinition {
    keycode: string;
    label: string;
}

/**
 * Available mouse keys including buttons, movement, wheel, and acceleration controls
 */
const MOUSE_KEYS: readonly MouseKeyDefinition[] = [
    // Mouse Buttons
    { keycode: "KC_BTN1", label: "Mouse 1" },
    { keycode: "KC_BTN2", label: "Mouse 2" },
    { keycode: "KC_BTN3", label: "Mouse 3" },
    { keycode: "KC_BTN4", label: "Mouse 4" },
    { keycode: "KC_BTN5", label: "Mouse 5" },

    // Mouse Movement
    { keycode: "KC_MS_U", label: "Mouse Up" },
    { keycode: "KC_MS_D", label: "Mouse Down" },
    { keycode: "KC_MS_L", label: "Mouse Left" },
    { keycode: "KC_MS_R", label: "Mouse Right" },

    // Mouse Wheel
    { keycode: "KC_WH_U", label: "Mouse Wheel Up" },
    { keycode: "KC_WH_D", label: "Mouse Wheel Down" },
    { keycode: "KC_WH_L", label: "Mouse Wheel Left" },
    { keycode: "KC_WH_R", label: "Mouse Wheel Right" },

    // Mouse Acceleration
    { keycode: "KC_ACL0", label: "Mouse Accelerate 0" },
    { keycode: "KC_ACL1", label: "Mouse Accelerate 1" },
    { keycode: "KC_ACL2", label: "Mouse Accelerate 2" },

    // Custom Mouse Features
    { keycode: "SV_SNIPER_2", label: "Mouse Sniper 2x" },
    { keycode: "SV_SNIPER_3", label: "Mouse Sniper 3x" },
    { keycode: "SV_SNIPER_5", label: "Mouse Sniper 5x" },
    { keycode: "SV_MH_CHANGE_TIMEOUTS", label: "Mouse Key Timer" },
    { keycode: "SV_RECALIBRATE_POINTER", label: "Fix Drift" },
    { keycode: "SV_CAPS_WORD", label: "Caps Word" },
    { keycode: "SV_TOGGLE_ACHORDION", label: "Toggle ACH" },
    { keycode: "SV_TOGGLE_23_67", label: "MO 23" },
    { keycode: "SV_TOGGLE_45_67", label: "MO 45" },
    { keycode: "SV_SCROLL_HOLD", label: "Scroll Hol" },
    { keycode: "SV_SCROLL_TOGGLE", label: "Scroll Tog" },
    { keycode: "SV_OUTPUT_STATUS", label: "Status" },
    { keycode: "SV_LEFT_DPI_INC", label: "Left DPI +" },
    { keycode: "SV_LEFT_DPI_DEC", label: "Left DPI -" },
    { keycode: "SV_RIGHT_DPI_INC", label: "Right DPI +" },
    { keycode: "SV_RIGHT_DPI_DEC", label: "Right DPI -" },
    { keycode: "SV_LEFT_SCROLL_TOGGLE", label: "Scroll Left" },
    { keycode: "SV_RIGHT_SCROLL_TOGGLE", label: "Scroll Right" },
] as const;

/**
 * MousePanel displays all available mouse-related keycodes in a scrollable list.
 * Each key can be clicked to assign it to the currently selected keyboard position.
 * 
 * The panel uses the shared SidebarItemRow component for consistent styling
 * with other panels like Tap Dances and Combos.
 */
interface Props {
    isPicker?: boolean;
}

const MousePanel: React.FC<Props> = ({ isPicker }) => {
    const { keyboard } = useVial();
    const { assignKeycode } = useKeyBinding();
    const { selectedLayer } = useLayer();

    // Memoize hover colors based on selected layer
    const hoverStyles = useMemo(() => {
        if (!keyboard) return null;

        const layerColorName = keyboard.cosmetic?.layer_colors?.[selectedLayer] || "primary";

        return {
            layerColorName,
            hoverBorderColor: hoverBorderClasses[layerColorName] || hoverBorderClasses.primary,
            hoverBackgroundColor: hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses.primary,
            hoverHeaderClass: hoverHeaderClasses[layerColorName] || hoverHeaderClasses.primary,
        };
    }, [keyboard, selectedLayer]);

    if (!keyboard || !hoverStyles) {
        return null;
    }

    return (
        <section className="flex h-full max-h-full flex-col space-y-3 pt-3">
            {isPicker && (
                <div className="pb-2">
                    <span className="font-semibold text-xl text-slate-700">Mouse</span>
                </div>
            )}
            <div className="scrollbar-thin flex flex-grow flex-col overflow-auto">
                {MOUSE_KEYS.map((mouseKey, index) => {
                    const keyContents = getKeyContents(keyboard, mouseKey.keycode) as KeyContent;
                    const displayLabel = keyService.define(mouseKey.keycode)?.str || mouseKey.label;

                    return (
                        <SidebarItemRow
                            key={mouseKey.keycode}
                            index={index}
                            keyboard={keyboard}
                            keycode={mouseKey.keycode}
                            label={displayLabel}
                            keyContents={keyContents}
                            onAssignKeycode={assignKeycode}
                            hoverBorderColor={hoverStyles.hoverBorderColor}
                            hoverBackgroundColor={hoverStyles.hoverBackgroundColor}
                            hoverLayerColor={hoverStyles.layerColorName}
                            hoverHeaderClass={hoverStyles.hoverHeaderClass}
                            showIndex={false}
                        />
                    );
                })}
            </div>
        </section>
    );
};

MousePanel.displayName = "MousePanel";

export default MousePanel;
