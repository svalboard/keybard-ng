import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { showModMask } from "@/utils/keys";
import { colorClasses, hoverContainerTextClasses } from "@/utils/colors";
import { KeyContent } from "@/types/vial.types";
import { getHeaderIcons, getCenterContent, getTypeIcon } from "@/utils/key-icons";
import { useKeyDrag } from "@/hooks/useKeyDrag";

export interface KeyProps {
    x: number;
    y: number;
    w: number;
    h: number;
    keycode: string;
    label: string;
    row: number;
    col: number;
    layerIndex?: number;
    selected?: boolean;
    onClick?: (row: number, col: number) => void;
    keyContents?: KeyContent;
    layerColor?: string;
    isRelative?: boolean;
    className?: string;
    headerClassName?: string;
    variant?: "default" | "medium" | "small";
    hoverBorderColor?: string;
    hoverBackgroundColor?: string;
    hoverLayerColor?: string;
    disableHover?: boolean;
}

/**
 * Renders a single key in the keyboard layout.
 */
export const Key: React.FC<KeyProps> = (props) => {
    const {
        x, y, w, h, keycode, label, row, col, layerIndex = 0, layerColor = "primary",
        selected = false, onClick, keyContents, isRelative = false, className = "",
        headerClassName = "bg-black/30", variant = "default", hoverBorderColor,
        hoverBackgroundColor, hoverLayerColor, disableHover = false,
    } = props;

    const uniqueId = React.useId();
    const drag = useKeyDrag({
        uniqueId, keycode, label, row, col, layerIndex, layerColor,
        isRelative, keyContents, w, h, variant, onClick, disableHover
    });

    const isSmall = variant === "small";
    const isMedium = variant === "medium";

    // --- Data processing ---
    const keyData = useMemo(() => {
        let displayLabel = label;
        let bottomStr = "";
        let topLabel: React.ReactNode = "";

        if (keyContents?.type === "modmask") {
            const show = showModMask(keyContents.modids);
            const keysArr = keyContents.str?.split("\n") || [];
            const keyStr = keysArr[0] || "";

            if (!label || label === keycode) {
                const modStr = keyContents.top || "";
                displayLabel = modStr + (keyStr === "" || keyStr === "KC_NO" ? " (kc)" : ` ${keyStr}`);
            }
            bottomStr = show;
        } else if (keyContents?.type === "tapdance") {
            displayLabel = keyContents.tdid?.toString() || "";
        } else if (keyContents?.type === "macro") {
            displayLabel = keyContents.top?.replace("M", "") || "";
        } else if (keyContents?.type === "user") {
            displayLabel = keyContents.str || "";
        } else if (keyContents?.type === "OSM") {
            topLabel = "OSM";
            displayLabel = keyContents.str || "";
        }

        if (displayLabel === "KC_NO") displayLabel = "";

        const { icons, isMouse } = getHeaderIcons(keycode, displayLabel);
        if (icons.length > 0) {
            topLabel = <div className="flex items-center justify-center gap-1">{icons}</div>;
        }

        const centerContent = getCenterContent(displayLabel, keycode, isMouse);
        return { displayLabel, bottomStr, topLabel, centerContent };
    }, [label, keyContents, keycode]);

    // --- Styling logic ---
    const styles = useMemo(() => {
        const boxStyle: React.CSSProperties = {
            left: isRelative ? undefined : `${x * drag.currentUnitSize}px`,
            top: isRelative ? undefined : `${y * drag.currentUnitSize}px`,
            width: `${w * drag.currentUnitSize}px`,
            height: `${h * drag.currentUnitSize}px`,
        };

        const shouldShrinkText = ["user", "OSM"].includes(keyContents?.type || "") ||
            (typeof keyData.centerContent === "string" && (keyData.centerContent.length > 5 || (keyData.centerContent.length === 5 && keyData.centerContent.toUpperCase().includes("W"))));

        const textStyle: React.CSSProperties = shouldShrinkText ? { whiteSpace: "pre-line", fontSize: "0.6rem", wordWrap: "break-word" } : {};
        const bottomTextStyle: React.CSSProperties = keyData.bottomStr.length > 4 ? { whiteSpace: "pre-line", fontSize: "0.6rem", wordWrap: "break-word" } : {};

        const colorClass = colorClasses[layerColor] || colorClasses["primary"];
        const effectiveHoverColor = hoverLayerColor || layerColor;
        const hoverTextClass = hoverContainerTextClasses[effectiveHoverColor] || hoverContainerTextClasses["primary"];

        const containerClasses = cn(
            "flex flex-col items-center justify-between cursor-pointer transition-all duration-200 ease-in-out uppercase group overflow-hidden select-none",
            !isRelative && "absolute",
            isSmall ? "rounded-[5px] border" : isMedium ? "rounded-[5px] border-2" : "rounded-md border-2",
            (selected || drag.isDragHover)
                ? "bg-red-500 text-white border-kb-gray"
                : drag.isDragSource
                    ? cn(colorClass, "bg-kb-light-grey border-kb-light-grey opacity-60")
                    : cn(
                        colorClass, "border-kb-gray",
                        !disableHover && (hoverBorderColor || "hover:border-red-500"),
                        !disableHover && hoverBackgroundColor,
                        !disableHover && hoverTextClass
                    ),
            className
        );

        return { boxStyle, textStyle, bottomTextStyle, containerClasses };
    }, [x, y, w, h, drag, isRelative, isSmall, isMedium, keyContents, keyData, layerColor, hoverLayerColor, selected, disableHover, hoverBorderColor, hoverBackgroundColor, className]);

    const headerClass = cn(
        "whitespace-nowrap w-full text-center font-semibold py-0 transition-colors duration-200 text-white",
        isSmall ? "text-[10px] rounded-t-[4px]" : isMedium ? "text-[11px] rounded-t-[4px]" : "text-sm rounded-t-sm",
        headerClassName
    );

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick?.(row, col);
    };

    // --- Sub-renderer for layer keys ---
    if (keyContents?.type === "layer") {
        const targetLayer = keyContents?.top?.split("(")[1]?.replace(")", "") || "";
        return (
            <div
                className={styles.containerClasses}
                style={styles.boxStyle}
                onClick={handleClick}
                onMouseEnter={drag.handleMouseEnter}
                onMouseLeave={drag.handleMouseLeave}
                onMouseDown={drag.handleMouseDown}
                onMouseUp={drag.handleMouseUp}
                title={keycode}
            >
                <span className={headerClass}>{keyContents?.layertext}</span>
                <div className={cn("flex flex-row h-full w-full items-center justify-center", isSmall ? "gap-1" : isMedium ? "gap-1.5" : "gap-2")}>
                    <div className={cn("text-center justify-center items-center flex font-semibold", isSmall ? "text-[13px]" : (isMedium || targetLayer.length > 1) ? "text-[14px]" : "text-[16px]")}>
                        {targetLayer}
                    </div>
                    {getTypeIcon("layer", variant)}
                </div>
            </div>
        );
    }

    return (
        <div
            className={styles.containerClasses}
            style={styles.boxStyle}
            onClick={handleClick}
            onMouseEnter={drag.handleMouseEnter}
            onMouseLeave={drag.handleMouseLeave}
            onMouseDown={drag.handleMouseDown}
            onMouseUp={drag.handleMouseUp}
            title={keycode}
        >
            {keyData.topLabel && (
                <span className={cn(headerClass, "flex items-center justify-center", isSmall ? "text-[8px] min-h-[10px]" : isMedium ? "text-[10px] min-h-[14px]" : "min-h-[1.2rem]")}>
                    {keyData.topLabel}
                </span>
            )}

            {keyContents && getTypeIcon(keyContents.type || "", variant)}

            <div
                className={cn("text-center w-full h-full justify-center items-center flex font-semibold", isSmall ? "text-[10px] px-0.5" : isMedium ? "text-[12px] px-1" : (typeof keyData.centerContent === 'string' && keyData.centerContent.length === 1 ? "text-[16px]" : "text-[15px]"))}
                style={styles.textStyle}
            >
                {keyData.centerContent}
            </div>

            {keyData.bottomStr !== "" && (
                <span className={cn(headerClass, "flex items-center justify-center", isSmall ? "text-[8px] min-h-[10px] rounded-b-[4px]" : isMedium ? "text-[10px] min-h-[14px] rounded-b-[4px]" : "min-h-5 rounded-b-sm")} style={styles.bottomTextStyle}>
                    {keyData.bottomStr}
                </span>
            )}
        </div>
    );
};

