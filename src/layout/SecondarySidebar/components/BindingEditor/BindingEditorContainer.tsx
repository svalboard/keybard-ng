import ComboIcon from "@/components/ComboIcon";
import MacrosIcon from "@/components/icons/MacrosIcon";
import OverridesIcon from "@/components/icons/Overrides";
import TapdanceIcon from "@/components/icons/Tapdance";
import { usePanels } from "@/contexts/PanelsContext";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { FC } from "react";
import EditorSidePanel from "../EditorSidePanel";
import ComboEditor from "./ComboEditor";
import MacroEditor from "./MacroEditor";
import OverrideEditor from "./OverrideEditor";
import TapdanceEditor from "./TapdanceEditor";

interface Props {}

const icons = {
    tapdances: <TapdanceIcon />,
    macros: <MacrosIcon />,
    combos: <ComboIcon />,
    overrides: <OverridesIcon />,
};

const labels = {
    tapdances: "Tapdance Key",
    macros: "Macro Key",
    combos: "Combo Key",
    overrides: "Override",
};

const BindingEditorContainer: FC<Props> = ({}) => {
    const { itemToEdit, handleCloseEditor, bindingTypeToEdit } = usePanels();
    const classes = {
        container: cn(
            "absolute top-1/2 -translate-y-1/2 bg-kb-gray-medium rounded-r-2xl p-5 flex flex-col",
            bindingTypeToEdit === "overrides" ? "w-[500px] right-[-500px]" : "w-[400px] right-[-400px]"
        ),
    };

    return (
        <div className={classes.container}>
            <div className="flex flex-row w-full items-center pr-5 pl-10 justify-between pt-2">
                <EditorSidePanel parentPanel="tapdances" />
                <div className="flex flex-row items-center">
                    <div className="flex flex-col bg-black h-14 w-14 rounded-sm flex-shrink-0 items-center ">
                        <div className="h-5 w-5 mt-3 text-white">{(icons as any)[bindingTypeToEdit!]}</div>
                        <span className="text-sm text-white">{itemToEdit}</span>
                    </div>
                    <div className="pl-5 text-xl font-normal">{(labels as any)[bindingTypeToEdit!]}</div>
                </div>
                <button
                    type="button"
                    onClick={handleCloseEditor}
                    className="rounded-sm p-1 text-kb-gray-border transition-all hover:text-black focus:outline-none focus:text-black cursor-pointer"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
            {bindingTypeToEdit === "tapdances" && <TapdanceEditor />}
            {bindingTypeToEdit === "combos" && <ComboEditor />}
            {bindingTypeToEdit === "overrides" && <OverrideEditor />}
            {bindingTypeToEdit === "macros" && <MacroEditor />}
        </div>
    );
};

export default BindingEditorContainer;
