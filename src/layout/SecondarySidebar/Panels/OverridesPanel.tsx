import React from "react";
import { ArrowRight } from "lucide-react";

import SidebarItemRow from "@/layout/SecondarySidebar/components/SidebarItemRow";
import { useLayer } from "@/contexts/LayerContext";
import { usePanels } from "@/contexts/PanelsContext";
import { useVial } from "@/contexts/VialContext";
import { hoverBackgroundClasses, hoverBorderClasses, hoverHeaderClasses } from "@/utils/colors";
import { getKeyContents } from "@/utils/keys";
import { Key } from "@/components/Key";
import { KeyContent } from "@/types/vial.types";
import { cn } from "@/lib/utils";

const ENABLED_BIT = 1 << 7;

const OverridesPanel: React.FC = () => {
    const { keyboard, setKeyboard } = useVial();
    const { selectedLayer } = useLayer();
    const {
        setItemToEdit,
        setBindingTypeToEdit,
        setAlternativeHeader,
    } = usePanels();

    if (!keyboard) return null;

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];
    const hoverHeaderClass = hoverHeaderClasses[layerColorName] || hoverHeaderClasses["primary"];

    const overrides = keyboard.key_overrides || [];

    const handleEdit = (index: number) => {
        setItemToEdit(index);
        setBindingTypeToEdit("overrides");
        setAlternativeHeader(true);
    };

    const updateOverrideOption = (index: number, bit: number, checked: boolean) => {
        if (!keyboard) return;
        const updatedKeyboard = JSON.parse(JSON.stringify(keyboard));
        let options = updatedKeyboard.key_overrides?.[index].options || 0;
        if (checked) options |= bit;
        else options &= ~bit;
        if (updatedKeyboard.key_overrides?.[index]) {
            updatedKeyboard.key_overrides[index].options = options;
        }
        setKeyboard(updatedKeyboard);
    };

    return (
        <section className="space-y-3 h-full max-h-full flex flex-col pt-3">
            <div className="flex flex-col overflow-auto flex-grow scrollbar-thin">
                {overrides.map((override, i) => {
                    const isDefined = (override.trigger && override.trigger !== "KC_NO") || (override.replacement && override.replacement !== "KC_NO");
                    const isEnabled = (override.options & ENABLED_BIT) !== 0;

                    const triggerContent = getKeyContents(keyboard, override.trigger || "KC_NO") as KeyContent;
                    const replacementContent = getKeyContents(keyboard, override.replacement || "KC_NO") as KeyContent;

                    const renderSmallKey = (content: KeyContent, idx: number) => {
                        const hasContent = (content?.top && content.top !== "KC_NO") || (content?.str && content.str !== "KC_NO" && content.str !== "");
                        return (
                            <div key={idx} className="relative w-[30px] h-[30px]">
                                <Key
                                    isRelative
                                    x={0} y={0} w={1} h={1} row={-1} col={-1}
                                    keycode={content?.top || "KC_NO"}
                                    label={content?.str || ""}
                                    keyContents={content}
                                    layerColor={hasContent ? "sidebar" : undefined}
                                    className={hasContent ? "border-kb-gray" : "bg-transparent border border-kb-gray-border"}
                                    headerClassName={hasContent ? "bg-kb-sidebar-dark" : "text-black"}
                                    variant="small"
                                    onClick={() => handleEdit(i)}
                                />
                            </div>
                        );
                    };

                    const rowChildren = isDefined ? (
                        <div className="flex flex-row items-center w-full">
                            <div className="flex flex-row items-center gap-1 ml-4 overflow-hidden">
                                {renderSmallKey(triggerContent, 0)}
                                <ArrowRight className="w-3 h-3 text-black mx-1" />
                                {renderSmallKey(replacementContent, 1)}
                            </div>

                            <div
                                className="ml-auto mr-2 flex flex-row items-center gap-0.5 bg-gray-200/50 p-0.5 rounded-md border border-gray-300/50"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => updateOverrideOption(i, ENABLED_BIT, true)}
                                    className={cn(
                                        "px-2 py-0.5 text-[10px] uppercase tracking-wide rounded-[3px] transition-all font-bold border",
                                        isEnabled
                                            ? "bg-black text-white shadow-sm border-black"
                                            : "text-gray-500 border-transparent hover:text-black hover:bg-white hover:shadow-sm"
                                    )}
                                >
                                    ON
                                </button>
                                <button
                                    onClick={() => updateOverrideOption(i, ENABLED_BIT, false)}
                                    className={cn(
                                        "px-2 py-0.5 text-[10px] uppercase tracking-wide rounded-[3px] transition-all font-bold border",
                                        !isEnabled
                                            ? "bg-black text-white shadow-sm border-black"
                                            : "text-gray-500 border-transparent hover:text-black hover:bg-white hover:shadow-sm"
                                    )}
                                >
                                    OFF
                                </button>
                            </div>
                        </div>
                    ) : undefined;

                    // Still pass KeyContent type for consistency, though preview key is hidden
                    const keyContents = { type: "override" } as KeyContent;

                    return (
                        <SidebarItemRow
                            key={i}
                            index={i}
                            keyboard={keyboard}
                            label={i.toString()}
                            keyContents={keyContents}
                            onEdit={handleEdit}
                            hoverBorderColor={hoverBorderColor}
                            hoverBackgroundColor={hoverBackgroundColor}
                            hoverLayerColor={layerColorName}
                            hoverHeaderClass={hoverHeaderClass}
                            showPreviewKey={false}
                            className="py-4"
                        >
                            {rowChildren}
                        </SidebarItemRow>
                    );
                })}
                {overrides.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        No overrides found.
                    </div>
                )}
            </div>
        </section>
    );
};

export default OverridesPanel;
