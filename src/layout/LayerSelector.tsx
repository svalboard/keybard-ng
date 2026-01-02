import EditLayer from "@/components/EditLayer";
import LayersDefaultIcon from "@/components/icons/LayersDefault";
import { Dialog } from "@/components/ui/dialog";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useVial } from "@/contexts/VialContext";
import { svalService } from "@/services/sval.service";
import { colorClasses } from "@/utils/colors";
import LayersActiveIcon from "@/components/icons/LayersActive";
import { vialService } from "@/services/vial.service";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FC, useState } from "react";

interface Props {
    selectedLayer: number;
    setSelectedLayer: (layer: number) => void;
}

const LayerSelector: FC<Props> = ({ selectedLayer, setSelectedLayer }) => {
    const { keyboard } = useVial();
    const { clearSelection } = useKeyBinding();

    const [showAllLayers, setShowAllLayers] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [layerToEdit, setLayerToEdit] = useState<number>(selectedLayer);

    const handleSelectLayer = (layer: number) => () => {
        setSelectedLayer(layer);
        clearSelection();
    };

    const toggleShowLayers = () => {
        setShowAllLayers(!showAllLayers);
    };

    const layerColor = keyboard!.cosmetic?.layer_colors?.[selectedLayer] || "primary";

    return (
        <div className="w-full">
            <div className=" py-7 overflow-hidden flex-shrink-0 flex items-center justify-start text-gray-500 gap-1 pl-4 w-full">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button onClick={toggleShowLayers} className="hover:bg-gray-200 p-1 rounded transition-colors mr-2 text-black">
                            {showAllLayers ? <LayersDefaultIcon className="h-5 w-5" /> : <LayersActiveIcon className="h-5 w-5" />}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        {showAllLayers ? "Show Active" : "Show All"}
                    </TooltipContent>
                </Tooltip>
                <div className="max-w-full flex flex-row overflow-hidden flex-grow-0 gap-2">
                    {Array.from({ length: keyboard!.layers || 16 }, (_, i) => {
                        const layerData = keyboard!.keymap?.[i];
                        const isEmpty = layerData ? vialService.isLayerEmpty(layerData) : true;

                        if (!showAllLayers && isEmpty && i !== selectedLayer) {
                            return null;
                        }

                        const layer = svalService.getLayerNameNoLabel(keyboard!, i);
                        const isActive = selectedLayer === i;
                        return (
                            // black bg for active layer 50% rounded corners
                            <div
                                key={layer}
                                onClick={handleSelectLayer(i)}
                                onDoubleClick={() => {
                                    setLayerToEdit(i);
                                    setIsDialogOpen(true);
                                }}
                                className={`
                        cursor-pointer px-5 py-1 rounded-full transition-colors relative flex-grow-0 flex-shrink-0 items-center justify-center text-sm font-medium
                        ${isActive ? "bg-gray-800 text-white shadow-md" : "hover:bg-gray-200"}
                    `}
                            >
                                <span className="text-sm">{layer}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="text-lg text-gray-600 mt-2 font-bold flex justify-start items-center px-5">
                <div className={`w-4 h-4 ${colorClasses[layerColor]} mr-3 rounded-full`}></div>
                <span
                    className="text-lg font-medium cursor-pointer"
                    onDoubleClick={() => {
                        setLayerToEdit(selectedLayer);
                        setIsDialogOpen(true);
                    }}
                >
                    {svalService.getLayerName(keyboard!, selectedLayer)}
                </span>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <EditLayer layer={layerToEdit} />
                </Dialog>
            </div>
        </div>
    );
};

export default LayerSelector;
