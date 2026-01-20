import { Key } from "@/components/Key";
import EditorKey from "@/layout/SecondarySidebar/components/EditorKey";
import React from "react";
import { useDrag } from "@/contexts/DragContext";
import MacrosIcon from "@/components/icons/MacrosIcon";
import { cn } from "@/lib/utils";

// Reusing styles from EditorKey roughly to ensure it looks identical
const classes = {
    key: "bg-white border-2 border-kb-gray-border w-12 h-12 rounded-md flex flex-col items-center justify-center shadow-lg pointer-events-none z-[9999]",
    emptyKey:
        "bg-kb-green text-white w-12 h-12 rounded-md border-2 border-transparent flex items-center justify-center text-wrap text-center text-xs flex-col shadow-lg pointer-events-none z-[9999]",
};

export const DragOverlay: React.FC = () => {
    const { isDragging, draggedItem, dragPosition } = useDrag();

    if (!isDragging || !draggedItem) return null;

    // Use dimensions if provided (Key.tsx provides exact pixel dimensions), otherwise default (EditorKey 48px)
    const width = draggedItem.width || 48;
    const height = draggedItem.height || 48;

    // We position the overlay so its center matches the cursor
    const style: React.CSSProperties = {
        position: "fixed",
        left: `${dragPosition.x}px`,
        top: `${dragPosition.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: "none",
        zIndex: 9999,
    };

    const renderContent = () => {
        if (draggedItem.component === "Key" && draggedItem.props) {
            return <Key {...draggedItem.props as any} />;
        }
        if (draggedItem.component === "EditorKey" && draggedItem.props) {
            return <EditorKey {...draggedItem.props as any} />;
        }

        // Fallback for any other items or legacy path
        const displayText = draggedItem.label || draggedItem.keycode;
        const isMacro = draggedItem.type === "macro";
        const keyClass = displayText !== "" ? classes.emptyKey : classes.key;

        return (
            <div className={cn(keyClass, "border-red-600 !w-full !h-full shadow-none")}>
                {isMacro && <MacrosIcon className="mt-2 h-8" />}
                {displayText && <span style={{ whiteSpace: "pre-line" }}>{displayText}</span>}
            </div>
        );
    };

    return (
        <div style={style} className="shadow-lg rounded-md bg-white">
            {renderContent()}
        </div>
    );
};
