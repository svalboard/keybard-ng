import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { KeyProps } from "@/components/Key";
import { EditorKeyProps } from "@/layout/SecondarySidebar/components/EditorKey";
import { KeyContent } from "@/types/vial.types";

export interface DragItem {
    keycode: string;
    label: string;
    type: string;
    extra?: KeyContent;
    sourceId?: string;
    width?: number;
    height?: number;
    component?: "Key" | "EditorKey";
    props?: KeyProps | EditorKeyProps;
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

/**
 * Provides dragging state and handlers for global drag-and-drop operations.
 */
export const DragProvider: React.FC<DragProviderProps> = ({ children, onUnhandledDrop }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [dragSourceId, setDragSourceId] = useState<string | null>(null);

    const dragItemRef = useRef<DragItem | null>(null);
    const isDraggingRef = useRef(false);
    const dropConsumedRef = useRef(false);

    const markDropConsumed = useCallback(() => {
        dropConsumedRef.current = true;
    }, []);

    const updatePosition = useCallback((x: number, y: number) => {
        setDragPosition({ x, y });
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDraggingRef.current) return;
        updatePosition(e.clientX, e.clientY);
    }, [updatePosition]);

    const handleMouseUp = useCallback(() => {
        if (isDraggingRef.current) {
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

        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    }, [handleMouseMove, onUnhandledDrop]);

    const startDrag = useCallback((item: DragItem, event: React.MouseEvent | MouseEvent) => {
        if (isDraggingRef.current) return;

        dragItemRef.current = item;
        setDraggedItem(item);
        if (item.sourceId) setDragSourceId(item.sourceId);

        dropConsumedRef.current = false;
        updatePosition(event.clientX, event.clientY);

        setIsDragging(true);
        isDraggingRef.current = true;

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    }, [handleMouseMove, handleMouseUp, updatePosition]);

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
