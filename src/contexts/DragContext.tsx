import React, { createContext, useContext, useState, useRef, useCallback } from "react";

import { KeyProps } from "@/components/Key";
import { EditorKeyProps } from "@/layout/SecondarySidebar/components/EditorKey";
import { KeyContent } from "@/types/vial.types";

export interface DragItem {
    keycode: string;
    label: string;
    type: string;
    extra?: KeyContent;
    // We might need to know the original source to apply styling
    sourceId?: string;
    width?: number;
    height?: number;
    component?: "Key" | "EditorKey";
    props?: KeyProps | EditorKeyProps;
    // For main keys, we need coordinates to perform swap
    row?: number;
    col?: number;
    layer?: number;
}

interface DragContextType {
    isDragging: boolean;
    draggedItem: DragItem | null;
    dragPosition: { x: number; y: number };
    startDrag: (item: DragItem, event: React.MouseEvent | MouseEvent) => void;
    dragSourceId: string | null;
    markDropConsumed: () => void;
}

const DragContext = createContext<DragContextType | undefined>(undefined);

interface DragProviderProps {
    children: React.ReactNode;
    onUnhandledDrop?: (item: DragItem) => void;
}

export const DragProvider: React.FC<DragProviderProps> = ({ children, onUnhandledDrop }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [dragSourceId, setDragSourceId] = useState<string | null>(null);

    // To avoid stale closures in event listeners
    const dragItemRef = useRef<DragItem | null>(null);
    const isDraggingRef = useRef(false);
    const dropConsumedRef = useRef(false);

    const markDropConsumed = useCallback(() => {
        dropConsumedRef.current = true;
    }, []);

    const updatePosition = (x: number, y: number) => {
        setDragPosition({ x, y });
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDraggingRef.current) return;
        updatePosition(e.clientX, e.clientY);
    }, []);

    const handleMouseUp = useCallback(() => {
        if (isDraggingRef.current) {
            // Check if drop was consumed by a target
            if (!dropConsumedRef.current && onUnhandledDrop && dragItemRef.current) {
                onUnhandledDrop(dragItemRef.current);
            }

            setIsDragging(false);
            setDraggedItem(null);
            setDragSourceId(null);
            dragItemRef.current = null;
            isDraggingRef.current = false;
            dropConsumedRef.current = false;
        }

        // Remove listeners
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    }, [handleMouseMove, onUnhandledDrop]);

    const startDrag = useCallback((item: DragItem, event: React.MouseEvent | MouseEvent) => {
        if (isDraggingRef.current) return;

        dragItemRef.current = item;
        setDraggedItem(item);
        if (item.sourceId) {
            setDragSourceId(item.sourceId);
        }

        dropConsumedRef.current = false;

        // Initial position
        updatePosition(event.clientX, event.clientY);

        setIsDragging(true);
        isDraggingRef.current = true;

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    }, [handleMouseMove, handleMouseUp]);

    const value = {
        isDragging,
        draggedItem,
        dragPosition,
        startDrag,
        dragSourceId,
        markDropConsumed
    };

    return <DragContext.Provider value={value}>{children}</DragContext.Provider>;
};

export const useDrag = (): DragContextType => {
    const context = useContext(DragContext);
    if (!context) {
        throw new Error("useDrag must be used within a DragProvider");
    }
    return context;
};
