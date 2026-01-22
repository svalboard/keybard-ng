import { FC } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
    value: number;
    onChange: (newValue: number) => void;
}

const MOD_BITS = {
    LCTRL: 1,
    LSHIFT: 2,
    LALT: 4,
    LGUI: 8,
    RCTRL: 16,
    RSHIFT: 32,
    RALT: 64,
    RGUI: 128,
};

const MOD_GROUPS = [
    { label: "SHIFT", lBit: MOD_BITS.LSHIFT, rBit: MOD_BITS.RSHIFT },
    { label: "CTRL", lBit: MOD_BITS.LCTRL, rBit: MOD_BITS.RCTRL },
    { label: "ALT", lBit: MOD_BITS.LALT, rBit: MOD_BITS.RALT },
    { label: "GUI", lBit: MOD_BITS.LGUI, rBit: MOD_BITS.RGUI },
] as const;

const OverrideModifierSelector: FC<Props> = ({ value, onChange }) => {
    const isNone = value === 0;

    const handleNoneClick = () => {
        onChange(0);
    };

    const toggleGroup = (lBit: number, rBit: number) => {
        let newValue = value;
        const lActive = (value & lBit) !== 0;
        const rActive = (value & rBit) !== 0;

        if (lActive || rActive) {
            newValue &= ~lBit;
            newValue &= ~rBit;
        } else {
            newValue |= lBit;
            newValue |= rBit;
        }
        onChange(newValue);
    };

    const toggleBit = (bit: number) => {
        let newValue = value;
        if ((newValue & bit) !== 0) {
            newValue &= ~bit;
        } else {
            newValue |= bit;
        }
        onChange(newValue);
    };

    return (
        <div className="flex flex-col gap-2">
            <span className="font-semibold text-lg text-slate-700">Modifiers</span>
            <div className="flex flex-row items-start gap-2 flex-wrap min-h-[63px]">
                {/* NONE Button */}
                <Button
                    type="button"
                    variant={isNone ? "default" : "secondary"}
                    className={cn(
                        "h-9 px-5 rounded-md font-medium transition-colors border-none min-w-[84px]",
                        isNone
                            ? "bg-black text-white shadow-none"
                            : "bg-kb-gray-medium text-slate-700 hover:bg-white hover:text-black"
                    )}
                    onClick={handleNoneClick}
                >
                    NONE
                </Button>

                {/* Modifier Groups */}
                {MOD_GROUPS.map((group) => {
                    const lActive = (value & group.lBit) !== 0;
                    const rActive = (value & group.rBit) !== 0;
                    const anyActive = lActive || rActive;

                    return (
                        <div
                            key={group.label}
                            className={cn(
                                "flex flex-col items-center rounded-md overflow-hidden min-w-[84px] transition-[height] duration-300 ease-in-out",
                                anyActive
                                    ? "bg-black text-white h-[63px]"
                                    : "bg-kb-gray-medium text-slate-700 hover:bg-white hover:text-black h-9 delay-150"
                            )}
                        >
                            {/* Main Label */}
                            <button
                                type="button"
                                className="w-full h-9 flex items-center justify-center text-sm font-medium shrink-0 outline-none"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleGroup(group.lBit, group.rBit);
                                }}
                            >
                                {group.label}
                            </button>

                            {/* L/R Toggles Container */}
                            <div className={cn(
                                "flex flex-row items-center justify-center gap-1 w-full pb-1.5 transition-opacity duration-200",
                                anyActive ? "opacity-100 delay-150" : "opacity-0 pointer-events-none duration-100"
                            )}>
                                {/* Left Toggle */}
                                <button
                                    type="button"
                                    className={cn(
                                        "w-9 h-6 rounded-[6px] flex items-center justify-center text-[10px] font-bold transition-colors border outline-none hover:bg-white hover:text-black",
                                        lActive
                                            ? "bg-black border-white text-white"
                                            : "bg-kb-gray-medium border-white text-black"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleBit(group.lBit);
                                    }}
                                >
                                    L
                                </button>

                                {/* Right Toggle */}
                                <button
                                    type="button"
                                    className={cn(
                                        "w-9 h-6 rounded-[6px] flex items-center justify-center text-[10px] font-bold transition-colors border outline-none hover:bg-white hover:text-black",
                                        rActive
                                            ? "bg-black border-white text-white"
                                            : "bg-kb-gray-medium border-white text-black"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleBit(group.rBit);
                                    }}
                                >
                                    R
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OverrideModifierSelector;
