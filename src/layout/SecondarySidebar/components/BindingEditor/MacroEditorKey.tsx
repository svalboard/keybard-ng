import { useVial } from "@/contexts/VialContext";
import { getKeyContents } from "@/utils/keys";
import { FC } from "react";

interface Props {
    label?: string;
    binding?: any;
}

const classes = {
    key: "bg-white border border-kb-gray-border border-2 w-12 h-12 rounded-md cursor-pointer hover:border-red-600 transition-all",
    emptyKey:
        "bg-kb-green text-white w-12 h-12 rounded-md cursor-pointer hover:border-2 border-2 border border-transparent hover:border-red-600 transition-all flex items-center justify-center text-wrap",
};

const MacroEditorKey: FC<Props> = ({ label, binding }) => {
    const { keyboard } = useVial();
    const keyContents = getKeyContents(keyboard!, binding);
    return (
        <div className="flex flex-row justify-start items-center">
            {binding !== "" ? <div className={classes.emptyKey}>{keyContents?.str}</div> : <div className={classes.key} />}
            {label && <div className="font-medium text-gray-600 px-5">{label}</div>}
        </div>
    );
};

export default MacroEditorKey;
