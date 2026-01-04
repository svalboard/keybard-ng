import EditLayer from "@/components/EditLayer";
import LayersActiveIcon from "@/components/icons/LayersActive";
import LayersDefaultIcon from "@/components/icons/LayersDefault";
import { Dialog } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useVial } from "@/contexts/VialContext";
import { cn } from "@/lib/utils";
import { svalService } from "@/services/sval.service";
import { vialService } from "@/services/vial.service";
import { colorClasses } from "@/utils/colors";
import { FC, useState } from "react";

interface LayerSelectorProps {
    selectedLayer: number;
    setSelectedLayer: (layer: number) => void;
}

/**
 * Component for selecting and managing active layers in the keyboard editor.
 * Provides a quick-access tab bar for all layers and a detailed display of the selected layer.
 */
const LayerSelector: FC<LayerSelectorProps> = ({ selectedLayer, setSelectedLayer }) => {
    const { keyboard } = useVial();
    const { clearSelection } = useKeyBinding();

    // UI state
    const [showAllLayers, setShowAllLayers] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [layerToEdit, setLayerToEdit] = useState<number>(selectedLayer);

    if (!keyboard) return null;

    const handleSelectLayer = (layer: number) => () => {
        setSelectedLayer(layer);
        clearSelection();
    };

    const handleOpenEditor = (layer: number) => {
        setLayerToEdit(layer);
        setIsDialogOpen(true);
    };

    const toggleShowLayers = () => {
        setShowAllLayers((prev) => !prev);
    };

    const currentLayerColor = keyboard.cosmetic?.layer_colors?.[selectedLayer] || "primary";

    return (
        <div className="w-full flex flex-col pt-4" onClick={(e) => e.stopPropagation()}>
            {/* Top Toolbar: Filter toggle and Layer Tabs */}
            <div className="py-3 overflow-hidden flex-shrink-0 flex items-center justify-start text-gray-500 gap-1 pl-4 w-full">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={toggleShowLayers}
                            className="hover:bg-gray-200 p-1.5 rounded-md transition-colors mr-2 text-black flex items-center justify-center"
                            aria-label={showAllLayers ? "Show Active Only" : "Show All Layers"}
                        >
                            {showAllLayers ? <LayersDefaultIcon className="h-5 w-5" /> : <LayersActiveIcon className="h-5 w-5" />}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        {showAllLayers ? "Show Active Layers Only" : "Show All Layers"}
                    </TooltipContent>
                </Tooltip>

                <div className="max-w-full flex flex-row overflow-visible flex-grow-0 gap-2 p-1">
                    {Array.from({ length: keyboard.layers || 16 }, (_, i) => {
                        const layerData = keyboard.keymap?.[i];
                        const isEmpty = layerData ? vialService.isLayerEmpty(layerData) : true;

                        // Filter out empty layers if filter is active
                        if (!showAllLayers && isEmpty && i !== selectedLayer) {
                            return null;
                        }

                        const layerShortName = svalService.getLayerNameNoLabel(keyboard, i);
                        const isActive = selectedLayer === i;

                        return (
                            <button
                                key={`layer-tab-${i}`}
                                onClick={handleSelectLayer(i)}
                                onDoubleClick={() => handleOpenEditor(i)}
                                className={cn(
                                    "px-5 py-1 rounded-full transition-all text-sm font-medium cursor-pointer border-none outline-none whitespace-nowrap",
                                    isActive
                                        ? "bg-gray-800 text-white shadow-md scale-105"
                                        : "bg-transparent text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                <span>{layerShortName}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Status: Current Layer Name and Edit Trigger */}
            <div className="text-lg text-gray-600 mt-2 font-bold flex justify-start items-center px-5 py-2">
                <div className={cn("w-4 h-4 mr-3 rounded-full shadow-sm", colorClasses[currentLayerColor])} />
                <span
                    className="text-lg font-medium cursor-pointer hover:text-black transition-colors"
                    onDoubleClick={() => handleOpenEditor(selectedLayer)}
                    title="Double-click to rename or change color"
                >
                    {svalService.getLayerName(keyboard, selectedLayer)}
                </span>

                {/* Modal for editing layer properties */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <EditLayer layer={layerToEdit} />
                </Dialog>
            </div>
        </div>
    );
};

export default LayerSelector;
