import { Key } from "@/components/Key";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useLayer } from "@/contexts/LayerContext";
import { useVial } from "@/contexts/VialContext";
import { keyService } from "@/services/key.service";

import { hoverBackgroundClasses, hoverBorderClasses } from "@/utils/colors";

const StenoKeys = () => {
    const { assignKeycode } = useKeyBinding();
    const { keyboard } = useVial();
    const { selectedLayer } = useLayer();

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];

    const group1Keys = [
        { keycode: "STN_N1", label: "#₁" },
        { keycode: "STN_N2", label: "#₂" },
        { keycode: "STN_N3", label: "#₃" },
        { keycode: "STN_N4", label: "#₄" },
        { keycode: "STN_N5", label: "#₅" },
        { keycode: "STN_S1", label: "S-₁" },
        { keycode: "STN_TL", label: "T-" },
        { keycode: "STN_PL", label: "P-" },
        { keycode: "STN_HL", label: "H-" },
        { keycode: "STN_ST1", label: "*₁" },
        { keycode: "STN_S3", label: "SS-" },
        { keycode: "STN_TKL", label: "TK-" },
        { keycode: "STN_PWL", label: "PW-" },
        { keycode: "STN_HRL", label: "H-" },
        { keycode: "STN_S2", label: "S-₂" },
        { keycode: "STN_KL", label: "K-" },
        { keycode: "STN_WL", label: "W-" },
        { keycode: "STN_RL", label: "R-" },
        { keycode: "STN_ST2", label: "*₂" },
        { keycode: "STN_A", label: "A" },
        { keycode: "STN_O", label: "O" },
    ];

    const group2Keys = [
        { keycode: "STN_N7", label: "#₇" },
        { keycode: "STN_N8", label: "#₈" },
        { keycode: "STN_N9", label: "#₉" },
        { keycode: "STN_NA", label: "#₁₀" },
        { keycode: "STN_NB", label: "#₁₁" },
        { keycode: "STN_NC", label: "#₁₂" },
        { keycode: "STN_ST3", label: "*₃" },
        { keycode: "STN_FR", label: "-F" },
        { keycode: "STN_PR", label: "-P" },
        { keycode: "STN_LR", label: "-L" },
        { keycode: "STN_TR", label: "-T" },
        { keycode: "STN_DR", label: "-D" },
        { keycode: "STN_FRR", label: "-FR" },
        { keycode: "STN_PBR", label: "-PB" },
        { keycode: "STN_LGR", label: "-LG" },
        { keycode: "STN_TSR", label: "-TS" },
        { keycode: "STN_DZR", label: "-DZ" },
        { keycode: "STN_ST4", label: "*₄" },
        { keycode: "STN_RR", label: "-R" },
        { keycode: "STN_BR", label: "-B" },
        { keycode: "STN_GR", label: "-G" },
        { keycode: "STN_SR", label: "-S" },
        { keycode: "STN_ZR", label: "-Z" },
        { keycode: "STN_E", label: "E" },
        { keycode: "STN_U", label: "U" },
    ];

    const keys = [
        ...group1Keys,
        ...group2Keys
    ];

    return (
        <div className="flex flex-col gap-2">
            <span className="font-semibold text-lg text-slate-700">Steno Keys</span>
            <div className="flex flex-wrap gap-2">
                {keys.map((k) => (
                    <Key
                        key={k.keycode}
                        x={0}
                        y={0}
                        w={1}
                        h={1}
                        row={0}
                        col={0}
                        keycode={k.keycode}
                        label={keyService.define(k.keycode)?.str || k.label}
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

export default StenoKeys;
