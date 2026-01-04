import { Key } from "@/components/Key";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useLayer } from "@/contexts/LayerContext";
import { useVial } from "@/contexts/VialContext";
import { hoverBackgroundClasses, hoverBorderClasses } from "@/utils/colors";
import { getKeyContents } from "@/utils/keys";
import { keyService } from "@/services/key.service";
import { KeyContent } from "@/types/vial.types";

const mouseKeys = [
    { keycode: "KC_BTN1", label: "Mouse 1" },
    { keycode: "KC_BTN2", label: "Mouse 2" },
    { keycode: "KC_BTN3", label: "Mouse 3" },
    { keycode: "KC_BTN4", label: "Mouse 4" },
    { keycode: "KC_BTN5", label: "Mouse 5" },
    { keycode: "KC_MS_U", label: "Mouse Up" },
    { keycode: "KC_MS_D", label: "Mouse Down" },
    { keycode: "KC_MS_L", label: "Mouse Left" },
    { keycode: "KC_MS_R", label: "Mouse Right" },
    { keycode: "KC_WH_U", label: "Mouse Wheel Up" },
    { keycode: "KC_WH_D", label: "Mouse Wheel Down" },
    { keycode: "KC_WH_L", label: "Mouse Wheel Left" },
    { keycode: "KC_WH_R", label: "Mouse Wheel Right" },
    { keycode: "KC_ACL0", label: "Mouse Accelerate 0" },
    { keycode: "KC_ACL1", label: "Mouse Accelerate 1" },
    { keycode: "KC_ACL2", label: "Mouse Accelerate 2" },
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
];

const MousePanel = () => {
    const { keyboard } = useVial();
    const { assignKeycode } = useKeyBinding();
    const { selectedLayer } = useLayer();

    if (!keyboard) return null;

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];

    return (
        <section className="space-y-3 h-full max-h-full flex flex-col">
            <div className="flex flex-col overflow-auto flex-grow scrollbar-thin">
                {mouseKeys.map((k) => {
                    const keyContents = getKeyContents(keyboard, k.keycode);
                    const displayLabel = keyService.define(k.keycode)?.str || k.label || k.keycode;

                    return (
                        <div key={k.keycode} className="flex flex-row items-end py-0 panel-layer-item group/item relative pl-2 pr-2">
                            {/* Label and Dotted Leader */}
                            <div className="flex-grow flex flex-row items-end mb-2 min-w-0 relative h-6 mr-3 ml-1">
                                <div className="absolute left-[-4px] right-0 bottom-[2px] h-[2px] sidebar-dotted-line pointer-events-none" />
                                <div className="relative z-10 flex flex-row items-end gap-2 bg-transparent min-w-0 flex-shrink">
                                    <span className="text-md font-medium truncate pr-0">
                                        {displayLabel}
                                    </span>
                                </div>
                                <div className="flex-grow min-w-0" />
                            </div>

                            {/* Key Component */}
                            <div className="flex flex-row flex-shrink-0 items-center gap-1 mb-1.5">
                                <Key
                                    x={0} y={0} w={1} h={1} row={0} col={0}
                                    keycode={k.keycode}
                                    label={displayLabel}
                                    keyContents={keyContents as KeyContent | undefined}
                                    layerColor="sidebar"
                                    headerClassName="bg-kb-sidebar-dark group-hover:bg-black/30"
                                    isRelative
                                    className="h-[60px] w-[60px]"
                                    hoverBorderColor={hoverBorderColor}
                                    hoverBackgroundColor={hoverBackgroundColor}
                                    onClick={() => assignKeycode(k.keycode)}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default MousePanel;
