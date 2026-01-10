import { FC, useEffect, useState } from "react";

import PlusIcon from "@/components/icons/Plus";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { usePanels } from "@/contexts/PanelsContext";
import { useVial } from "@/contexts/VialContext";
import { ArrowDown } from "lucide-react";
import MacroEditorKey from "./MacroEditorKey";
import MacroEditorText from "./MacroEditorText";

const MacroEditor: FC = () => {
    const [actions, setActions] = useState<any[]>([]);
    const [focusIndex, setFocusIndex] = useState<number | null>(null);
    const { keyboard, setKeyboard } = useVial();
    const { itemToEdit, setPanelToGoBack, setAlternativeHeader } = usePanels();
    const { selectComboKey: _selectComboKey, selectMacroKey, selectedTarget, clearSelection } = useKeyBinding();

    useEffect(() => {
        setPanelToGoBack("macros");
        setAlternativeHeader(true);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Delete" || e.key === "Backspace") {
                // Ensure we are not typing in an input
                const target = e.target as HTMLElement;
                if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

                if (selectedTarget && selectedTarget.type === "macro" && selectedTarget.macroId === itemToEdit) {
                    const indexToDelete = selectedTarget.macroIndex;
                    if (indexToDelete !== undefined && indexToDelete >= 0 && indexToDelete < actions.length) {
                        e.preventDefault();
                        const newActions = [...actions];
                        newActions.splice(indexToDelete, 1);
                        setActions(newActions);
                        clearSelection();
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedTarget, actions, itemToEdit, clearSelection]);

    // Load macros
    useEffect(() => {
        if (!keyboard || itemToEdit === null) return;
        const currMacro = (keyboard as any).macros?.[itemToEdit];
        const newActions = currMacro?.actions || [];

        // Only update local state if different from keyboard state
        if (JSON.stringify(newActions) !== JSON.stringify(actions)) {
            setActions(newActions);
        }
    }, [itemToEdit, keyboard]);

    // Manual helper to update both local state and keyboard context
    const updateActions = (newActions: any[]) => {
        setActions(newActions);

        if (!keyboard || itemToEdit === null) return;

        const updatedKeyboard = { ...keyboard };

        // Properly shallow copy the macros array
        if (!updatedKeyboard.macros) {
            updatedKeyboard.macros = [];
        } else {
            updatedKeyboard.macros = [...updatedKeyboard.macros];
        }

        updatedKeyboard.macros[itemToEdit] = {
            ...(updatedKeyboard.macros[itemToEdit] || {}),
            mid: itemToEdit,
            actions: newActions,
        };
        setKeyboard(updatedKeyboard);
    };

    const handleAddItem = (type: string) => {
        const newActions = [...actions, [type, ""]];
        updateActions(newActions);

        if (["down", "up", "tap"].includes(type)) {
            // Need to update local selection context after state update
            setTimeout(() => {
                selectMacroKey(itemToEdit!, newActions.length - 1);
            }, 0);
        } else if (["text", "delay"].includes(type)) {
            setFocusIndex(newActions.length - 1);
        }
    };

    const handleDeleteItem = (index: number) => {
        const newActions = [...actions];
        newActions.splice(index, 1);
        updateActions(newActions);
        clearSelection();
    };

    const handleTextChange = (index: number, value: any) => {
        const newActions = [...actions];
        newActions[index][1] = value;
        updateActions(newActions);
    };

    const AddButton = ({ type, label }: { type: string; label: string }) => {
        return (
            <button
                className="bg-black cursor-pointer text-white pl-[19px] pr-[22px] py-2 rounded-md hover:bg-gray-600 transition flex flex-row gap-2 items-center"
                onClick={() => handleAddItem(type)}
            >
                <PlusIcon className="h-5 w-5" /> {label}
            </button>
        );
    };
    return (
        <div
            className="flex flex-col items-start pl-[84px] pr-5 gap-1 pt-5 w-full max-h-[600px] overflow-y-auto"
            onClick={(e) => {
                // Should only clear if clicking the background, not a child element
                if (e.target === e.currentTarget) {
                    clearSelection();
                }
            }}
        >
            <div className="flex flex-col gap-1 w-full">
                {actions.map((item, index) => (
                    <div className="flex flex-col gap-1 w-full" key={index}>
                        {item[0] === "text" && (
                            <MacroEditorText
                                type="text"
                                value={item[1]}
                                onChange={(value) => handleTextChange(index, value)}
                                onDelete={() => handleDeleteItem(index)}
                                autoFocus={index === focusIndex}
                            />
                        )}
                        {item[0] === "delay" && (
                            <MacroEditorText
                                type="delay"
                                value={item[1]}
                                onChange={(value) => handleTextChange(index, value)}
                                onDelete={() => handleDeleteItem(index)}
                                autoFocus={index === focusIndex}
                            />
                        )}
                        {["down", "up", "tap"].includes(item[0]) && (
                            <MacroEditorKey
                                binding={item[1]}
                                index={index}
                                label={item[0].charAt(0).toUpperCase() + item[0].slice(1)}
                                onDelete={() => handleDeleteItem(index)}
                            />
                        )}
                        {index < actions.length - 1 && <ArrowDown className="w-6 h-6 text-black ml-[18px]" />}
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-1">
                {actions.length > 0 && <ArrowDown className="w-6 h-6 text-black ml-[18px]" />}
                <AddButton type="tap" label="Key Tap" />
                <AddButton type="down" label="Key Down" />
                <AddButton type="up" label="Key Up" />
                <AddButton type="text" label="Text" />
                <AddButton type="delay" label="Delay" />
            </div>
        </div>
    );
};

export default MacroEditor;
