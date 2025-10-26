import { FC, useEffect, useState } from "react";

import PlusIcon from "@/components/icons/Plus";
import { usePanels } from "@/contexts/PanelsContext";
import { useVial } from "@/contexts/VialContext";
import { ArrowDown } from "lucide-react";
import MacroEditorKey from "./MacroEditorKey";
import MacroEditorText from "./MacroEditorText";

const MacroEditor: FC = () => {
    const [actions, setActions] = useState<string[][]>([]);
    const { keyboard } = useVial();
    const { itemToEdit } = usePanels();
    const currMacro = (keyboard as any).macros?.[itemToEdit!];
    const handleAddItem = (type: string) => {
        setActions((items) => [...items, [type, ""]]);
    };
    useEffect(() => {
        setActions(currMacro.actions || []);
    }, [currMacro]);
    const AddButton = ({ type, label }: { type: string; label: string }) => {
        return (
            <button
                className="bg-black cursor-pointer text-white px-2 py-1 rounded-full hover:bg-gray-600 transition flex flex-row gap-2 items-center"
                onClick={() => handleAddItem(type)}
            >
                <PlusIcon className="h-5 w-5" /> {label}
            </button>
        );
    };
    return (
        <div className="flex flex-col items-center px-20 gap-4 pt-5 w-full max-h-[600px] overflow-y-auto">
            <div className="flex flex-col gap-1 w-full">
                {actions.map((item, index) => (
                    <>
                        {item[0] === "text" && (
                            <MacroEditorText
                                type="text"
                                value={item[1]}
                                onChange={(value) => {
                                    const newActions = [...actions];
                                    newActions[index][1] = value;
                                    setActions(newActions);
                                }}
                                key={index}
                            />
                        )}
                        {item[0] === "delay" && (
                            <MacroEditorText
                                type="delay"
                                value={item[1]}
                                onChange={(value) => {
                                    const newActions = [...actions];
                                    newActions[index][1] = value;
                                    setActions(newActions);
                                }}
                                key={index}
                            />
                        )}
                        {["down", "up", "tap"].includes(item[0]) && <MacroEditorKey binding={item[1]} key={index} label={item[0]} />}
                        {index < actions.length - 1 && <ArrowDown className="w-4 mx-4" />}
                    </>
                ))}
            </div>
            <div className="flex flex-col gap-1">
                <AddButton type="text" label="Text" />
                <AddButton type="tap" label="Key Tap" />
                <AddButton type="down" label="Key Down" />
                <AddButton type="up" label="Key Up" />
                <AddButton type="delay" label="Delay" />
            </div>
        </div>
    );
};

export default MacroEditor;
