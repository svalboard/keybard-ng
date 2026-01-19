import * as React from "react";
import { Zap, Unplug } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useVial } from "@/contexts/VialContext";
import { useLayer } from "@/contexts/LayerContext";
import { layerColors, getColorByName } from "@/utils/colors";

interface BottomToolbarProps {
    isConnected: boolean;
    liveUpdating: boolean;
    hasChanges: boolean;
    keyVariant: "default" | "medium" | "small";
    onConnect: () => void;
    onCommit: () => void;
    onSetKeyVariant: (variant: "default" | "medium" | "small") => void;
    style?: React.CSSProperties;
}

/**
 * The persistent footer toolbar containing update controls and layout settings.
 */
export const BottomToolbar: React.FC<BottomToolbarProps> = ({
    isConnected,
    liveUpdating,
    hasChanges,
    keyVariant,
    onConnect,
    onCommit,
    onSetKeyVariant,
    style,
}) => {
    const { keyboard } = useVial();
    const { selectedLayer } = useLayer();
    const [isPressed, setIsPressed] = React.useState(false);

    // Get the cosmetic color name (e.g., "green", "blue") or default to "green"
    const cosmeticColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "green";
    // Find the hex value for that color name
    const layerColor = getColorByName(cosmeticColorName)?.hex || "#099e7c";

    return (
        <div
            className="absolute bottom-9 left-[37px] flex items-center gap-6 z-20"
            style={style}
        >
            {liveUpdating ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className={cn(
                                "flex items-center gap-2 text-sm font-medium animate-in fade-in zoom-in duration-300",
                                !isConnected && "opacity-30 cursor-pointer"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isConnected) onConnect();
                            }}
                        >
                            {isConnected ? (
                                <Zap className="h-4 w-4 fill-black text-black" />
                            ) : (
                                <Unplug className="h-4 w-4" />
                            )}
                            <span>Live Updating</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>{isConnected ? "Changes are Automatically Applied" : "Connect to Apply changes"}</p>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="cursor-pointer">
                            <button
                                className={cn(
                                    "h-9 rounded-full px-4 text-sm font-medium transition-all shadow-sm flex items-center gap-2",
                                    isConnected
                                        ? "bg-black text-white hover:bg-black/90 animate-in fade-in zoom-in duration-300"
                                        : "bg-muted text-muted-foreground opacity-50 hover:bg-muted/80"
                                )}
                                style={{
                                    backgroundColor: isPressed ? layerColor : undefined,
                                }}
                                onMouseDown={() => setIsPressed(true)}
                                onMouseUp={() => setIsPressed(false)}
                                onMouseLeave={() => setIsPressed(false)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isConnected) {
                                        if (hasChanges) onCommit();
                                    } else {
                                        onConnect();
                                    }
                                }}
                            >
                                {!isConnected && <Unplug className="h-4 w-4" />}
                                Update Changes
                            </button>
                        </div>
                    </TooltipTrigger>
                    {!isConnected && (
                        <TooltipContent side="top">
                            <p>Connect to Apply Changes</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            )}

            <div className="flex flex-row items-center gap-0.5 bg-gray-200/50 p-0.5 rounded-md border border-gray-300/50 w-fit">
                {(['default', 'medium', 'small'] as const).map((variant) => (
                    <button
                        key={variant}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSetKeyVariant(variant);
                        }}
                        className={cn(
                            "px-2 py-0.5 text-[10px] uppercase tracking-wide rounded-[4px] transition-all font-semibold border",
                            keyVariant === variant
                                ? "bg-black text-white shadow-sm border-black"
                                : "text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-300/50"
                        )}
                        title={`Set key size to ${variant}`}
                    >
                        {variant === 'default' ? 'Normal' : variant}
                    </button>
                ))}
            </div>
        </div>
    );
};
