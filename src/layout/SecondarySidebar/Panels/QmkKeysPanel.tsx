import { getKeyContents } from "@/utils/keys";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useLayer } from "@/contexts/LayerContext";
import { useVial } from "@/contexts/VialContext";
import { hoverBackgroundClasses, hoverBorderClasses, hoverHeaderClasses } from "@/utils/colors";
import { Key } from "@/components/Key";

interface Props {
    isPicker?: boolean;
}

const QmkKeyPanel = ({ isPicker }: Props) => {
    const { assignKeycode } = useKeyBinding();
    const { keyboard } = useVial();
    const { selectedLayer } = useLayer();

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];
    const hoverHeaderClass = hoverHeaderClasses[layerColorName] || hoverHeaderClasses["primary"];

    const handleKeyClick = (keycode: string) => {
        assignKeycode(keycode);
    };

    const renderKey = (keycode: string, label: string) => {
        return (
            <Key
                key={keycode}
                x={0} y={0} w={1} h={1} row={0} col={0}
                keycode={keycode}
                label={label}
                keyContents={getKeyContents(keyboard!, keycode)}
                layerColor="sidebar"
                headerClassName={`bg-kb-sidebar-dark ${hoverHeaderClass}`}
                isRelative
                className="h-[60px] w-[60px]"
                onClick={() => handleKeyClick(keycode)}
                hoverBorderColor={hoverBorderColor}
                hoverBackgroundColor={hoverBackgroundColor}
                hoverLayerColor={layerColorName}
            />
        );
    };

    return (
        <div className="space-y-6 pt-3 pb-8">
            {isPicker && (
                <div className="pb-2">
                    <span className="font-semibold text-xl text-slate-700">QMK</span>
                </div>
            )}
            {/* One-Shot Modifiers Section */}
            <section className="flex flex-col gap-3">
                <span className="font-semibold text-lg text-slate-700">One-Shot Modifiers</span>

                <div className="flex flex-col gap-2">
                    <span className="text-base font-medium text-black">Left Hand Side</span>
                    <div className="flex flex-wrap gap-2">
                        {renderKey("OSM(MOD_LSFT)", "OSM LSft")}
                        {renderKey("OSM(MOD_LCTL)", "OSM LCtl")}
                        {renderKey("OSM(MOD_LALT)", "OSM LAlt")}
                        {renderKey("OSM(MOD_LGUI)", "OSM LGUI")}
                        {renderKey("OSM(MOD_LCTL|MOD_LSFT)", "OSM CS")}
                        {renderKey("OSM(MOD_LCTL|MOD_LALT)", "OSM CA")}
                        {renderKey("OSM(MOD_LCTL|MOD_LGUI)", "OSM CG")}
                        {renderKey("OSM(MOD_LSFT|MOD_LALT)", "OSM SA")}
                        {renderKey("OSM(MOD_LSFT|MOD_LGUI)", "OSM SG")}
                        {renderKey("OSM(MOD_LALT|MOD_LGUI)", "OSM AG")}
                        {renderKey("OSM(MOD_LCTL|MOD_LSFT|MOD_LGUI)", "OSM CSG")}
                        {renderKey("OSM(MOD_LCTL|MOD_LALT|MOD_LGUI)", "OSM CAG")}
                        {renderKey("OSM(MOD_LSFT|MOD_LALT|MOD_LGUI)", "OSM SAG")}
                        {renderKey("OSM(MOD_MEH)", "OSM Meh")}
                        {renderKey("OSM(MOD_HYPR)", "OSM Hyper")}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-base font-medium text-black">Right Hand Side</span>
                    <div className="flex flex-wrap gap-2">
                        {renderKey("OSM(MOD_RSFT)", "OSM RSft")}
                        {renderKey("OSM(MOD_RCTL)", "OSM RCtl")}
                        {renderKey("OSM(MOD_RALT)", "OSM RAlt")}
                        {renderKey("OSM(MOD_RGUI)", "OSM RGUI")}
                        {renderKey("OSM(MOD_RCTL|MOD_RSFT)", "OSM RCS")}
                        {renderKey("OSM(MOD_RCTL|MOD_RALT)", "OSM RCA")}
                        {renderKey("OSM(MOD_RCTL|MOD_RGUI)", "OSM RCG")}
                        {renderKey("OSM(MOD_RSFT|MOD_RALT)", "OSM RSA")}
                        {renderKey("OSM(MOD_RSFT|MOD_RGUI)", "OSM RSG")}
                        {renderKey("OSM(MOD_RALT|MOD_RGUI)", "OSM RAG")}
                        {renderKey("OSM(MOD_RCTL|MOD_RSFT|MOD_RGUI)", "OSM RCSG")}
                        {renderKey("OSM(MOD_RCTL|MOD_RALT|MOD_RGUI)", "OSM RCAG")}
                        {renderKey("OSM(MOD_RSFT|MOD_RALT|MOD_RGUI)", "OSM RSAG")}
                        {renderKey("OSM(MOD_RCTL|MOD_RSFT|MOD_RALT)", "OSM RMeh")}
                        {renderKey("OSM(MOD_RCTL|MOD_RSFT|MOD_RALT|MOD_RGUI)", "OSM RHyp")}
                    </div>
                </div>
            </section>

            {/* ModMasks Section */}
            <section className="flex flex-col gap-3">
                <span className="font-semibold text-lg text-slate-700">Mod-Tap / ModMasks</span>

                <div className="flex flex-col gap-2">
                    <span className="text-base font-medium text-black">Left Hand Side</span>
                    <div className="flex flex-wrap gap-2">
                        {renderKey("LCTL(kc)", "LCTL (kc)")}
                        {renderKey("LSFT(kc)", "LSFT (kc)")}
                        {renderKey("C_S(kc)", "C_S (kc)")}
                        {renderKey("LALT(kc)", "LALT (kc)")}
                        {renderKey("LCA(kc)", "LCA (kc)")}
                        {renderKey("LSA(kc)", "LSA (kc)")}
                        {renderKey("MEH(kc)", "MEH (kc)")}
                        {renderKey("LGUI(kc)", "LGUI (kc)")}
                        {renderKey("LCG(kc)", "LCG (kc)")}
                        {renderKey("SGUI(kc)", "SGUI (kc)")}
                        {renderKey("LSCG(kc)", "LSCG (kc)")}
                        {renderKey("LAG(kc)", "LAG (kc)")}
                        {renderKey("LCAG(kc)", "LCAG (kc)")}
                        {renderKey("LSAG(kc)", "LSAG (kc)")}
                        {renderKey("HYPR(kc)", "HYPR (kc)")}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-base font-medium text-black">Right Hand Side</span>
                    <div className="flex flex-wrap gap-2">
                        {renderKey("RCTL(kc)", "RCTL (kc)")}
                        {renderKey("RSFT(kc)", "RSFT (kc)")}
                        {renderKey("RSC(kc)", "RSC (kc)")}
                        {renderKey("RALT(kc)", "RALT (kc)")}
                        {renderKey("RCA(kc)", "RCA (kc)")}
                        {renderKey("RSA(kc)", "RSA (kc)")}
                        {renderKey("RSCA(kc)", "RSCA (kc)")}
                        {renderKey("RGUI(kc)", "RGUI (kc)")}
                        {renderKey("RCG(kc)", "RCG (kc)")}
                        {renderKey("RSG(kc)", "RSG (kc)")}
                        {renderKey("RSCG(kc)", "RSCG (kc)")}
                        {renderKey("RAG(kc)", "RAG (kc)")}
                        {renderKey("RCAG(kc)", "RCAG (kc)")}
                        {renderKey("RSAG(kc)", "RSAG (kc)")}
                        {renderKey("RSCAG(kc)", "RSCAG (kc)")}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default QmkKeyPanel;
