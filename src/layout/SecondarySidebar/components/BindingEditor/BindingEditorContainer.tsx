import "./BindingEditorContainer.css";

import { FC, useCallback, useState, useEffect, useRef, KeyboardEvent } from "react";

import ComboIcon from "@/components/ComboIcon";
import MacrosIcon from "@/components/icons/MacrosIcon";
import OverridesIcon from "@/components/icons/Overrides";
import { usePanels } from "@/contexts/PanelsContext";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import ComboEditor from "./ComboEditor";
import MacroEditor from "./MacroEditor";
import OverrideEditor from "./OverrideEditor";
import TapdanceEditor from "./TapdanceEditor";
import { useVial } from "@/contexts/VialContext";
import { getKeyContents } from "@/utils/keys";
import { Key } from "@/components/Key";
import { KeyContent } from "@/types/vial.types";

interface Props {
    shouldClose?: boolean;
}

const icons = {
    macros: <MacrosIcon />,
    combos: <ComboIcon />,
    overrides: <OverridesIcon />,
};

const labels = {
    tapdances: "Tap Dance Keys",
    macros: "Macro Key",
    combos: "Combo Keys",
    overrides: "Override",
};

const BindingEditorContainer: FC<Props> = ({ shouldClose }) => {
    const { itemToEdit, handleCloseEditor, bindingTypeToEdit } = usePanels();
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (shouldClose && !isClosing) {
            setIsClosing(true);
        }
    }, [shouldClose, isClosing]);

    const handleAnimatedClose = useCallback(() => {
        if (isClosing) {
            return;
        }

        setIsClosing(true);
    }, [isClosing]);

    const handleAnimationEnd = useCallback(() => {
        if (isClosing) {
            handleCloseEditor();
        }
    }, [handleCloseEditor, isClosing]);

    const { keyboard, setKeyboard } = useVial();
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitleValue, setEditTitleValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleStartEditingTitle = () => {
        if (!keyboard || bindingTypeToEdit !== "macros" || itemToEdit === null) return;
        const currentName = keyboard.cosmetic?.macros?.[itemToEdit.toString()] || `Macro Key ${itemToEdit}`;
        setEditTitleValue(currentName);
        setIsEditingTitle(true);
    };

    const handleSaveTitle = () => {
        if (!keyboard || bindingTypeToEdit !== "macros" || itemToEdit === null) {
            setIsEditingTitle(false);
            return;
        }

        const cosmetic = JSON.parse(JSON.stringify(keyboard.cosmetic || {}));
        if (!cosmetic.macros) cosmetic.macros = {};

        if (editTitleValue.trim() === "" || editTitleValue.trim() === `Macro Key ${itemToEdit}`) {
            delete cosmetic.macros[itemToEdit.toString()];
        } else {
            cosmetic.macros[itemToEdit.toString()] = editTitleValue;
        }

        setKeyboard({ ...keyboard, cosmetic });
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSaveTitle();
        } else if (e.key === "Escape") {
            setIsEditingTitle(false);
        }
    };

    const containerClasses = cn("absolute top-1/2 -translate-y-1/2", bindingTypeToEdit === "overrides" ? "w-[500px] right-[-500px]" : "w-[450px] right-[-450px]");
    const panelClasses = cn("binding-editor bg-kb-gray-medium rounded-r-2xl p-5 flex flex-col w-full min-h-[500px] shadow-[4px_0_16px_rgba(0,0,0,0.1)]", isClosing ? "binding-editor--exit" : "binding-editor--enter");

    const renderHeaderIcon = () => {
        if (bindingTypeToEdit === "tapdances" && itemToEdit !== null && keyboard) {
            const keycode = `TD(${itemToEdit})`;
            const keyContents = getKeyContents(keyboard, keycode) as KeyContent;
            return (
                <div className="relative w-14 h-14">
                    <Key
                        isRelative
                        x={0}
                        y={0}
                        w={1}
                        h={1}
                        row={-1}
                        col={-1}
                        keycode={keycode}
                        label={itemToEdit.toString()}
                        keyContents={keyContents}
                        layerColor="sidebar"
                    />
                </div>
            );
        }

        const icon = (icons as any)[bindingTypeToEdit!];
        if (icon) {
            return (
                <div className="flex flex-col bg-black h-14 w-14 rounded-sm flex-shrink-0 items-center ">
                    <div className="h-5 w-5 mt-3 text-white">{icon}</div>
                    <span className="text-sm text-white">{itemToEdit}</span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={containerClasses}>
            <div className={panelClasses} onAnimationEnd={handleAnimationEnd}>
                <div className="flex flex-row w-full items-center pr-5 pl-[84px] justify-between pt-2 pb-5">
                    <div className="flex flex-row items-center">
                        {renderHeaderIcon()}
                        <div className="pl-5 text-xl font-normal">
                            {bindingTypeToEdit === "macros" ? (
                                isEditingTitle ? (
                                    <div className="flex items-center gap-2 bg-white rounded-md px-1 py-0.5 border border-black shadow-sm">
                                        <Input
                                            ref={inputRef}
                                            value={editTitleValue}
                                            onChange={(e) => setEditTitleValue(e.target.value)}
                                            onBlur={handleSaveTitle}
                                            onKeyDown={handleTitleKeyDown}
                                            className="h-auto py-1 px-2 text-lg font-bold border-none focus-visible:ring-0 w-auto min-w-[130px]"
                                            autoFocus
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="cursor-pointer hover:bg-black/5 rounded-md px-2 py-1 transition-colors"
                                        onClick={handleStartEditingTitle}
                                        title="Click to rename"
                                    >
                                        {keyboard?.cosmetic?.macros?.[itemToEdit!.toString()] || `Macro Key ${itemToEdit}`}
                                    </div>
                                )
                            ) : bindingTypeToEdit === "combos" ? (
                                `Combo Key ${itemToEdit}`
                            ) : bindingTypeToEdit === "tapdances" ? (
                                `Tap Dance Key ${itemToEdit}`
                            ) : bindingTypeToEdit === "overrides" ? (
                                `Override ${itemToEdit}`
                            ) : (
                                (labels as any)[bindingTypeToEdit!]
                            )}
                        </div>
                    </div>
                    {!isEditingTitle && (
                        <button
                            type="button"
                            onClick={handleAnimatedClose}
                            className="rounded-sm p-1 text-kb-gray-border transition-all hover:text-black focus:outline-none focus:text-black cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
                {bindingTypeToEdit === "tapdances" && <TapdanceEditor />}
                {bindingTypeToEdit === "combos" && <ComboEditor />}
                {bindingTypeToEdit === "overrides" && <OverrideEditor />}
                {bindingTypeToEdit === "macros" && <MacroEditor />}
            </div>
        </div>
    );
};

export default BindingEditorContainer;
