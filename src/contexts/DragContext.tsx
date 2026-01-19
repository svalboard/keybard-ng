import React, { createContext, useContext, useState, useRef, useCallback } from "react";

export interface DragItem {
    keycode: string;
    label: string;
    type: string;
    extra?: any;
    // We might need to know the original source to apply styling
    sourceId?: string;
    width?: number;
    height?: number;
    component?: "Key" | "EditorKey";
    props?: any;
}

interface DragContextType {
    isDragging: boolean;
    draggedItem: DragItem | null;
    dragPosition: { x: number; y: number };
    startDrag: (item: DragItem, event: React.MouseEvent | MouseEvent) => void;
    dragSourceId: string | null;
}

const DragContext = createContext<DragContextType | undefined>(undefined);

export const DragProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [dragSourceId, setDragSourceId] = useState<string | null>(null);

    // To avoid stale closures in event listeners
    const dragItemRef = useRef<DragItem | null>(null);
    const isDraggingRef = useRef(false);

    const updatePosition = (x: number, y: number) => {
        setDragPosition({ x, y });
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDraggingRef.current) return;
        updatePosition(e.clientX, e.clientY);
    }, []);

    const handleMouseUp = useCallback(() => {
        if (isDraggingRef.current) {
            setIsDragging(false);
            setDraggedItem(null);
            setDragSourceId(null);
            dragItemRef.current = null;
            isDraggingRef.current = false;
        }

        // Remove listeners
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    }, [handleMouseMove]);

    const startDrag = useCallback((item: DragItem, event: React.MouseEvent | MouseEvent) => {
        if (isDraggingRef.current) return;

        dragItemRef.current = item;
        setDraggedItem(item);
        if (item.sourceId) {
            setDragSourceId(item.sourceId);
        }

        // Initial position
        updatePosition(event.clientX, event.clientY);

        // We only "officially" start dragging after a small threshold or immediately?
        // The user requirement says: "appears as soon as you drag the mouse off the clicked key".
        // For simplicity, let's start "logical" dragging immediately but we might visually handle the "off-key" check elsewhere,
        // or just start immediately. 
        // User said: "create a new key called dragKey ... it appears as soon as you drag the mouse off the clicked key"
        // This implies we might need a threshold. 
        // But typically, a small movement threshold (e.g. 5px) is good. 

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
        dragSourceId
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
