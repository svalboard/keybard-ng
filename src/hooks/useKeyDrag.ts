import React, { useRef, useState } from "react";
import { DragItem, useDrag } from "@/contexts/DragContext";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { KeyContent } from "@/types/vial.types";
import { UNIT_SIZE } from "@/constants/svalboard-layout";

export interface UseKeyDragProps {
    uniqueId: string;
    keycode: string;
    label: string;
    row: number;
    col: number;
    layerIndex: number;
    layerColor: string;
    isRelative: boolean;
    keyContents?: KeyContent;
    w: number;
    h: number;
    variant: "default" | "medium" | "small";
    onClick?: (row: number, col: number) => void;
    disableHover?: boolean;
}

export const useKeyDrag = ({
    uniqueId,
    keycode,
    label,
    row,
    col,
    layerIndex,
    layerColor,
    isRelative,
    keyContents,
    w,
    h,
    variant,
    onClick,
    disableHover,
}: UseKeyDragProps) => {
    const { startDrag, dragSourceId, isDragging, draggedItem } = useDrag();
    const { assignKeycode, selectKeyboardKey, swapKeys, setHoveredKey } = useKeyBinding();
    const startPosRef = useRef<{ x: number; y: number } | null>(null);
    const [isDragHover, setIsDragHover] = useState(false);

    const isSmall = variant === "small";
    const isMedium = variant === "medium";
    const currentUnitSize = isSmall ? 30 : isMedium ? 45 : UNIT_SIZE;

    // Is this key the one being dragged?
    const isDragSource = dragSourceId === uniqueId;

    // Can this key be a drag source?
    const canDrag = true;

    // Can this key be a drop target? (Only main keyboard keys)
    const canDrop = !isRelative && isDragging;

    const handleMouseEnter = () => {
        if (canDrop) {
            setIsDragHover(true);
            // Auto-select the key under the drag to ensure assignment works
            selectKeyboardKey(layerIndex, row, col);
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
                const dragPayload: DragItem = {
                    keycode: keycode,
                    label: label || keycode,
                    type: keyContents?.type || "keyboard",
                    extra: keyContents,
                    sourceId: uniqueId,
                    width: w * currentUnitSize,
                    height: h * currentUnitSize,
                    component: "Key",
                    props: {
                        x: 0,
                        y: 0,
                        w,
                        h,
                        keycode,
                        label,
                        row,
                        col,
                        layerColor,
                        keyContents,
                        isRelative: true,
                        variant,
                        className: "",
                        selected: false,
                        disableHover: true,
                    },
                    // Add coords for swap logic if this is a main key
                    row: isRelative ? undefined : row,
                    col: isRelative ? undefined : col,
                    layer: isRelative ? undefined : layerIndex
                };

                startDrag(dragPayload, {
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
            console.log("Dropping", draggedItem, "onto", keycode);

            // Swap Logic
            if (draggedItem.row !== undefined && draggedItem.col !== undefined && draggedItem.layer !== undefined) {
                if (draggedItem.row === row && draggedItem.col === col && draggedItem.layer === layerIndex) {
                    // Same key - do nothing
                } else {
                    console.log("Swapping keys atomically");
                    swapKeys(
                        { type: "keyboard", row: draggedItem.row, col: draggedItem.col, layer: draggedItem.layer },
                        { type: "keyboard", row, col, layer: layerIndex }
                    );
                }
            } else {
                // Standard assignment
                assignKeycode(draggedItem.keycode);
            }

            setIsDragHover(false);
        }
    };

    return {
        isDragSource,
        isDragHover,
        handleMouseEnter,
        handleMouseLeave,
        handleMouseDown,
        handleMouseUp,
        currentUnitSize,
    };
};
