import { FC, useState, useEffect } from "react";
import { ArrowRight, Trash2 } from "lucide-react";

import { Key } from "@/components/Key";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { usePanels } from "@/contexts/PanelsContext";
import { useVial } from "@/contexts/VialContext";
import { cn } from "@/lib/utils";
import { getKeyContents } from "@/utils/keys";

import OverrideModifierSelector from "./OverrideModifierSelector";

interface Props { }

const TABS = ["Trigger", "Negative", "Suspended"] as const;
type TabType = typeof TABS[number];

const OPTIONS = [
    { label: "Active on trigger down", bit: 1 << 0 },
    { label: "Active on mod down", bit: 1 << 1 },
    { label: "Active on negative mod down", bit: 1 << 2 },
    { label: "Active trigger mod activates", bit: 1 << 3 },
    { label: "Reregister trigger on deactivate", bit: 1 << 4 },
    { label: "No unregister on other key down", bit: 1 << 5 },
] as const;

const ENABLED_BIT = 1 << 7;

const OverrideEditor: FC<Props> = () => {
    const { keyboard, setKeyboard } = useVial();
    const { itemToEdit, setPanelToGoBack, setAlternativeHeader } = usePanels();
    const { selectOverrideKey, selectedTarget } = useKeyBinding();
    const [activeTab, setActiveTab] = useState<TabType>("Trigger");

    const overrideIndex = itemToEdit!;
    const override = keyboard?.key_overrides?.[overrideIndex];

    useEffect(() => {
        selectOverrideKey(overrideIndex, "trigger");
        setPanelToGoBack("overrides");
        setAlternativeHeader(true);
    }, []);

    const isSlotSelected = (slot: "trigger" | "replacement") => {
        return (
            selectedTarget?.type === "override" &&
            selectedTarget.overrideId === overrideIndex &&
            selectedTarget.overrideSlot === slot
        );
    };

    const getActiveMask = () => {
        if (!override) return 0;
        switch (activeTab) {
            case "Trigger": return override.trigger_mods;
            case "Negative": return override.negative_mod_mask;
            case "Suspended": return override.suppressed_mods;
        }
    };

    const updateMask = (newMask: number) => {
        if (!keyboard || !override) return;
        const updatedKeyboard = JSON.parse(JSON.stringify(keyboard));
        const ovr = updatedKeyboard.key_overrides[overrideIndex];
        switch (activeTab) {
            case "Trigger": ovr.trigger_mods = newMask; break;
            case "Negative": ovr.negative_mod_mask = newMask; break;
            case "Suspended": ovr.suppressed_mods = newMask; break;
        }
        setKeyboard(updatedKeyboard);
    };

    const updateOption = (bit: number, checked: boolean) => {
        if (!keyboard || !override) return;
        const updatedKeyboard = JSON.parse(JSON.stringify(keyboard));
        let options = updatedKeyboard.key_overrides[overrideIndex].options;
        if (checked) options |= bit;
        else options &= ~bit;
        updatedKeyboard.key_overrides[overrideIndex].options = options;
        setKeyboard(updatedKeyboard);
    };

    const updateLayer = (layer: number, active: boolean) => {
        if (!keyboard || !override) return;
        const updatedKeyboard = JSON.parse(JSON.stringify(keyboard));
        let layers = updatedKeyboard.key_overrides[overrideIndex].layers;
        if (active) layers |= (1 << layer);
        else layers &= ~(1 << layer);
        updatedKeyboard.key_overrides[overrideIndex].layers = layers;
        setKeyboard(updatedKeyboard);
    };

    const clearKey = (slot: "trigger" | "replacement") => {
        if (!keyboard || !override) return;
        const updatedKeyboard = JSON.parse(JSON.stringify(keyboard));
        const ovr = updatedKeyboard.key_overrides[overrideIndex];
        if (slot === "trigger") ovr.trigger = "KC_NO";
        else ovr.replacement = "KC_NO";
        setKeyboard(updatedKeyboard);
    };

    const currentMask = getActiveMask();

    const renderKey = (label: string, slot: "trigger" | "replacement") => {
        if (!override) return null;
        const keycode = slot === "trigger" ? override.trigger : override.replacement;
        const keyContents = getKeyContents(keyboard!, keycode || "KC_NO");
        const isSelected = isSlotSelected(slot);
        const hasContent = keycode && keycode !== "KC_NO";

        let keyColor: string | undefined;
        let keyClassName: string;
        let headerClass: string;

        if (isSelected) {
            keyColor = undefined;
            keyClassName = "border-2 border-red-600";
            headerClass = "bg-black/20";
        } else if (hasContent) {
            keyColor = "sidebar";
            keyClassName = "border-kb-gray";
            headerClass = "bg-kb-sidebar-dark";
        } else {
            keyColor = undefined;
            keyClassName = "bg-transparent border-2 border-black";
            headerClass = "text-black";
        }

        return (
            <div className="flex flex-col items-center gap-2 relative">
                <span className="text-sm font-bold text-slate-600">{label}</span>
                <div className="relative w-[60px] h-[60px] group/override-key">
                    <Key
                        isRelative
                        x={0}
                        y={0}
                        w={1}
                        h={1}
                        row={-1}
                        col={-1}
                        keycode={keycode || "KC_NO"}
                        label={keyContents?.str || ""}
                        keyContents={keyContents}
                        selected={isSelected}
                        onClick={() => selectOverrideKey(overrideIndex, slot)}
                        layerColor={keyColor}
                        className={keyClassName}
                        headerClassName={headerClass}
                    />
                    {hasContent && (
                        <div className="absolute -left-10 top-0 h-full flex items-center justify-center opacity-0 group-hover/override-key:opacity-100 group-hover/override-key:pointer-events-auto pointer-events-none transition-opacity">
                            <button
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearKey(slot);
                                }}
                                title="Clear key"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (!override) return <div className="p-5">Override not found</div>;

    const isEnabled = (override.options & ENABLED_BIT) !== 0;

    return (
        <div className="flex flex-col gap-4 py-8 pl-[84px] pr-5 pb-4">
            {/* Active Switch */}
            {/* Active Toggle */}
            <div className="flex flex-row items-center gap-0.5 bg-gray-200/50 p-0.5 rounded-md border border-gray-400/50 w-fit">
                <button
                    onClick={() => updateOption(ENABLED_BIT, true)}
                    className={cn(
                        "px-3 py-1 text-xs uppercase tracking-wide rounded-[4px] transition-all font-bold border",
                        isEnabled
                            ? "bg-black text-white shadow-sm border-black"
                            : "text-gray-500 border-transparent hover:text-black hover:bg-white hover:shadow-sm"
                    )}
                >
                    ON
                </button>
                <button
                    onClick={() => updateOption(ENABLED_BIT, false)}
                    className={cn(
                        "px-3 py-1 text-xs uppercase tracking-wide rounded-[4px] transition-all font-bold border",
                        !isEnabled
                            ? "bg-black text-white shadow-sm border-black"
                            : "text-gray-500 border-transparent hover:text-black hover:bg-white hover:shadow-sm"
                    )}
                >
                    OFF
                </button>
            </div>

            <div className="flex flex-row gap-8 justify-start items-center">
                {renderKey("Trigger", "trigger")}
                <div className="pt-6 text-black -mr-1">
                    <ArrowRight className="w-6 h-6" />
                </div>
                {renderKey("Replacement", "replacement")}
            </div>

            {/* Tabs */}
            <div className="flex flex-row items-center gap-1 bg-gray-200/50 p-1 rounded-lg border border-gray-400/50 w-full mt-8">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "flex-1 py-2 text-sm uppercase tracking-wider rounded-md transition-all font-bold border",
                            activeTab === tab
                                ? "bg-black text-white shadow-md border-black"
                                : "text-gray-500 border-transparent hover:text-black hover:bg-white hover:shadow-sm"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Modifiers Section */}
            <OverrideModifierSelector value={currentMask} onChange={updateMask} />

            {/* Layers Section */}
            <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-lg text-slate-700">Layers</span>
                <div className="grid grid-cols-8 gap-2 w-fit">
                    {Array.from({ length: 16 }).map((_, i) => {
                        const isActive = (override.layers & (1 << i)) !== 0;
                        return (
                            <div
                                key={i}
                                className={cn(
                                    "w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition-colors text-sm font-medium",
                                    isActive
                                        ? "bg-kb-sidebar-dark text-white hover:bg-white hover:text-black"
                                        : "bg-kb-gray-medium text-slate-700 hover:bg-white hover:text-black"
                                )}
                                onClick={() => updateLayer(i, !isActive)}
                            >
                                {i}
                            </div>
                        );
                    })}
                </div>
            </div>



            {/* Options Switches */}
            <div className="flex flex-col gap-3 mt-4">
                {OPTIONS.map((opt) => {
                    const isChecked = (override.options & opt.bit) !== 0;
                    return (
                        <div key={opt.label} className="flex items-center space-x-3">
                            <Switch
                                id={`opt-${opt.bit}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => updateOption(opt.bit, checked)}
                            />
                            <Label htmlFor={`opt-${opt.bit}`} className="font-normal text-slate-700 cursor-pointer">
                                {opt.label}
                            </Label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OverrideEditor;
