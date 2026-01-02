import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { GripVerticalIcon, PencilIcon } from "lucide-react";
import React, { useMemo, useState } from "react";

import EditLayer from "@/components/EditLayer";
import { Key } from "@/components/Key";
import { Button } from "@/components/ui/button";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useVial } from "@/contexts/VialContext";
import { cn } from "@/lib/utils";
import { svalService } from "@/services/sval.service";
import { colorClasses } from "@/utils/colors";
import { getKeyContents } from "@/utils/keys";
import { KeyboardInfo } from "@/types/vial.types";

const LAYER_MODIFIERS = ["MO", "DF", "TG", "TT", "OSL", "TO"];

const MODIFIER_NAMES: Record<string, string> = {
    MO: "Momentary",
    DF: "Default Layer",
    TG: "Toggle Layer",
    TT: "Tap Toggle",
    OSL: "One Shot Layer",
    TO: "To Layer",
};

interface LayerRowProps {
    index: number;
    keyboard: KeyboardInfo;
    activeModifier: string;
    onAssignKeycode: (keycode: string) => void;
}

const LayerRow: React.FC<LayerRowProps> = React.memo(({ index, keyboard, activeModifier, onAssignKeycode }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const layerName = (svalService.getLayerCosmetic(keyboard, index) || "").trim();
    const hasCustomName = layerName !== "";
    const layerColor = keyboard?.cosmetic?.layer_colors?.[index] ?? "primary";
    const keycode = `${activeModifier}(${index})`;

    const keyContents = useMemo(() => getKeyContents(keyboard, keycode), [keyboard, keycode]);

    return (
        <div className="flex flex-row items-end py-0 panel-layer-item group/item relative pl-6 pr-2">
            <div className="absolute left-0 top-0 h-[60px] flex items-center justify-center w-6 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <GripVerticalIcon className="h-3 w-3 text-muted-foreground" />
            </div>

            <div
                className="flex flex-row items-center flex-shrink-0 mb-2 gap-2 cursor-pointer"
                onDoubleClick={() => setIsDialogOpen(true)}
            >
                <div className={cn("w-4 h-4 rounded-full flex-shrink-0", colorClasses[layerColor])} />
                <span className="text-md font-semibold w-5 text-center flex-shrink-0 text-black">{index}</span>
            </div>

            <div
                className="flex-grow flex flex-row items-end mb-2 min-w-0 relative h-6 mr-3 ml-1 cursor-pointer"
                onDoubleClick={() => setIsDialogOpen(true)}
            >
                {/* Horizontal dotted line background - starts after index, ends 8px before key */}
                <div className="absolute left-[-4px] right-0 bottom-[2px] h-[2px] sidebar-dotted-line pointer-events-none" />

                <div className="relative z-10 flex flex-row items-end gap-2 bg-transparent min-w-0 flex-shrink">
                    {hasCustomName && (
                        <span className="text-md font-medium truncate pr-0">
                            {layerName}
                        </span>
                    )}
                </div>

                {/* Spacer to guarantee dotted line presence */}
                <div className="flex-grow min-w-0" />
            </div>

            <div className="flex flex-row flex-shrink-0 items-center gap-1 mb-1.5">
                <Key
                    x={0}
                    y={0}
                    w={1}
                    h={1}
                    row={0}
                    col={0}
                    keycode={keycode}
                    label={index.toString()}
                    keyContents={keyContents}
                    layerColor="sidebar"
                    headerClassName="bg-kb-sidebar-dark"
                    isRelative
                    className="h-[60px] w-[60px]"
                    onClick={() => onAssignKeycode(keycode)}
                />

                <div className="w-8 flex justify-center items-center h-[60px]">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 group-hover/item:opacity-100 opacity-0 transition-opacity">
                                <PencilIcon className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <EditLayer layer={index} />
                    </Dialog>
                </div>
            </div>
        </div>
    );
});

const LayersPanel = () => {
    const [activeModifier, setActiveModifier] = useState<string>(LAYER_MODIFIERS[0]);
    const { keyboard } = useVial();
    const { assignKeycode } = useKeyBinding();

    if (!keyboard) return null;

    return (
        <section className="space-y-3 h-full max-h-full flex flex-col">
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
                                    "px-6 py-1 text-md rounded-full",
                                    isActive ? "shadow" : "text-black"
                                )}
                                onClick={() => setActiveModifier(modifier)}
                            >
                                {modifier}
                            </Button>
                        );
                    })}
                </div>
            </div>

            <div className="text-black font-bold flex justify-start items-center pt-1 pl-[26px]">
                <span className="text-md font-medium">
                    {MODIFIER_NAMES[activeModifier]}
                </span>
            </div>

            <div className="flex flex-col overflow-auto flex-grow">
                {Array.from({ length: keyboard.layers || 16 }, (_, i) => (
                    <LayerRow
                        key={i}
                        index={i}
                        keyboard={keyboard}
                        activeModifier={activeModifier}
                        onAssignKeycode={assignKeycode}
                    />
                ))}
            </div>
        </section>
    );
};

export default LayersPanel;
