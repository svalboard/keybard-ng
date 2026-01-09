import React from "react";

import SidebarItemRow from "@/layout/SecondarySidebar/components/SidebarItemRow";
import { useLayer } from "@/contexts/LayerContext";
import { usePanels } from "@/contexts/PanelsContext";
import { useVial } from "@/contexts/VialContext";
import { hoverBackgroundClasses, hoverBorderClasses, hoverHeaderClasses } from "@/utils/colors";
import { KeyContent } from "@/types/vial.types";

const OverridesPanel: React.FC = () => {
    const { keyboard } = useVial();
    const { selectedLayer } = useLayer();
    const {
        setItemToEdit,
        setBindingTypeToEdit,
        setAlternativeHeader,
        setPanelToGoBack,
        setActivePanel,
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
        setPanelToGoBack("overrides");
        setActivePanel("keyboard");
    };

    return (
        <section className="space-y-3 h-full max-h-full flex flex-col pt-3">
            <div className="flex flex-col overflow-auto flex-grow scrollbar-thin">
                {overrides.map((_, i) => {
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
                        />
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
