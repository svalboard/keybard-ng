import { GripVerticalIcon, PencilIcon } from "lucide-react";
import React from "react";

import { Key } from "@/components/Key";
import { Button } from "@/components/ui/button";
import { useLayer } from "@/contexts/LayerContext";
import { usePanels } from "@/contexts/PanelsContext";
import { useVial } from "@/contexts/VialContext";
import { KeyboardInfo } from "@/types/vial.types";
import { hoverBackgroundClasses, hoverBorderClasses } from "@/utils/colors";

interface ComboRowProps {
    index: number;
    keyboard: KeyboardInfo; // Kept for consistency, even if unused for key content
    onEdit: (index: number) => void;
    hoverBorderColor?: string;
    hoverBackgroundColor?: string;
}

/**
 * Renders a single row in the Combos panel.
 * Matches TapdanceRow/MacroRow styling: dotted line, no dot, custom key.
 */
const ComboRow: React.FC<ComboRowProps> = React.memo(({ index, onEdit, hoverBorderColor, hoverBackgroundColor }) => {
    // For combos, we don't have a standard keycode resolution like TD() or M().
    // We'll just display the index on the key.

    return (
        <div className="flex flex-row items-end py-0 panel-layer-item group/item relative pl-6 pr-2">
            {/* Drag Handle - centered vertically in the 60px row */}
            <div className="absolute left-0 top-0 h-[60px] flex items-center justify-center w-6 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <GripVerticalIcon className="h-3 w-3 text-muted-foreground" />
            </div>

            {/* Index */}
            <div
                className="flex flex-row items-center flex-shrink-0 mb-2 gap-2 cursor-pointer"
                title={`Combo ${index}`}
                onDoubleClick={() => onEdit(index)}
            >
                <span className="text-md font-semibold w-5 text-center flex-shrink-0 text-black">{index}</span>
            </div>

            {/* Label Area - With dotted line */}
            <div
                className="flex-grow flex flex-row items-end mb-2 min-w-0 relative h-6 mr-3 ml-1 cursor-pointer"
                onDoubleClick={() => onEdit(index)}
            >
                {/* Visual dotted border baseline */}
                <div className="absolute left-[-4px] right-0 bottom-[2px] h-[2px] sidebar-dotted-line pointer-events-none" />

                <div className="relative z-10 flex flex-row items-end gap-2 bg-transparent min-w-0 flex-shrink">
                    {/* Empty label area */}
                </div>
                {/* Spacer */}
                <div className="flex-grow min-w-0" />
            </div>

            {/* Action Area (Preview Key and Edit Button) */}
            <div className="flex flex-row flex-shrink-0 items-center gap-1 mb-1.5">
                {/* We use a non-interactive Key component just for the visual style */}
                <Key
                    x={0}
                    y={0}
                    w={1}
                    h={1}
                    row={0}
                    col={0}
                    keycode=""
                    label={index.toString()} // Just show the index
                    keyContents={{ type: "combo" }}
                    layerColor="sidebar"
                    headerClassName="bg-kb-sidebar-dark"
                    isRelative
                    className="h-[60px] w-[60px] cursor-default"
                    hoverBorderColor={hoverBorderColor}
                    hoverBackgroundColor={hoverBackgroundColor}
                />

                <div className="w-8 flex justify-center items-center h-[60px]">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 group-hover/item:opacity-100 opacity-0 transition-opacity hover:bg-slate-100"
                        onClick={() => onEdit(index)}
                    >
                        <PencilIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
});

const CombosPanel: React.FC = () => {
    const { keyboard } = useVial();
    const { selectedLayer } = useLayer();
    const {
        setItemToEdit,
        setBindingTypeToEdit,
        setAlternativeHeader,
        setPanelToGoBack,
        setActivePanel,
    } = usePanels();

    if (!keyboard) return null;

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];

    const combos = (keyboard as any)?.combos || [];

    const handleEdit = (index: number) => {
        setItemToEdit(index);
        setBindingTypeToEdit("combos");
        setAlternativeHeader(true);
        setPanelToGoBack("combos");
        setActivePanel("keyboard");
    };

    return (
        <section className="space-y-3 h-full max-h-full flex flex-col pt-3">
            <div className="flex flex-col overflow-auto flex-grow scrollbar-thin">
                {combos.map((_: any, i: number) => (
                    <ComboRow
                        key={i}
                        index={i}
                        keyboard={keyboard}
                        onEdit={handleEdit}
                        hoverBorderColor={hoverBorderColor}
                        hoverBackgroundColor={hoverBackgroundColor}
                    />
                ))}
                {combos.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        No combos found.
                    </div>
                )}
            </div>
        </section>
    );
};

export default CombosPanel;
