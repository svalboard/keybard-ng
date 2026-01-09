import LayersActiveIcon from "@/components/icons/LayersActive";
import LayersDefaultIcon from "@/components/icons/LayersDefault";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useVial } from "@/contexts/VialContext";
import { cn } from "@/lib/utils";
import { svalService } from "@/services/sval.service";
import { vialService } from "@/services/vial.service";
import { colorClasses, layerColors } from "@/utils/colors";
import { FC, useState, useRef, useEffect } from "react";

interface LayerSelectorProps {
    selectedLayer: number;
    setSelectedLayer: (layer: number) => void;
}

/**
 * Component for selecting and managing active layers in the keyboard editor.
 * Provides a quick-access tab bar for all layers and a detailed display of the selected layer.
 */
const LayerSelector: FC<LayerSelectorProps> = ({ selectedLayer, setSelectedLayer }) => {
    const { keyboard, setKeyboard } = useVial();
    const { clearSelection } = useKeyBinding();

    // UI state
    const [showAllLayers, setShowAllLayers] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [editValue, setEditValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsColorPickerOpen(false);
            }
        };

        if (isColorPickerOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isColorPickerOpen]);

    if (!keyboard) return null;

    const handleSelectLayer = (layer: number) => () => {
        setSelectedLayer(layer);
        clearSelection();
    };

    const toggleShowLayers = () => {
        setShowAllLayers((prev) => !prev);
    };

    const handleStartEditing = () => {
        setEditValue(svalService.getLayerName(keyboard, selectedLayer));
        setIsEditing(true);
    };

    const handleSave = () => {
        if (keyboard) {
            const cosmetic = JSON.parse(JSON.stringify(keyboard.cosmetic || { layer: {}, layer_colors: {} }));
            if (!cosmetic.layer) cosmetic.layer = {};

            // If the input is empty, remove the custom name to revert to default
            if (editValue.trim() === "") {
                delete cosmetic.layer[selectedLayer.toString()];
            } else {
                cosmetic.layer[selectedLayer.toString()] = editValue;
            }

            setKeyboard({ ...keyboard, cosmetic });
        }
        setIsEditing(false);
    };

    const handleSetColor = (colorName: string) => {
        if (keyboard) {
            const cosmetic = JSON.parse(JSON.stringify(keyboard.cosmetic || { layer: {}, layer_colors: {} }));
            if (!cosmetic.layer_colors) cosmetic.layer_colors = {};
            cosmetic.layer_colors[selectedLayer.toString()] = colorName;
            setKeyboard({ ...keyboard, cosmetic });
        }
        setIsColorPickerOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            setIsEditing(false);
        }
    };

    const currentLayerColor = keyboard.cosmetic?.layer_colors?.[selectedLayer] || "primary";

    // All possible colors for the picker
    const allColors = [
        ...layerColors,
    ];


    return (
        <div className="w-full flex flex-col pt-4" onClick={(e) => e.stopPropagation()}>
            {/* Top Toolbar: Filter toggle and Layer Tabs */}
            <div className="py-3 overflow-hidden flex-shrink-0 flex items-center justify-start text-gray-500 gap-1 pl-4 w-full">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={toggleShowLayers}
                            className="hover:bg-gray-200 p-1.5 rounded-md transition-colors mr-2 text-black flex items-center justify-center"
                            aria-label={showAllLayers ? "Hide Blank Layers" : "Show All Layers"}
                        >
                            {showAllLayers ? <LayersDefaultIcon className="h-5 w-5" /> : <LayersActiveIcon className="h-5 w-5" />}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        {showAllLayers ? "Hide Blank Layers" : "Show All Layers"}
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
                                onDoubleClick={handleStartEditing}
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
            <div className="mt-2 flex justify-start items-center px-5 py-2 relative">
                {/* Color Dot with Picker */}
                <div className="relative mr-3 left-px" ref={pickerRef}>
                    <div
                        className={cn(
                            "w-6 h-6 rounded-full shadow-sm cursor-pointer transition-transform hover:scale-110 border-2",
                            colorClasses[currentLayerColor] || "bg-kb-primary",
                            isColorPickerOpen ? "border-black" : "border-transparent"
                        )}
                        onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                    />

                    {isColorPickerOpen && (
                        <div className="absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2 z-50 bg-[#EEEEEE] rounded-3xl p-2 flex flex-col items-center gap-2 shadow-xl border border-gray-200 min-w-[40px]">
                            {allColors.map((color) => (
                                <button
                                    key={color.name}
                                    className={cn(
                                        "w-6 h-6 rounded-full transition-all hover:scale-110 border-2",
                                        (keyboard.cosmetic?.layer_colors?.[selectedLayer] === color.name) ||
                                            (!keyboard.cosmetic?.layer_colors?.[selectedLayer] && color.name === "green")
                                            ? "border-black border-3"
                                            : "border-transparent"
                                    )}
                                    style={{ backgroundColor: color.hex }}
                                    onClick={() => handleSetColor(color.name)}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="flex items-center gap-2 bg-white rounded-md px-1 py-0.5 border border-black shadow-sm">
                        <Input
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={handleKeyDown}
                            className="h-auto py-1 px-2 text-lg font-bold border-none focus-visible:ring-0 w-auto min-w-[200px]"
                            autoFocus
                        />
                    </div>
                ) : (
                    <div
                        className="text-lg flex justify-start items-center cursor-pointer group hover:bg-black/5 rounded-md px-2 py-1 transition-colors"
                        onClick={handleStartEditing}
                        title="Click to rename"
                    >
                        <span className="font-bold text-black">
                            {svalService.getLayerName(keyboard, selectedLayer)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LayerSelector;
