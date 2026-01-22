import MacrosIcon from "@/components/icons/MacrosIcon";
import { FC } from "react";

interface Props {
    label?: string;
    binding?: any;
    onClick?: () => void;
    selected?: boolean;
}

const classes = {
    key: "bg-white border border-kb-gray-border border-2 w-12 h-12 rounded-md cursor-pointer hover:border-red-600 transition-all flex flex-col",
    emptyKey:
        "bg-kb-green text-white w-12 h-12 rounded-md cursor-pointer hover:border-2 border-2 border border-transparent hover:border-red-600 transition-all flex items-center justify-center text-wrap text-center text-xs flex-col",
    selectedKey: "!bg-red-600 border-2 border-red-600 text-white",
};

const EditorKey: FC<Props> = ({ label, binding, onClick, selected }) => {
    const keyClass = binding.str !== "" ? classes.emptyKey : classes.key;
    const finalClass = selected ? `${keyClass} ${classes.selectedKey}` : keyClass;

    // Handle newlines in the display text (for user keys)
    const displayText = binding.str !== "" ? binding.str : "";

    console.log("rendering editor key", binding, finalClass);
    return (
        <div className="flex flex-row justify-start items-center">
            <div className={finalClass} onClick={onClick}>
                {binding?.type === "macro" && <MacrosIcon className=" mt-2 h-8" />}
                {displayText && <span style={{ whiteSpace: "pre-line" }}>{displayText}</span>}
            </div>
            {label && <div className="font-medium text-gray-600 px-5">{label}</div>}
        </div>
    );
};

export default EditorKey;
