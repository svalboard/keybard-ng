import KeyboardIcon from "@/components/icons/Keyboard";
import LayersDefaultIcon from "@/components/icons/LayersDefault";
import MacrosIcon from "@/components/icons/MacrosIcon";
import MouseIcon from "@/components/icons/Mouse";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import { FC } from "react";

import { Cpu, Gamepad } from "lucide-react";

export type PickerMode = "keyboard" | "layers" | "macros" | "qmk" | "special" | "mouse";

const iconsToShow: { icon: React.ReactNode; panel: PickerMode; title: string }[] = [
    {
        icon: <KeyboardIcon className="w-4 h-4" />,
        panel: "keyboard",
        title: "Keyboard",
    },
    {
        icon: <Gamepad className="w-4 h-4" />,
        panel: "special",
        title: "Special",
    },
    {
        icon: <Cpu className="w-4 h-4" />,
        panel: "qmk",
        title: "QMK",
    },
    {
        icon: <LayersDefaultIcon className="w-4 h-4" />,
        panel: "layers",
        title: "Layer Keys",
    },
    {
        icon: <MouseIcon className="w-4 h-4" />,
        panel: "mouse",
        title: "Mouse",
    },
    {
        icon: <MacrosIcon className="w-4 h-4" />,
        panel: "macros",
        title: "Macros",
    },
];

interface Props {
    className?: string;
    activeTab?: PickerMode;
    onTabChange?: (tab: PickerMode) => void;
    showMacros?: boolean;
}

const EditorSidePanel: FC<Props> = ({ className, activeTab, onTabChange, showMacros = true }) => {
    const visibleIcons = showMacros ? iconsToShow : iconsToShow.filter((i) => i.panel !== "macros");

    return (
        <div className={cn("h-full items-center justify-start flex", className)}>
            <div
                className="bg-white rounded-r-[18px] text-gray-400 flex items-center flex-col justify-around py-3 px-2 gap-1 shadow-[4px_0_16px_rgba(0,0,0,0.1)] border-l-0"
                style={{ clipPath: "inset(-50px -50px -50px 0px)" }}
            >
                {visibleIcons.map((i) => (
                    <Tooltip key={i.panel}>
                        <TooltipTrigger asChild>
                            <div
                                key={i.panel}
                                className={cn(
                                    "cursor-pointer transition-colors px-2 py-3 h-10 w-10 items-center justify-center flex",
                                    activeTab === i.panel ? "text-slate-900" : "text-gray-400 hover:text-slate-900"
                                )}
                                onClick={() => {
                                    if (onTabChange) {
                                        onTabChange(i.panel);
                                    }
                                }}
                            >
                                {i.icon}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            {i.title}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </div>
    );
};

export default EditorSidePanel;
