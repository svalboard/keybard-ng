import { useVial } from "@/contexts/VialContext";
import { getKeyContents } from "@/utils/keys";
import { FC } from "react";
import { Key } from "@/components/Key";
import { useLayer } from "@/contexts/LayerContext";
import { hoverBackgroundClasses, hoverBorderClasses, hoverHeaderClasses } from "@/utils/colors";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { usePanels } from "@/contexts/PanelsContext";
import { cn } from "@/lib/utils";

import { Trash2 } from "lucide-react";
// ... (imports)

interface Props {
    label?: string;
    binding?: any;
    index: number;
    onDelete?: () => void;
}

const MacroEditorKey: FC<Props> = ({ label, binding, index, onDelete }) => {
    const { keyboard } = useVial();
    const { selectedLayer } = useLayer();
    const { selectMacroKey, selectedTarget } = useKeyBinding();
    const { itemToEdit: mid } = usePanels();

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];
    const hoverHeaderClass = hoverHeaderClasses[layerColorName] || hoverHeaderClasses["primary"];

    const isSelected = selectedTarget?.type === "macro" && selectedTarget.macroId === mid && selectedTarget.macroIndex === index;

    const keycode = binding || "KC_NO";
    const keyContents = getKeyContents(keyboard!, keycode);
    const hasContent = binding && binding !== "" && binding !== "KC_NO";

    let keyColor: string | undefined;
    let keyClassName: string;
    let headerClass: string;

    if (isSelected) {
        // Selected: Red Border, transparent-ish BG? Or let Key handle it?
        // Tapdance uses: keyColor=undefined, keyClass="border-2 border-red-600", header="bg-black/20"
        keyColor = undefined;
        keyClassName = "border-2 border-red-600";
        headerClass = "bg-black/20";
    } else if (hasContent) {
        // Assigned: Black Key
        // keyColor="sidebar" (which usually means black/dark grey), keyClass="border-kb-gray"
        keyColor = "sidebar";
        keyClassName = "border-kb-gray";
        headerClass = "bg-kb-sidebar-dark";
    } else {
        // Empty: Transparent + Black Border
        keyColor = undefined;
        keyClassName = "bg-transparent border-2 border-black";
        headerClass = "text-black";
    }

    return (
        <div className="relative w-full">
            <div className="flex flex-row justify-start items-center gap-4 peer">
                <div className="flex-shrink-0 relative w-[60px] h-[60px]">
                    <Key
                        isRelative
                        x={0}
                        y={0}
                        w={1}
                        h={1}
                        row={-1}
                        col={-1}
                        keycode={keycode}
                        label={keyContents?.str || ""}
                        keyContents={keyContents}
                        layerColor={keyColor}
                        headerClassName={isSelected ? headerClass : (hasContent ? `bg-kb-sidebar-dark ${hoverHeaderClass}` : headerClass)}
                        className={cn("w-full h-full", keyClassName)}
                        hoverBorderColor={hoverBorderColor}
                        hoverBackgroundColor={hoverBackgroundColor}
                        hoverLayerColor={layerColorName}
                        selected={isSelected}
                        onClick={() => selectMacroKey(mid!, index)}
                    />
                </div>
                <div className="flex flex-row items-center flex-grow">
                    {label && <div className="font-medium text-gray-600 px-2">{label}</div>}
                </div>
            </div>
            {onDelete && (
                <div className="absolute -left-10 top-0 h-full flex items-center justify-center opacity-0 peer-hover:opacity-100 hover:opacity-100 transition-opacity">
                    <button
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                        onClick={onDelete}
                        title="Delete item"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default MacroEditorKey;
