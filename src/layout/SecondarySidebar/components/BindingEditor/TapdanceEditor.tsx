import { FC, useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { usePanels } from "@/contexts/PanelsContext";
import { useVial } from "@/contexts/VialContext";
import { getKeyContents } from "@/utils/keys";
import { useDebounce } from "@uidotdev/usehooks";
import { Key } from "@/components/Key";

import { Trash2 } from "lucide-react";

interface Props { }

const TapdanceEditor: FC<Props> = () => {
    const { keyboard, setKeyboard } = useVial();
    const { setPanelToGoBack, setAlternativeHeader, itemToEdit } = usePanels();
    const currTapDance = (keyboard as any).tapdances?.[itemToEdit!];
    const { selectTapdanceKey, selectedTarget } = useKeyBinding();
    const isSlotSelected = (slot: string) => {
        return selectedTarget?.type === "tapdance" && selectedTarget.tapdanceId === itemToEdit && selectedTarget.tapdanceSlot === slot;
    };
    const [tapMs, setTapMs] = useState(200);
    const debouncedTapMs = useDebounce(tapMs, 300);
    useEffect(() => {
        if (currTapDance) {
            setTapMs(currTapDance.tapms);
        }
    }, [itemToEdit]); // Use itemToEdit instead of currTapDance to avoid infinite loop
    const keys = {
        tap: getKeyContents(keyboard!, currTapDance?.tap || "KC_NO"),
        doubletap: getKeyContents(keyboard!, currTapDance?.doubletap || "KC_NO"),
        hold: getKeyContents(keyboard!, currTapDance?.hold || "KC_NO"),
        taphold: getKeyContents(keyboard!, currTapDance?.taphold || "KC_NO"),
    };

    useEffect(() => {
        setPanelToGoBack("tapdances");
        setAlternativeHeader(true);
    }, []);

    const updateTapMs = (ms: number) => {
        if (keyboard && (keyboard as any).tapdances && itemToEdit !== null) {
            const updatedKeyboard = { ...keyboard };
            const tapdances = [...(updatedKeyboard as any).tapdances];
            if (tapdances[itemToEdit]) {
                tapdances[itemToEdit] = {
                    ...tapdances[itemToEdit],
                    tapms: ms,
                };
            }
            (updatedKeyboard as any).tapdances = tapdances;
            setKeyboard(updatedKeyboard);
        }
    };
    useEffect(() => {
        updateTapMs(debouncedTapMs);
    }, [debouncedTapMs]);

    const updateKeyAssignment = (slot: string, keycode: string) => {
        if (!keyboard || itemToEdit === null) return;
        const updatedKeyboard = { ...keyboard };
        const tapdances = [...(updatedKeyboard as any).tapdances];
        if (tapdances[itemToEdit]) {
            tapdances[itemToEdit] = {
                ...tapdances[itemToEdit],
                [slot]: keycode
            };
        }
        (updatedKeyboard as any).tapdances = tapdances;
        setKeyboard(updatedKeyboard);
    };

    // Handle Delete/Backspace for selected key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Delete" || e.key === "Backspace") {
                if (selectedTarget?.type === "tapdance" && selectedTarget.tapdanceId === itemToEdit && selectedTarget.tapdanceSlot) {
                    // Update key assignment directly instead of using assignKeycode which might context switch
                    // Actually assignKeycode uses selected target so it's fine, but consistent direct update is safer for local logic
                    updateKeyAssignment(selectedTarget.tapdanceSlot, "KC_NO");
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedTarget, itemToEdit]);



    const renderKey = (label: string, content: any, type: "tap" | "hold" | "doubletap" | "taphold") => {
        const isSelected = isSlotSelected(type);
        const hasContent = (content?.top && content.top !== "KC_NO") || (content?.str && content.str !== "KC_NO" && content.str !== "");

        let keyColor: string | undefined;
        let keyClassName: string;
        let headerClass: string;

        if (isSelected) {
            // Selected: Red BG (handled by Key), Red Border
            keyColor = undefined;
            keyClassName = "border-2 border-red-600";
            headerClass = "bg-black/20"; // Subtle header for red background
        } else if (hasContent) {
            // Assigned: Black Key
            keyColor = "sidebar";
            keyClassName = "border-kb-gray";
            headerClass = "bg-kb-sidebar-dark";
        } else {
            // Empty: Transparent + Black Border
            keyColor = undefined;
            keyClassName = "bg-transparent border-2 border-black";
            headerClass = "text-black";
        }

        return (
            <div className="relative w-full">
                <div className="flex flex-row items-center gap-4 peer">
                    <div className="relative w-[60px] h-[60px]">
                        <Key
                            isRelative
                            x={0}
                            y={0}
                            w={1}
                            h={1}
                            row={-1}
                            col={-1}
                            keycode={content?.top || "KC_NO"}
                            label={content?.str || ""}
                            keyContents={content}
                            selected={isSlotSelected(type)}
                            onClick={() => selectTapdanceKey(itemToEdit!, type)}
                            layerColor={keyColor}
                            className={keyClassName}
                            headerClassName={headerClass}
                        />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{label}</span>
                </div>
                {hasContent && (
                    <div className="absolute -left-10 top-0 h-full flex items-center justify-center opacity-0 peer-hover:opacity-100 hover:opacity-100 transition-opacity">
                        <button
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                            onClick={() => updateKeyAssignment(type, "KC_NO")}
                            title="Clear key"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6 py-8 pl-[84px]">
            {renderKey("Tap", keys.tap, "tap")}
            {renderKey("Hold", keys.hold, "hold")}
            {renderKey("Tap-Hold", keys.taphold, "taphold")}
            {renderKey("Double-Tap", keys.doubletap, "doubletap")}

            <div className="flex flex-row gap-3 items-center mt-4">
                <span className="text-md font-normal text-slate-600">Milliseconds</span>
                <Input
                    value={tapMs}
                    type="number"
                    onChange={(e) => setTapMs(e.target.valueAsNumber)}
                    min={0}
                    step={25}
                    className="w-32 bg-white"
                    placeholder="Tap MS"
                />
            </div>
        </div>
    );
};

export default TapdanceEditor;
