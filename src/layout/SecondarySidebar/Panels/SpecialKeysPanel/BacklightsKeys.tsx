import { Key } from "@/components/Key";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useLayer } from "@/contexts/LayerContext";
import { useVial } from "@/contexts/VialContext";
import { keyService } from "@/services/key.service";

import { hoverBackgroundClasses, hoverBorderClasses } from "@/utils/colors";

const BacklightsKeys = () => {
    const { assignKeycode } = useKeyBinding();
    const { keyboard } = useVial();
    const { selectedLayer } = useLayer();

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];

    const keys = [
        { keycode: "BL_TOGG", label: "BL Toggle" },
        { keycode: "BL_STEP", label: "BL Cycle" },
        { keycode: "BL_BRTG", label: "BL Breath" },
        { keycode: "BL_ON", label: "BL On" },
        { keycode: "BL_OFF", label: "BL Off" },
        { keycode: "BL_INC", label: "BL +" },
        { keycode: "BL_DEC", label: "BL -" },
        { keycode: "RGB_TOG", label: "RGB Toggle" },
        { keycode: "RGB_MOD", label: "RGB Mode +" },
        { keycode: "RGB_RMOD", label: "RGB Mode -" },
        { keycode: "RGB_HUI", label: "Hue +" },
        { keycode: "RGB_HUD", label: "Hue -" },
        { keycode: "RGB_SAI", label: "Sat +" },
        { keycode: "RGB_SAD", label: "Sat -" },
        { keycode: "RGB_VAI", label: "Bright +" },
        { keycode: "RGB_VAD", label: "Bright -" },
        { keycode: "RGB_SPI", label: "Effect +" },
        { keycode: "RGB_SPD", label: "Effect -" },
        { keycode: "RGB_M_P", label: "RGB Mode P" },
        { keycode: "RGB_M_B", label: "RGB Mode B" },
        { keycode: "RGB_M_R", label: "RGB Mode R" },
        { keycode: "RGB_M_SW", label: "RGB Mode SW" },
        { keycode: "RGB_M_SN", label: "RGB Mode SN" },
        { keycode: "RGB_M_K", label: "RGB Mode K" },
        { keycode: "RGB_M_X", label: "RGB Mode X" },
        { keycode: "RGB_M_G", label: "RGB Mode G" },
        { keycode: "RGB_M_T", label: "RGB Mode T" },
    ];

    return (
        <div className="flex flex-col gap-2">
            <span className="font-semibold text-lg text-slate-700">Backlight and RGB Keys</span>
            <div className="flex flex-wrap gap-2">
                {keys
                    .map((k) => ({ ...k, displayLabel: keyService.define(k.keycode)?.str || k.label }))
                    .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel))
                    .map((k) => (
                        <Key
                            key={k.keycode}
                            x={0}
                            y={0}
                            w={1}
                            h={1}
                            row={0}
                            col={0}
                            keycode={k.keycode}
                            label={k.displayLabel}
                            layerColor="sidebar"
                            headerClassName="bg-kb-sidebar-dark"
                            isRelative
                            className="h-[60px] w-[60px]"
                            hoverBorderColor={hoverBorderColor}
                            hoverBackgroundColor={hoverBackgroundColor}
                            onClick={() => assignKeycode(k.keycode)}
                        />
                    ))}
            </div>
        </div>
    );
};

export default BacklightsKeys;
