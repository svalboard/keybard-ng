import "./Key.css";
import React from "react";
import { cn } from "@/lib/utils";
import { showModMask } from "@/utils/keys";
import { colorClasses } from "@/utils/colors";
import { UNIT_SIZE } from "../constants/svalboard-layout";
import { KeyContent } from "@/types/vial.types";
import { getHeaderIcons, getCenterContent, getTypeIcon } from "@/utils/key-icons";

interface KeyProps {
    x: number; // X position in key units
    y: number; // Y position in key units
    w: number; // Width in key units
    h: number; // Height in key units
    keycode: string; // The keycode (e.g., "KC_A", "MO(2)")
    label: string; // Display label for the key
    row: number; // Matrix row
    col: number; // Matrix column
    selected?: boolean;
    onClick?: (row: number, col: number) => void;
    keyContents?: KeyContent; // Additional key contents info
    layerColor?: string;
    isRelative?: boolean;
    className?: string;
    headerClassName?: string;
    variant?: "default" | "small";
    hoverBorderColor?: string;
    hoverBackgroundColor?: string;
}

/**
 * Key component representing a single physical or virtual key on the keyboard.
 * Handles different key types (layer, macro, tapdance, etc.) and visual styles.
 */
export const Key: React.FC<KeyProps> = ({
    x,
    y,
    w,
    h,
    keycode,
    label,
    row,
    col,
    layerColor = "primary",
    selected = false,
    onClick,
    keyContents,
    isRelative = false,
    className = "",
    headerClassName = "bg-black/30",
    variant = "default",
    hoverBorderColor,
    hoverBackgroundColor,
}) => {
    const isSmall = variant === "small";
    const currentUnitSize = isSmall ? 30 : UNIT_SIZE;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClick) {
            onClick(row, col);
        }
    };

    // Style for positioning and dimensions
    const boxStyle: React.CSSProperties = {
        left: isRelative ? undefined : `${x * currentUnitSize}px`,
        top: isRelative ? undefined : `${y * currentUnitSize}px`,
        width: `${w * currentUnitSize}px`,
        height: `${h * currentUnitSize}px`,
    };

    // Pre-process label and logic
    let displayLabel = label;
    let bottomStr = "";
    let topLabel: React.ReactNode = "";

    const hasModifiers = keyContents?.type === "modmask";

    if (hasModifiers && keyContents) {
        const show = showModMask(keyContents.modids);
        const keysArr = keyContents.str.split("\n");
        if (!label || label === keycode) {
            displayLabel = keysArr[0];
        }
        bottomStr = show;
    }

    if (keyContents?.type === "tapdance") {
        displayLabel = keyContents.tdid?.toString() || "";
    } else if (keyContents?.type === "macro") {
        displayLabel = keyContents.top?.replace("M", "") || "";
    } else if (keyContents?.type === "user") {
        displayLabel = keyContents.str;
    } else if (keyContents?.type === "OSM") {
        topLabel = "OSM";
        displayLabel = keyContents.str;
    }

    if (displayLabel === "KC_NO") {
        displayLabel = "";
    }

    // Icon logic
    const { icons, isMouse } = getHeaderIcons(keycode, displayLabel);
    if (icons.length > 0) {
        topLabel = <div className="flex items-center justify-center gap-1">{icons}</div>;
    }

    const centerContent = getCenterContent(displayLabel, keycode, isMouse);

    // Determine styling for long text
    const shouldShrinkText =
        ["user", "OSM"].includes(keyContents?.type || "") ||
        (typeof centerContent === "string" &&
            (centerContent.length > 5 || (centerContent.length === 5 && centerContent.toUpperCase().includes("W"))));

    const textStyle: React.CSSProperties = shouldShrinkText
        ? { whiteSpace: "pre-line", fontSize: "0.6rem", wordWrap: "break-word" }
        : {};
    const bottomTextStyle: React.CSSProperties =
        bottomStr.length > 4 ? { whiteSpace: "pre-line", fontSize: "0.6rem", wordWrap: "break-word" } : {};

    // Common container classes
    const containerClasses = cn(
        colorClasses[layerColor],
        "flex flex-col items-center justify-between cursor-pointer transition-all duration-200 ease-in-out uppercase group overflow-hidden",
        !isRelative && "absolute",
        isSmall ? "rounded-[5px] border" : "rounded-md border-2",
        selected
            ? "bg-red-500 text-white border-kb-gray"
            : cn(
                "border-kb-gray",
                hoverBorderColor || "hover:border-red-500",
                hoverBackgroundColor
            ),
        className
    );

    // Specific rendering for Layer keys
    if (keyContents?.type === "layer") {
        const layerIndex = keyContents?.top?.split("(")[1]?.replace(")", "") || "";
        return (
            <div
                className={containerClasses}
                style={boxStyle}
                onClick={handleClick}
                title={keycode}
            >
                <span className={cn(
                    "whitespace-nowrap w-full text-center text-white font-semibold py-0",
                    isSmall ? "text-[10px] rounded-t-[4px]" : "text-sm rounded-t-sm",
                    headerClassName
                )}>
                    {keyContents?.layertext}
                </span>

                <div className={cn("flex flex-row h-full w-full items-center justify-center", isSmall ? "gap-1" : "gap-2")}>
                    <div className={cn(
                        "text-center justify-center items-center flex font-semibold",
                        isSmall ? "text-[13px]" : (layerIndex.length === 1 ? "text-[16px]" : "text-[15px]")
                    )}>
                        {layerIndex}
                    </div>
                    {getTypeIcon("layer", variant)}
                </div>
            </div>
        );
    }

    // Default rendering for all other keys
    return (
        <div
            className={containerClasses}
            style={boxStyle}
            onClick={handleClick}
            title={keycode}
        >
            {topLabel && (
                <span className={cn(
                    "whitespace-nowrap w-full text-center text-white font-semibold py-0 flex items-center justify-center",
                    isSmall ? "text-[8px] min-h-[10px] rounded-t-[4px]" : "text-sm min-h-[1.2rem] rounded-t-sm",
                    headerClassName
                )}>
                    {topLabel}
                </span>
            )}

            {keyContents && getTypeIcon(keyContents.type, variant)}

            <div
                className={cn(
                    "text-center w-full h-full justify-center items-center flex font-semibold",
                    isSmall ? "text-[10px] px-0.5" : (typeof centerContent === 'string' && centerContent.length === 1 ? "text-[16px]" : "text-[15px]")
                )}
                style={textStyle}
            >
                {centerContent}
            </div>

            {bottomStr !== "" && (
                <span
                    className={cn(
                        "font-semibold items-center flex justify-center whitespace-nowrap text-white w-full text-center py-0",
                        isSmall ? "text-[8px] min-h-[10px] rounded-b-[4px]" : "text-sm min-h-5 rounded-b-sm",
                        headerClassName
                    )}
                    style={bottomTextStyle}
                >
                    {bottomStr}
                </span>
            )}
        </div>
    );
};
