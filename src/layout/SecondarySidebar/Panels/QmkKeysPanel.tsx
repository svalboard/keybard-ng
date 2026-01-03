import { getKeyContents, showModMask } from "@/utils/keys";

import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useLayer } from "@/contexts/LayerContext";
import { useVial } from "@/contexts/VialContext";
import { hoverBackgroundClasses, hoverBorderClasses } from "@/utils/colors";
import { cn } from "@/lib/utils";
import { FC } from "react";

interface KeyButtonProps {
    keycode: string;
    label: string;
    title?: string;
    onClick: (keycode: string) => void;
    hoverBorderColor?: string;
    hoverBackgroundColor?: string;
}

const KeyButton: FC<KeyButtonProps> = ({ keycode, label, title, onClick, hoverBorderColor, hoverBackgroundColor }) => {
    const { keyboard } = useVial();
    const keyContents = getKeyContents(keyboard!, keycode);
    const show = showModMask((keyContents as any).modids);
    return (
        <div
            className={cn(
                "bg-kb-grey text-white h-14 w-14 rounded-md cursor-pointer hover:border-2 border-transparent transition-all flex flex-col items-center justify-center text-center text-xs font-medium",
                hoverBorderColor ? hoverBorderColor : "hover:border-red-600",
                hoverBackgroundColor && hoverBackgroundColor
            )}
            onClick={() => onClick(keycode)}
            title={title || keycode}
            aria-label={label}
        >
            {!show && <div className="text-[10px] bg-black/40 w-full rounded-t-sm">{(keyContents as any)?.top}</div>}
            <div className="h-full items-center flex text-[10px]">{keyContents?.str}</div>
            <div className="text-[10px] bg-black/40 w-full rounded-b-sm">{show}</div>
        </div>
    );
};

const QmkKeyPanel = () => {
    const { assignKeycode } = useKeyBinding();
    const { keyboard } = useVial();
    const { selectedLayer } = useLayer();

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];

    const handleKeyClick = (keycode: string) => {
        assignKeycode(keycode);
    };

    return (
        <div className="flex flex-col gap-6 p-2">
            {/* One-Shot Modifiers Section */}
            <div>
                <h3 className="font-semibold text-lg text-slate-700 mb-3">One-Shot Modifiers</h3>

                {/* One-Shot LHS */}
                <div className="mb-4">
                    <div className="text-sm font-medium text-slate-600 mb-2">Left Hand Side (LHS)</div>
                    <div className="flex flex-wrap gap-2 mb-2">
                        <KeyButton keycode="OSM(MOD_LSFT)" label="OSM LSft" title="Enable Left Shift for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_LCTL)" label="OSM LCtl" title="Enable Left Control for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_LALT)" label="OSM LAlt" title="Enable Left Alt for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_LGUI)" label="OSM LGUI" title="Enable Left GUI for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_LCTL|MOD_LSFT)" label="OSM CS" title="Enable Left Control and Shift for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_LCTL|MOD_LALT)" label="OSM CA" title="Enable Left Control and Alt for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_LCTL|MOD_LGUI)" label="OSM CG" title="Enable Left Control and GUI for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <KeyButton keycode="OSM(MOD_LSFT|MOD_LALT)" label="OSM SA" title="Enable Left Shift and Alt for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_LSFT|MOD_LGUI)" label="OSM SG" title="Enable Left Shift and GUI for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_LALT|MOD_LGUI)" label="OSM AG" title="Enable Left Alt and GUI for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton
                            keycode="OSM(MOD_LCTL|MOD_LSFT|MOD_LGUI)"
                            label="OSM CSG"
                            title="Enable Left Control, Shift, and GUI for one keypress"
                            onClick={handleKeyClick}
                            hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor}
                        />
                        <KeyButton keycode="OSM(MOD_LCTL|MOD_LALT|MOD_LGUI)" label="OSM CAG" title="Enable Left Control, Alt, and GUI for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_LSFT|MOD_LALT|MOD_LGUI)" label="OSM SAG" title="Enable Left Shift, Alt, and GUI for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_MEH)" label="OSM Meh" title="Enable Left Control, Shift, and Alt for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_HYPR)" label="OSM Hyper" title="Enable Left Control, Shift, Alt, and GUI for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                    </div>
                </div>

                {/* One-Shot RHS */}
                <div>
                    <div className="text-sm font-medium text-slate-600 mb-2">Right Hand Side (RHS)</div>
                    <div className="flex flex-wrap gap-2 mb-2">
                        <KeyButton keycode="OSM(MOD_RSFT)" label="OSM RSft" title="Enable Right Shift for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_RCTL)" label="OSM RCtl" title="Enable Right Control for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_RALT)" label="OSM RAlt" title="Enable Right Alt for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_RGUI)" label="OSM RGUI" title="Enable Right GUI for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_RCTL|MOD_RSFT)" label="OSM RCS" title="Enable Right Control and Shift for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_RCTL|MOD_RALT)" label="OSM RCA" title="Enable Right Control and Alt for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_RCTL|MOD_RGUI)" label="OSM RCG" title="Enable Right Control and GUI for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <KeyButton keycode="OSM(MOD_RSFT|MOD_RALT)" label="OSM RSA" title="Enable Right Shift and Alt for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_RSFT|MOD_RGUI)" label="OSM RSG" title="Enable Right Shift and GUI for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="OSM(MOD_RALT|MOD_RGUI)" label="OSM RAG" title="Enable Right Alt and GUI for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton
                            keycode="OSM(MOD_RCTL|MOD_RSFT|MOD_RGUI)"
                            label="OSM RCSG"
                            title="Enable Right Control, Shift, and GUI for one keypress"
                            onClick={handleKeyClick}
                            hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor}
                        />
                        <KeyButton
                            keycode="OSM(MOD_RCTL|MOD_RALT|MOD_RGUI)"
                            label="OSM RCAG"
                            title="Enable Right Control, Alt, and GUI for one keypress"
                            onClick={handleKeyClick}
                            hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor}
                        />
                        <KeyButton keycode="OSM(MOD_RSFT|MOD_RALT|MOD_RGUI)" label="OSM RSAG" title="Enable Right Shift, Alt, and GUI for one keypress" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton
                            keycode="OSM(MOD_RCTL|MOD_RSFT|MOD_RALT)"
                            label="OSM RMeh"
                            title="Enable Right Control, Shift, and Alt for one keypress"
                            onClick={handleKeyClick}
                            hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor}
                        />
                        <KeyButton
                            keycode="OSM(MOD_RCTL|MOD_RSFT|MOD_RALT|MOD_RGUI)"
                            label="OSM RHyp"
                            title="Enable Right Control, Shift, Alt, and GUI for one keypress"
                            onClick={handleKeyClick}
                            hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor}
                        />
                    </div>
                </div>
            </div>

            {/* ModMasks Section */}
            <div>
                <h3 className="font-semibold text-lg text-slate-700 mb-3">Mod-Tap / ModMasks</h3>

                {/* LHS ModMasks */}
                <div className="mb-4">
                    <div className="text-sm font-medium text-slate-600 mb-2">Left Hand Side (LHS)</div>
                    <div className="flex flex-wrap gap-2 mb-2">
                        <KeyButton keycode="LCTL(kc)" label="LCTL (kc)" title="LCtrl + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="LSFT(kc)" label="LSFT (kc)" title="LShift + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="C_S(kc)" label="C_S (kc)" title="LCtrl + LShift + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="LALT(kc)" label="LALT (kc)" title="LAlt + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="LCA(kc)" label="LCA (kc)" title="LCtrl + LAlt + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="LSA(kc)" label="LSA (kc)" title="LShift + LAlt + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="MEH(kc)" label="MEH (kc)" title="LShift + LCtrl + LAlt + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <KeyButton keycode="LGUI(kc)" label="LGUI (kc)" title="LGUI + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="LCG(kc)" label="LCG (kc)" title="LCtrl + LGUI + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="SGUI(kc)" label="SGUI (kc)" title="LShift + LGUI + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="LSCG(kc)" label="LSCG (kc)" title="LShift + LCtrl + LGUI + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="LAG(kc)" label="LAG (kc)" title="LAlt + LGUI + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="LCAG(kc)" label="LCAG (kc)" title="LCtrl + LAlt + LGUI + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="LSAG(kc)" label="LSAG (kc)" title="LShift + LAlt + LGUI + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="HYPR(kc)" label="HYPR (kc)" title="LShift + LCtrl + LAlt + LGUI + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                    </div>
                </div>

                {/* RHS ModMasks */}
                <div>
                    <div className="text-sm font-medium text-slate-600 mb-2">Right Hand Side (RHS)</div>
                    <div className="flex flex-wrap gap-2 mb-2">
                        <KeyButton keycode="RCTL(kc)" label="RCTL (kc)" title="RCtrl + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="RSFT(kc)" label="RSFT (kc)" title="RSFT (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="RSC(kc)" label="RSC (kc)" title="RShift + RCtrl + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="RALT(kc)" label="RALT (kc)" title="RAlt + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="RCA(kc)" label="RCA (kc)" title="RCtrl + RAlt + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="RSA(kc)" label="RSA (kc)" title="RShift + RAlt + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="RSCA(kc)" label="RSCA (kc)" title="RShift + RCtrl + RAlt + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <KeyButton keycode="RGUI(kc)" label="RGUI (kc)" title="RGUI + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="RCG(kc)" label="RCG (kc)" title="RCtrl + RGUI + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="RSG(kc)" label="RSG (kc)" title="RShift + RGUI + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="RSCG(kc)" label="RSCG (kc)" title="RShift + RCtrl + RGUI + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="RAG(kc)" label="RAG (kc)" title="RAlt + RGUI + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="RCAG(kc)" label="RCAG (kc)" title="RCtrl + RAlt + RGUI + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="RSAG(kc)" label="RSAG (kc)" title="RShift + RAlt + RGUI + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                        <KeyButton keycode="RSCAG(kc)" label="RSCAG (kc)" title="RShift + RCtrl + RAlt + RGUI + (kc)" onClick={handleKeyClick} hoverBorderColor={hoverBorderColor} hoverBackgroundColor={hoverBackgroundColor} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QmkKeyPanel;
