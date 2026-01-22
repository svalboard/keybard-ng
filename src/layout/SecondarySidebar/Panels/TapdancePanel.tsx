import React from "react";
import { Key } from "@/components/Key";

import SidebarItemRow from "@/layout/SecondarySidebar/components/SidebarItemRow";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useLayer } from "@/contexts/LayerContext";
import { usePanels } from "@/contexts/PanelsContext";
import { useVial } from "@/contexts/VialContext";
import { hoverBackgroundClasses, hoverBorderClasses, hoverHeaderClasses } from "@/utils/colors";
import { getKeyContents } from "@/utils/keys";
import { KeyContent } from "@/types/vial.types";

const TapdancePanel: React.FC = () => {
    const { keyboard } = useVial();
    const { assignKeycode } = useKeyBinding();
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

    const tapdances = keyboard.tapdances || [];

    const handleEdit = (index: number) => {
        setItemToEdit(index);
        setBindingTypeToEdit("tapdances");
        setAlternativeHeader(true);
    };

    return (
        <div className="space-y-3 pt-3 pb-8 relative">
            {/* Header Row - Sticky */}
            <div className="sticky top-0 z-20 bg-white pt-4 pb-4 -mt-4 flex flex-row items-end pl-12 pr-12 mb-2">
                <div className="flex-grow flex flex-row justify-between w-full max-w-[240px] ml-6">
                    <span className="text-xs font-bold text-center w-[30px]">Tap</span>
                    <span className="text-xs font-bold text-center w-[30px]">Hold</span>
                    <span className="text-xs font-bold text-center w-[30px] whitespace-nowrap">Tap-Hold</span>
                    <span className="text-xs font-bold text-center w-[30px] whitespace-nowrap">Double-Tap</span>
                </div>
            </div>

            <div className="flex flex-col">
                {tapdances.map((tdEntry, i) => {
                    const keycode = `TD(${i})`;
                    const keyContents = getKeyContents(keyboard, keycode) as KeyContent;

                    // Use tdEntry directly from the map
                    const td = tdEntry || ({} as any);
                    const states = [
                        { label: "Tap", key: td.tap },
                        { label: "Hold", key: td.hold },
                        { label: "TapHold", key: td.taphold },
                        { label: "Double", key: td.doubletap },
                    ];

                    const stateContents = states.map((s) => getKeyContents(keyboard, s.key) as KeyContent);

                    // Check if any key is actually assigned (not just KC_NO/empty)
                    const hasAssignment = stateContents.some(
                        (k) => (k?.top && k.top !== "KC_NO") || (k?.str && k.str !== "KC_NO" && k.str !== "")
                    );

                    const renderSmallKey = (content: KeyContent, idx: number) => {
                        const hasContent =
                            (content?.top && content?.top !== "KC_NO") ||
                            (content?.str && content?.str !== "" && content?.str !== "KC_NO");

                        return (
                            <div className="w-[30px] h-[30px] relative" key={idx}>
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
                                    variant="small"
                                    layerColor={hasContent ? "sidebar" : undefined}
                                    className={
                                        !hasContent ? "bg-transparent border border-kb-gray-border" : "border-kb-gray"
                                    }
                                    headerClassName={!hasContent ? "hidden" : "bg-kb-sidebar-dark"}
                                    onClick={() => handleEdit(i)}
                                />
                            </div>
                        );
                    };

                    const rowChildren = hasAssignment ? (
                        <div className="flex flex-row gap-4 w-full max-w-[240px] ml-6 justify-between">
                            {stateContents.map((content, idx) => renderSmallKey(content, idx))}
                        </div>
                    ) : undefined;

                    return (
                        <SidebarItemRow
                            key={i}
                            index={i}
                            keyboard={keyboard}
                            keycode={keycode}
                            label={i.toString()}
                            keyContents={keyContents}
                            onEdit={handleEdit}
                            onAssignKeycode={assignKeycode}
                            hoverBorderColor={hoverBorderColor}
                            hoverBackgroundColor={hoverBackgroundColor}
                            hoverLayerColor={layerColorName}
                            hoverHeaderClass={hoverHeaderClass}
                        >
                            {rowChildren}
                        </SidebarItemRow>
                    );
                })}
                {tapdances.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        No tapdances found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TapdancePanel;
