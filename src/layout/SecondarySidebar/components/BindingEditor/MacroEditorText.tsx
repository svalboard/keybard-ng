import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FC } from "react";

interface Props {
    type: string;
    value: any;
    onChange: (value: any) => void;
    onDelete?: () => void;
    autoFocus?: boolean;
}

const MacroEditorText: FC<Props> = ({ type, value, onChange, onDelete, autoFocus }) => {
    return (
        <div className="relative w-full">
            <div className="flex flex-row justify-start items-center w-full peer">
                {type === "text" ? (
                    <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="bg-white text-black border-input w-[180px] flex-grow-0" autoFocus={autoFocus} />
                ) : (
                    <Input value={value} onChange={(e) => onChange(e.target.value)} className="bg-white text-black border-input w-[180px] flex-grow-0" autoFocus={autoFocus} />
                )}
                <div className="flex flex-row items-center ml-5">
                    {type && <div className="font-medium text-gray-600">{type === "delay" ? "Delay (ms)" : type.charAt(0).toUpperCase() + type.slice(1)}</div>}
                </div>
            </div>
            {onDelete && (
                <div className="absolute -left-10 top-0 h-full flex items-center justify-center opacity-0 peer-hover:opacity-100 hover:opacity-100 transition-opacity">
                    <button
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                        onClick={onDelete}
                        title="Delete item"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default MacroEditorText;
