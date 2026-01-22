import React from "react";
import { Pencil } from "lucide-react";

import { Key } from "@/components/Key";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { KeyboardInfo, KeyContent } from "@/types/vial.types";
import { colorClasses, layerColors } from "@/utils/colors";

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
    onColorChange?: (index: number, colorName: string) => void;
    onNameChange?: (index: number, newName: string) => void;
    hoverBorderColor?: string;
    hoverBackgroundColor?: string;
    hoverLayerColor?: string;
    hoverHeaderClass?: string;
    showDottedLine?: boolean;
    showIndex?: boolean;
    showPreviewKey?: boolean;
    children?: React.ReactNode;
    className?: string;
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
        onColorChange,
        onNameChange,
        hoverBorderColor,
        hoverBackgroundColor,
        hoverLayerColor,
        hoverHeaderClass,
        showDottedLine = true,
        showIndex = true,
        showPreviewKey = true,
        children,
        className,
    }) => {
        const [isColorPickerOpen, setIsColorPickerOpen] = React.useState(false);
        const [isEditing, setIsEditing] = React.useState(false);
        const [editValue, setEditValue] = React.useState("");
        const pickerRef = React.useRef<HTMLDivElement>(null);
        const inputRef = React.useRef<HTMLInputElement>(null);

        const displayLabel = label ?? index.toString();

        // Close picker when clicking outside
        React.useEffect(() => {
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

        const handleEdit = () => {
            if (onEdit) onEdit(index);
        };

        const handleStartEditing = () => {
            setEditValue(customName || "");
            setIsEditing(true);
        };

        const handleSaveEdit = () => {
            if (onNameChange) {
                onNameChange(index, editValue.trim());
            }
            setIsEditing(false);
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
                handleSaveEdit();
            } else if (e.key === "Escape") {
                setIsEditing(false);
            }
        };

        const handleColorChange = (colorName: string) => {
            if (onColorChange) {
                onColorChange(index, colorName);
            }
            setIsColorPickerOpen(false);
        };

        const isClickable = !!(onEdit || onNameChange);

        return (
            <div
                className={cn(
                    "flex flex-row items-center py-0 panel-layer-item group/item relative pl-6 pr-2 transition-colors",
                    (onEdit || onNameChange || onColorChange) && "hover:bg-black/5 hover:rounded-lg py-2",
                    isClickable && "cursor-pointer",
                    className
                )}
                onClick={() => {
                    if (onNameChange) {
                        handleStartEditing();
                    } else if (onEdit) {
                        handleEdit();
                    }
                }}
            >
                {/* Index and Optional Color Indicator */}
                <div
                    className="flex flex-row items-center flex-shrink-0 gap-2"
                    title={`Item ${index}`}
                >
                    {color && (
                        <div className="relative" ref={pickerRef}>
                            <div
                                className={cn(
                                    "w-4 h-4 rounded-full flex-shrink-0 cursor-pointer transition-transform hover:scale-110 border-2",
                                    colorClasses[color],
                                    isColorPickerOpen ? "border-black" : "border-transparent"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onColorChange) {
                                        setIsColorPickerOpen(!isColorPickerOpen);
                                    }
                                }}
                            />

                            {isColorPickerOpen && onColorChange && (
                                <div className="absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2 z-50 bg-[#EEEEEE] rounded-3xl p-2 flex flex-col items-center gap-2 shadow-xl border border-gray-200 min-w-[40px]">
                                    {layerColors.map((layerColor) => (
                                        <button
                                            key={layerColor.name}
                                            className={cn(
                                                "w-4 h-4 rounded-full transition-all hover:scale-110 border-2",
                                                color === layerColor.name
                                                    ? "border-black border-3"
                                                    : "border-transparent"
                                            )}
                                            style={{ backgroundColor: layerColor.hex }}
                                            onClick={() => handleColorChange(layerColor.name)}
                                            title={layerColor.name}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {showIndex && (
                        <span className="text-md font-semibold w-5 text-center flex-shrink-0 text-black">
                            {index}
                        </span>
                    )}
                </div>

                {/* Label Area / Children / Dotted Leader */}
                <div
                    className="flex-grow flex flex-row items-center min-w-0 relative h-6 mr-3 ml-1"
                >
                    {children ? (
                        <div className="relative z-10 w-full h-full flex items-center">
                            {children}
                        </div>
                    ) : (
                        <>
                            {/* Visual dotted border baseline */}
                            {showDottedLine && !isEditing && (
                                <div className="absolute left-[-4px] right-0 bottom-[2px] h-[2px] sidebar-dotted-line pointer-events-none" />
                            )}

                            {isEditing && onNameChange ? (
                                <div
                                    className="absolute left-[-4px] right-0 bottom-[-7px] flex items-center bg-white rounded-md px-2 py-1.5 border border-black shadow-sm"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Input
                                        ref={inputRef}
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={handleSaveEdit}
                                        onKeyDown={handleKeyDown}
                                        className="h-auto py-0 px-0 text-base md:text-base font-medium border-none shadow-none focus-visible:ring-0 w-full bg-transparent"
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <div className="relative z-10 flex flex-row items-center gap-2 bg-transparent min-w-0 flex-shrink">
                                    {(hasCustomName || (label && label !== index.toString())) && (
                                        <span className="text-base font-medium truncate pr-0">
                                            {hasCustomName ? customName : label}
                                        </span>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Flexible spacer ensures dotted line spans empty space to the key */}
                    <div className="flex-grow min-w-0" />
                </div>

                {/* Action Area (Preview Key) */}
                <div className="flex flex-row flex-shrink-0 items-center gap-1 ml-auto">
                    {showPreviewKey && (
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
                            headerClassName={hoverHeaderClass ? `bg-kb-sidebar-dark ${hoverHeaderClass}` : "bg-kb-sidebar-dark group-hover:bg-black/30"}
                            isRelative
                            className={cn("h-[60px] w-[60px]", !onAssignKeycode && "cursor-default")}
                            hoverBorderColor={hoverBorderColor}
                            hoverBackgroundColor={hoverBackgroundColor}
                            hoverLayerColor={hoverLayerColor}
                            onClick={onAssignKeycode ? () => onAssignKeycode(keycode) : undefined}
                        />
                    )}
                    {onEdit && (
                        <div
                            className="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-gray-100 cursor-pointer transition-all opacity-0 group-hover/item:opacity-100 ml-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(index);
                            }}
                            title="Edit"
                        >
                            <Pencil className="w-4 h-4 text-gray-700" />
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

SidebarItemRow.displayName = "SidebarItemRow";

export default SidebarItemRow;
