import React from "react";

import SidebarItemRow from "@/layout/SecondarySidebar/components/SidebarItemRow";
import { useLayer } from "@/contexts/LayerContext";
import { usePanels } from "@/contexts/PanelsContext";
import { useVial } from "@/contexts/VialContext";
import { hoverBackgroundClasses, hoverBorderClasses } from "@/utils/colors";
import { KeyContent } from "@/types/vial.types";

const CombosPanel: React.FC = () => {
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

    const combos = keyboard.combos || [];

    const handleEdit = (index: number) => {
        setItemToEdit(index);
        setBindingTypeToEdit("combos");
        setAlternativeHeader(true);
        setPanelToGoBack("combos");
        setActivePanel("keyboard");
    };

    return (
        <section className="space-y-3 h-full max-h-full flex flex-col pt-3">
            <div className="flex flex-col overflow-auto flex-grow scrollbar-thin">
                {combos.map((_, i) => {
                    // For combos, we don't have a standard keycode resolution like TD() or M().
                    // We'll just display the index on the key.
                    const keyContents = { type: "combo" } as KeyContent;

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
                        />
                    );
                })}
                {combos.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        No combos found.
                    </div>
                )}
            </div>
        </section>
    );
};

export default CombosPanel;
