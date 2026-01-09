import { useState } from "react";

import SidebarItemRow from "@/layout/SecondarySidebar/components/SidebarItemRow";
import { Button } from "@/components/ui/button";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useLayer } from "@/contexts/LayerContext";
import { useVial } from "@/contexts/VialContext";
import { cn } from "@/lib/utils";
import { svalService } from "@/services/sval.service";
import { KeyContent } from "@/types/vial.types";
import { hoverBackgroundClasses, hoverBorderClasses, hoverHeaderClasses } from "@/utils/colors";
import { getKeyContents } from "@/utils/keys";

/**
 * Valid layer modifiers supported by the UI
 */
const LAYER_MODIFIERS = ["MO", "DF", "TG", "TT", "OSL", "TO"] as const;
type LayerModifier = (typeof LAYER_MODIFIERS)[number];

const MODIFIER_NAMES: Record<LayerModifier, string> = {
    MO: "Momentary",
    DF: "Default Layer",
    TG: "Toggle Layer",
    TT: "Tap Toggle",
    OSL: "One Shot Layer",
    TO: "To Layer",
};

/**
 * Main panel for managing and selecting layers.
 */
interface Props {
    isPicker?: boolean;
}

const LayersPanel = ({ isPicker }: Props) => {
    const [activeModifier, setActiveModifier] = useState<LayerModifier>("MO");
    const { keyboard, setKeyboard } = useVial();
    const { assignKeycode } = useKeyBinding();
    const { selectedLayer } = useLayer();

    if (!keyboard) return null;

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];
    const hoverHeaderClass = hoverHeaderClasses[layerColorName] || hoverHeaderClasses["primary"];

    const handleColorChange = (index: number, colorName: string) => {
        if (keyboard) {
            const cosmetic = JSON.parse(JSON.stringify(keyboard.cosmetic || { layer: {}, layer_colors: {} }));
            if (!cosmetic.layer_colors) cosmetic.layer_colors = {};
            cosmetic.layer_colors[index.toString()] = colorName;
            setKeyboard({ ...keyboard, cosmetic });
        }
    };

    const handleNameChange = (index: number, newName: string) => {
        if (keyboard) {
            const cosmetic = JSON.parse(JSON.stringify(keyboard.cosmetic || { layer: {}, layer_colors: {} }));
            if (!cosmetic.layer) cosmetic.layer = {};

            // If the input is empty, remove the custom name to revert to default
            if (newName.trim() === "") {
                delete cosmetic.layer[index.toString()];
            } else {
                cosmetic.layer[index.toString()] = newName;
            }

            setKeyboard({ ...keyboard, cosmetic });
        }
    };

    return (
        <section className="space-y-3 h-full max-h-full flex flex-col">
            {isPicker && (
                <div className="pb-2">
                    <span className="font-semibold text-xl text-slate-700">Layer Keys</span>
                </div>
            )}
            {/* Layer Modifier Selection Tabs */}
            <div className="flex flex-wrap items-center justify-start gap-4">
                <div className="flex items-center justify-between rounded-full p-1 gap-1 bg-muted/30">
                    {LAYER_MODIFIERS.map((modifier) => {
                        const isActive = modifier === activeModifier;
                        return (
                            <Button
                                key={modifier}
                                type="button"
                                size="sm"
                                variant={isActive ? "default" : "ghost"}
                                className={cn(
                                    "px-6 py-1 text-md rounded-full transition-all",
                                    isActive ? "shadow-sm bg-slate-900 border-none" : "text-black hover:bg-slate-200"
                                )}
                                onClick={() => setActiveModifier(modifier)}
                            >
                                {modifier}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Active Modifier Legend */}
            <div className="text-black font-bold flex justify-start items-center pt-1 pl-[26px]">
                <span className="text-md font-medium">
                    {MODIFIER_NAMES[activeModifier]}
                </span>
            </div>

            {/* Scrollable Layer List */}
            <div className="flex flex-col overflow-auto flex-grow scrollbar-thin">
                {Array.from({ length: keyboard.layers || 16 }, (_, i) => {
                    const layerName = (svalService.getLayerCosmetic(keyboard, i) || "").trim();
                    const hasCustomName = layerName !== "";
                    const layerColor = keyboard?.cosmetic?.layer_colors?.[i] ?? "primary";
                    const keycode = `${activeModifier}(${i})`;
                    const keyContents = getKeyContents(keyboard, keycode) as KeyContent;

                    return (
                        <SidebarItemRow
                            key={i}
                            index={i}
                            keyboard={keyboard}
                            keycode={keycode}
                            label={i.toString()}
                            keyContents={keyContents}
                            color={layerColor}
                            hasCustomName={hasCustomName}
                            customName={layerName}
                            onAssignKeycode={assignKeycode}
                            onColorChange={isPicker ? undefined : handleColorChange}
                            onNameChange={isPicker ? undefined : handleNameChange}
                            hoverBorderColor={hoverBorderColor}
                            hoverBackgroundColor={hoverBackgroundColor}
                            hoverLayerColor={layerColorName}
                            hoverHeaderClass={hoverHeaderClass}
                        />
                    );
                })}
            </div>
        </section>
    );
};

export default LayersPanel;
