import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FC } from "react";

interface Props {
    type: string;
    value: any;
    onChange: (value: any) => void;
}

const MacroEditorText: FC<Props> = ({ type, value, onChange }) => {
    return (
        <div className="flex flex-row justify-start items-center w-full">
            {type === "text" ? (
                <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="bg-white w-full flex-grow-1" />
            ) : (
                <Input value={value} onChange={(e) => onChange(e.target.value)} className="bg-white w-full flex-grow-1" />
            )}
            {type && <div className="font-medium text-gray-600 px-5">{type}</div>}
        </div>
    );
};

export default MacroEditorText;
