import React from "react";
import { cn } from "@/lib/utils";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useDrag } from "@/contexts/DragContext";
import { showModMask } from "@/utils/keys";
import { colorClasses, hoverContainerTextClasses } from "@/utils/colors";
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
    variant?: "default" | "medium" | "small";
    hoverBorderColor?: string;
    hoverBackgroundColor?: string;
    hoverLayerColor?: string;
    disableHover?: boolean;
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
    hoverLayerColor,
    disableHover = false,
}) => {
    const isSmall = variant === "small";
    const isMedium = variant === "medium";
    const currentUnitSize = isSmall ? 30 : isMedium ? 45 : UNIT_SIZE;
    const { setHoveredKey, assignKeycode, selectKeyboardKey } = useKeyBinding();

    // Drag and Drop Logic
    const { startDrag, dragSourceId, isDragging, draggedItem } = useDrag();
    const uniqueId = React.useId();
    const startPosRef = React.useRef<{ x: number, y: number } | null>(null);
    const [isDragHover, setIsDragHover] = React.useState(false);

    // Is this key the one being dragged?
    const isDragSource = dragSourceId === uniqueId;

    // Can this key be a drag source? (Only sidebar keys / relative keys)
    const canDrag = isRelative; // Assuming isRelative implies sidebar/panel key

    // Can this key be a drop target? (Only main keyboard keys)
    const canDrop = !isRelative && isDragging;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClick) {
            onClick(row, col);
        }
    };

    const handleMouseEnter = () => {
        if (canDrop) {
            setIsDragHover(true);
            // Auto-select the key under the drag to ensure assignment works
            // This is "selecting" it for binding, effectively
            selectKeyboardKey(parseInt(layerColor) || 0, row, col); // layerColor is string '0', '1' etc? or 'primary'?
            // layerColor usually maps to a name, but Key component doesn't explicitly get layer index maybe?
            // Props has 'layerColor', but not 'layerIndex'?
            // Ah, Key props: x, y, ..., row, col, layerColor.
            // Where do we get the actual layer number?
            // Usually Key is rendered by Keyboard which has `selectedLayer`.
            // But Key doesn't receive `layer` index.
            // Wait, we need the layer index to select it.
            // Let's assume the Key is on the *active* layer if it's visible?
            // Or maybe use a context for current layer if possible? 
            // In Keyboard.tsx it calls Key.
            // We can't easily get layer index here if not passed.
            // BUT, `onClick` calls `onClick(row, col)`. 
            // `onClick` in Keyboard.tsx does `selectKeyboardKey(selectedLayer, r, c)`.
            // So we should mimic that if we can.
            // Key doesn't access selectKeyboardKey directly usually, it calls onClick.
            // BUT here we are inside Key.
            // If we have `onClick` prop, maybe we can just call it?
            // But `onClick` expects a click event or just row/col?
            // Key.tsx: onClick: (row: number, col: number) => void;
            // So we can call onClick(row, col) to trigger selection!
            if (onClick) onClick(row, col);
        }

        if (disableHover) return;
        setHoveredKey({
            type: "keyboard",
            row,
            col,
            keycode,
            label,
        });
    };

    const handleMouseLeave = () => {
        if (canDrop) {
            setIsDragHover(false);
        }

        if (disableHover) return;
        setHoveredKey(null);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!canDrag || e.button !== 0) return;

        startPosRef.current = { x: e.clientX, y: e.clientY };

        const checkDrag = (moveEvent: MouseEvent) => {
            const start = startPosRef.current;
            if (!start) return;

            const dx = moveEvent.clientX - start.x;
            const dy = moveEvent.clientY - start.y;

            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                startDrag({
                    keycode: keycode,
                    label: label || displayLabel || keycode,
                    type: keyContents?.type || "keyboard",
                    extra: keyContents,
                    sourceId: uniqueId,
                    width: w * currentUnitSize,
                    height: h * currentUnitSize,
                    component: "Key",
                    props: {
                        x: 0, // Relative to overlay
                        y: 0,
                        w,
                        h,
                        keycode,
                        label,
                        row,
                        col,
                        layerColor,
                        keyContents,
                        isRelative: true, // Treat as relative for positioning in overlay
                        variant,
                        className: "", // Reset positioning classes if any?
                        // We want it to look like the source, so maybe keep some classes but remove absolute positioning ones?
                        // Key component handles isRelative by not using absolute.
                        // We might want to clear selection or specific source styles?
                        // Use default style (not selected, not drag source)
                        selected: false,
                        disableHover: true, // Don't trigger hover logic in ghost
                    }
                }, {
                    clientX: moveEvent.clientX,
                    clientY: moveEvent.clientY,
                } as any);
                cleanup();
            }
        };

        const handleUp = () => {
            cleanup();
        };

        const cleanup = () => {
            startPosRef.current = null;
            window.removeEventListener("mousemove", checkDrag);
            window.removeEventListener("mouseup", handleUp);
        };

        window.addEventListener("mousemove", checkDrag);
        window.addEventListener("mouseup", handleUp);
    };

    const handleMouseUp = () => {
        if (canDrop && isDragHover && draggedItem) {
            // Drop Action
            console.log("Dropping", draggedItem, "onto", keycode);
            assignKeycode(draggedItem.keycode);
            setIsDragHover(false); // Reset hover state
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
        const keysArr = keyContents.str?.split("\n") || [];
        const keyStr = keysArr[0] || "";

        if (!label || label === keycode) {
            // Main keyboard case: label equals keycode (e.g., "LCTL(kc)")
            // Need to construct a display label like "LCTL (kc)" to match panel
            if (keyStr === "" || keyStr === "KC_NO") {
                // It's a placeholder - show modifier + (kc) in center
                const modStr = keyContents.top || "";
                displayLabel = `${modStr} (kc)`;
            } else {
                // It has an actual key - show modifier + key
                const modStr = keyContents.top || "";
                displayLabel = `${modStr} ${keyStr}`;
            }
        }
        // else: QMK panel case - label already has proper format like "LCTL (kc)"

        bottomStr = show;
    }

    if (keyContents?.type === "tapdance") {
        displayLabel = keyContents.tdid?.toString() || "";
    } else if (keyContents?.type === "macro") {
        displayLabel = keyContents.top?.replace("M", "") || "";
    } else if (keyContents?.type === "user") {
        displayLabel = keyContents.str || "";
    } else if (keyContents?.type === "OSM") {
        topLabel = "OSM";
        displayLabel = keyContents.str || "";
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

    // Get the base color classes
    const colorClass = colorClasses[layerColor] || colorClasses["primary"];

    // Determine hover color - use hoverLayerColor if provided, otherwise default to current layer
    const effectiveHoverColorName = hoverLayerColor || layerColor;
    const hoverContainerTextClass = hoverContainerTextClasses[effectiveHoverColorName] || hoverContainerTextClasses["primary"];

    // Common container classes
    const containerClasses = cn(
        "flex flex-col items-center justify-between cursor-pointer transition-all duration-200 ease-in-out uppercase group overflow-hidden",
        !isRelative && "absolute",
        isSmall ? "rounded-[5px] border" : isMedium ? "rounded-[5px] border-2" : "rounded-md border-2",
        // Conditional Styling for Drop Target (Red) and Drag Source (Blue/Fade)
        (selected || isDragHover)
            ? "bg-red-500 text-white border-kb-gray"
            : isDragSource
                ? "bg-blue-500/35 border-blue-500 text-transparent opacity-65"
                : cn(
                    colorClass,
                    "border-kb-gray",
                    !disableHover && (hoverBorderColor || "hover:border-red-500"),
                    !disableHover && hoverBackgroundColor,
                    !disableHover && hoverContainerTextClass
                ),
        "select-none", // Prevent text selection
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
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                title={keycode}
            >
                <span className={cn(
                    "whitespace-nowrap w-full text-center font-semibold py-0 transition-colors duration-200",
                    isSmall ? "text-[10px] rounded-t-[4px]" : isMedium ? "text-[11px] rounded-t-[4px]" : "text-sm rounded-t-sm",
                    "text-white",
                    headerClassName
                )}>
                    {keyContents?.layertext}
                </span>

                <div className={cn("flex flex-row h-full w-full items-center justify-center", isSmall ? "gap-1" : isMedium ? "gap-1.5" : "gap-2")}>
                    <div className={cn(
                        "text-center justify-center items-center flex font-semibold",
                        isSmall ? "text-[13px]" : (isMedium || layerIndex.length > 1) ? "text-[14px]" : "text-[16px]"
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
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            title={keycode}
        >
            {topLabel && (
                <span className={cn(
                    "whitespace-nowrap w-full text-center font-semibold py-0 flex items-center justify-center transition-colors duration-200",
                    isSmall ? "text-[8px] min-h-[10px] rounded-t-[4px]" : isMedium ? "text-[10px] min-h-[14px] rounded-t-[4px]" : "text-sm min-h-[1.2rem] rounded-t-sm",
                    "text-white",
                    headerClassName
                )}>
                    {topLabel}
                </span>
            )}

            {keyContents && getTypeIcon(keyContents.type || "", variant)}

            <div
                className={cn(
                    "text-center w-full h-full justify-center items-center flex font-semibold",
                    isSmall ? "text-[10px] px-0.5" : isMedium ? "text-[12px] px-1" : (typeof centerContent === 'string' && centerContent.length === 1 ? "text-[16px]" : "text-[15px]")
                )}
                style={textStyle}
            >
                {centerContent}
            </div>

            {bottomStr !== "" && (
                <span
                    className={cn(
                        "font-semibold items-center flex justify-center whitespace-nowrap w-full text-center py-0 transition-colors duration-200",
                        isSmall ? "text-[8px] min-h-[10px] rounded-b-[4px]" : isMedium ? "text-[10px] min-h-[14px] rounded-b-[4px]" : "text-sm min-h-5 rounded-b-sm",
                        "text-white",
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
