import KeyboardIcon from "@/components/icons/Keyboard";
import LayersDefaultIcon from "@/components/icons/LayersDefault";
import MacrosIcon from "@/components/icons/MacrosIcon";

import { cn } from "@/lib/utils";
import { FC } from "react";

const iconsToShow = [
    {
        icon: <KeyboardIcon className="w-4 h-4" />,
        panel: "keyboard",
    },
    {
        icon: <LayersDefaultIcon className="w-4 h-4" />,
        panel: "layers",
    },
    {
        icon: <MacrosIcon className="w-4 h-4" />,
        panel: "macros",
    },
];

interface Props {
    parentPanel?: string;
    className?: string;
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

const EditorSidePanel: FC<Props> = ({ parentPanel: _parentPanel, className, activeTab, onTabChange }) => {
    return (
        <div className={cn("h-full items-center justify-start flex", className)}>
            <div
                className="bg-white rounded-r-3xl text-gray-400 flex items-center flex-col justify-around py-3 px-2 gap-1 shadow-[4px_0_16px_rgba(0,0,0,0.1)]"
                style={{ clipPath: "inset(-50px -50px -50px 0px)" }}
            >
                {iconsToShow.map((i) => (
                    <div
                        key={i.panel}
                        className={cn(
                            "cursor-pointer transition-colors px-2 py-3 h-10 w-10 items-center justify-center flex",
                            activeTab === i.panel ? "text-slate-900" : "text-gray-400 hover:text-slate-900"
                        )}
                        onClick={() => {
                            if (onTabChange) {
                                onTabChange(i.panel!);
                            }
                        }}
                    >
                        {i.icon}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EditorSidePanel;
