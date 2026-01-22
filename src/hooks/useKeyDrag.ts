import React, { useRef, useState, useMemo, useCallback } from "react";
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

/**
 * Custom hook to handle drag and drop logic for a single key.
 */
export const useKeyDrag = (props: UseKeyDragProps) => {
    const {
        uniqueId, keycode, label, row, col, layerIndex, layerColor,
        isRelative, keyContents, w, h, variant, onClick, disableHover
    } = props;

    const { startDrag, dragSourceId, isDragging, draggedItem, markDropConsumed } = useDrag();
    const { assignKeycode, selectKeyboardKey, swapKeys, setHoveredKey } = useKeyBinding();

    const startPosRef = useRef<{ x: number; y: number } | null>(null);
    const [isDragHover, setIsDragHover] = useState(false);

    const currentUnitSize = useMemo(() => {
        if (variant === "small") return 30;
        if (variant === "medium") return 45;
        return UNIT_SIZE;
    }, [variant]);

    const isDragSource = dragSourceId === uniqueId;
    const canDrop = !isRelative && isDragging;

    const handleMouseEnter = useCallback(() => {
        if (canDrop) {
            setIsDragHover(true);
            selectKeyboardKey(layerIndex, row, col);
            onClick?.(row, col);
        }

        if (!disableHover) {
            setHoveredKey({ type: "keyboard", row, col, keycode, label });
        }
    }, [canDrop, selectKeyboardKey, layerIndex, row, col, onClick, disableHover, setHoveredKey, keycode, label]);

    const handleMouseLeave = useCallback(() => {
        if (canDrop) {
            setIsDragHover(false);
        }

        if (!disableHover) {
            setHoveredKey(null);
        }
    }, [canDrop, disableHover, setHoveredKey]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0) return;

        startPosRef.current = { x: e.clientX, y: e.clientY };

        const checkDrag = (moveEvent: MouseEvent) => {
            const start = startPosRef.current;
            if (!start) return;

            const dx = moveEvent.clientX - start.x;
            const dy = moveEvent.clientY - start.y;

            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                const dragPayload: DragItem = {
                    keycode,
                    label: label || keycode,
                    type: keyContents?.type || "keyboard",
                    extra: keyContents,
                    sourceId: uniqueId,
                    width: w * currentUnitSize,
                    height: h * currentUnitSize,
                    component: "Key",
                    props: {
                        x: 0, y: 0, w, h, keycode, label, row, col,
                        layerColor, keyContents, isRelative: true,
                        variant, className: "", selected: false, disableHover: true
                    },
                    row: isRelative ? undefined : row,
                    col: isRelative ? undefined : col,
                    layer: isRelative ? undefined : layerIndex
                };

                startDrag(dragPayload, moveEvent);
                cleanup();
            }
        };

        const handleUp = () => cleanup();

        const cleanup = () => {
            startPosRef.current = null;
            window.removeEventListener("mousemove", checkDrag);
            window.removeEventListener("mouseup", handleUp);
        };

        window.addEventListener("mousemove", checkDrag);
        window.addEventListener("mouseup", handleUp);
    }, [keycode, label, keyContents, uniqueId, w, currentUnitSize, h, row, col, layerColor, variant, isRelative, layerIndex, startDrag]);

    const handleMouseUp = useCallback(() => {
        if (canDrop && isDragHover && draggedItem) {
            markDropConsumed();

            if (draggedItem.row !== undefined && draggedItem.col !== undefined && draggedItem.layer !== undefined) {
                if (draggedItem.row !== row || draggedItem.col !== col || draggedItem.layer !== layerIndex) {
                    swapKeys(
                        { type: "keyboard", row: draggedItem.row, col: draggedItem.col, layer: draggedItem.layer },
                        { type: "keyboard", row, col, layer: layerIndex }
                    );
                }
            } else {
                assignKeycode(draggedItem.keycode);
            }

            setIsDragHover(false);
        }
    }, [canDrop, isDragHover, draggedItem, markDropConsumed, row, col, layerIndex, swapKeys, assignKeycode]);

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

