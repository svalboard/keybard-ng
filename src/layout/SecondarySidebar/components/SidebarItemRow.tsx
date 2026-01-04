import { GripVerticalIcon, PencilIcon } from "lucide-react";
import React from "react";

import { Key } from "@/components/Key";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { KeyboardInfo, KeyContent } from "@/types/vial.types";
import { colorClasses } from "@/utils/colors";

interface SidebarItemRowProps {
    index: number;
    keyboard: KeyboardInfo;
    keycode?: string;
    label?: string;
    keyContents?: KeyContent;
    color?: string; // For layers: color name (e.g., "primary", "kb-green")
    hasCustomName?: boolean;
    customName?: string;
    onEdit?: (index: number) => void;
    onAssignKeycode?: (keycode: string) => void;
    hoverBorderColor?: string;
    hoverBackgroundColor?: string;
    showDottedLine?: boolean;
    showDragHandle?: boolean;
    editAction?: React.ReactNode;
}

/**
 * A reusable row component for sidebar panels (Layers, Macros, Tapdances, etc.)
 * Ensures consistent styling and behavior across different management panels.
 */
const SidebarItemRow: React.FC<SidebarItemRowProps> = React.memo(
    ({
        index,
        keycode = "",
        label,
        keyContents,
        color,
        hasCustomName,
        customName,
        onEdit,
        onAssignKeycode,
        hoverBorderColor,
        hoverBackgroundColor,
        showDottedLine = true,
        showDragHandle = true,
        editAction,
    }) => {
        const displayLabel = label ?? index.toString();

        const handleEdit = () => {
            if (onEdit) onEdit(index);
        };

        return (
            <div className="flex flex-row items-end py-0 panel-layer-item group/item relative pl-6 pr-2">
                {/* Drag Handle - centered vertically in the 60px row */}
                {showDragHandle && (
                    <div className="absolute left-0 top-0 h-[60px] flex items-center justify-center w-6 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <GripVerticalIcon className="h-3 w-3 text-muted-foreground" />
                    </div>
                )}

                {/* Index and Optional Color Indicator */}
                <div
                    className="flex flex-row items-center flex-shrink-0 mb-2 gap-2 cursor-pointer"
                    onDoubleClick={handleEdit}
                    title={`Item ${index}`}
                >
                    {color && <div className={cn("w-4 h-4 rounded-full flex-shrink-0", colorClasses[color])} />}
                    <span className="text-md font-semibold w-5 text-center flex-shrink-0 text-black">
                        {index}
                    </span>
                </div>

                {/* Label Area and Dotted Leader */}
                <div
                    className="flex-grow flex flex-row items-end mb-2 min-w-0 relative h-6 mr-3 ml-1 cursor-pointer"
                    onDoubleClick={handleEdit}
                >
                    {/* Visual dotted border baseline */}
                    {showDottedLine && (
                        <div className="absolute left-[-4px] right-0 bottom-[2px] h-[2px] sidebar-dotted-line pointer-events-none" />
                    )}

                    <div className="relative z-10 flex flex-row items-end gap-2 bg-transparent min-w-0 flex-shrink">
                        {hasCustomName && (
                            <span className="text-md font-medium truncate pr-0">
                                {customName}
                            </span>
                        )}
                    </div>

                    {/* Flexible spacer ensures dotted line spans empty space to the key */}
                    <div className="flex-grow min-w-0" />
                </div>

                {/* Action Area (Preview Key and Edit Button) */}
                <div className="flex flex-row flex-shrink-0 items-center gap-1 mb-1.5">
                    <Key
                        x={0}
                        y={0}
                        w={1}
                        h={1}
                        row={0}
                        col={0}
                        keycode={keycode}
                        label={displayLabel}
                        keyContents={keyContents}
                        layerColor="sidebar"
                        headerClassName="bg-kb-sidebar-dark group-hover:bg-black/30"
                        isRelative
                        className={cn("h-[60px] w-[60px]", !onAssignKeycode && "cursor-default")}
                        hoverBorderColor={hoverBorderColor}
                        hoverBackgroundColor={hoverBackgroundColor}
                        onClick={onAssignKeycode ? () => onAssignKeycode(keycode) : undefined}
                    />

                    <div className="w-8 flex justify-center items-center h-[60px]">
                        {editAction || (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 group-hover/item:opacity-100 opacity-0 transition-opacity hover:bg-slate-100"
                                onClick={handleEdit}
                            >
                                <PencilIcon className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);

SidebarItemRow.displayName = "SidebarItemRow";

export default SidebarItemRow;
