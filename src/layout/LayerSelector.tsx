import EditLayer from "@/components/EditLayer";
import LayersDefaultIcon from "@/components/icons/LayersDefault";
import { Dialog } from "@/components/ui/dialog";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useVial } from "@/contexts/VialContext";
import { svalService } from "@/services/sval.service";
import { colorClasses } from "@/utils/colors";
import LayersActiveIcon from "@/components/icons/LayersActive";
import { vialService } from "@/services/vial.service";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FC, useState } from "react";

interface Props {
    selectedLayer: number;
    setSelectedLayer: (layer: number) => void;
}

const LayerSelector: FC<Props> = ({ selectedLayer, setSelectedLayer }) => {
    const { keyboard } = useVial();
    const layerKeymap = keyboard!.keymap?.[selectedLayer] || [];
    const { clearSelection } = useKeyBinding();

    const [showAllLayers, setShowAllLayers] = useState(true);

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
                <span className="text-lg font-medium">{svalService.getLayerName(keyboard!, selectedLayer)}</span>
                <Dialog>
                    <DialogTrigger asChild className="ml-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="inline-block h-7 w-7 ml-2 text-black hover:text-black rounded-sm  cursor-pointer hover:bg-gray-200 p-1 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                    </DialogTrigger>
                    <EditLayer layer={selectedLayer} layerName={svalService.getLayerCosmetic(keyboard!, selectedLayer)} />
                </Dialog>
            </div>
        </div>
    );
};

export default LayerSelector;
