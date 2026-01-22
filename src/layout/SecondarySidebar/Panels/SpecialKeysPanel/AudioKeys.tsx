import { Key } from "@/components/Key";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useLayer } from "@/contexts/LayerContext";
import { useVial } from "@/contexts/VialContext";
import { keyService } from "@/services/key.service";

import { hoverBackgroundClasses, hoverBorderClasses, hoverHeaderClasses } from "@/utils/colors";

const AudioKeys = () => {
    const { assignKeycode } = useKeyBinding();
    const { keyboard } = useVial();
    const { selectedLayer } = useLayer();

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];
    const hoverHeaderClass = hoverHeaderClasses[layerColorName] || hoverHeaderClasses["primary"];

    const keys = [
        { keycode: "AU_ON", label: "Audio ON" },
        { keycode: "AU_OFF", label: "Audio OFF" },
        { keycode: "AU_TOG", label: "Audio Toggle" },
        { keycode: "CLICKY_TOGGLE", label: "Clicky Toggle" },
        { keycode: "CLICKY_UP", label: "Clicky Up" },
        { keycode: "CLICKY_DOWN", label: "Clicky Down" },
        { keycode: "CLICKY_RESET", label: "Clicky Reset" },
        { keycode: "MU_ON", label: "Music On" },
        { keycode: "MU_OFF", label: "Music Off" },
        { keycode: "MU_TOG", label: "Music Toggle" },
        { keycode: "MU_MOD", label: "Music Cycle" },
        { keycode: "HPT_ON", label: "Haptic On" },
        { keycode: "HPT_OFF", label: "Haptic Off" },
        { keycode: "HPT_TOG", label: "Haptic Toggle" },
        { keycode: "HPT_RST", label: "Haptic Reset" },
        { keycode: "HPT_FBK", label: "Haptic Feed back" },
        { keycode: "HPT_BUZ", label: "Haptic Buzz" },
        { keycode: "HPT_MODI", label: "Haptic Next" },
        { keycode: "HPT_MODD", label: "Haptic Prev" },
        { keycode: "HPT_CONT", label: "Haptic Cont." },
        { keycode: "HPT_CONI", label: "Haptic +" },
        { keycode: "HPT_COND", label: "Haptic -" },
        { keycode: "HPT_DWLI", label: "Haptic Dwell+" },
        { keycode: "HPT_DWLD", label: "Haptic Dwell-" },
        { keycode: "KC_ASDN", label: "Auto- shift Down" },
        { keycode: "KC_ASUP", label: "Auto- shift Up" },
        { keycode: "KC_ASRP", label: "Auto- shift Report" },
        { keycode: "KC_ASON", label: "Auto- shift On" },
        { keycode: "KC_ASOFF", label: "Auto- shift Off" },
        { keycode: "KC_ASTG", label: "Auto- shift Toggle" },
        { keycode: "CMB_ON", label: "Combo On" },
        { keycode: "CMB_OFF", label: "Combo Off" },
        { keycode: "CMB_TOG", label: "Combo Toggle" },
    ];

    return (
        <div className="flex flex-col gap-2">
            <span className="font-semibold text-lg text-slate-700">Audio and Haptic Keys</span>
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
                            headerClassName={`bg-kb-sidebar-dark ${hoverHeaderClass}`}
                            isRelative
                            className="h-[60px] w-[60px]"
                            hoverBorderColor={hoverBorderColor}
                            hoverBackgroundColor={hoverBackgroundColor}
                            hoverLayerColor={layerColorName}
                            onClick={() => assignKeycode(k.keycode)}
                        />
                    ))}
            </div>
        </div>
    );
};

export default AudioKeys;
