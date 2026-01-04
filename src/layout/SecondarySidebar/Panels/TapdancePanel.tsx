import React from "react";

import SidebarItemRow from "@/layout/SecondarySidebar/components/SidebarItemRow";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useLayer } from "@/contexts/LayerContext";
import { usePanels } from "@/contexts/PanelsContext";
import { useVial } from "@/contexts/VialContext";
import { hoverBackgroundClasses, hoverBorderClasses } from "@/utils/colors";
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
        setPanelToGoBack,
        setActivePanel,
    } = usePanels();

    if (!keyboard) return null;

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];

    const tapdances = keyboard.tapdances || [];

    const handleEdit = (index: number) => {
        setItemToEdit(index);
        setBindingTypeToEdit("tapdances");
        setAlternativeHeader(true);
        setPanelToGoBack("tapdances");
        setActivePanel("keyboard");
    };

    return (
        <section className="space-y-3 h-full max-h-full flex flex-col pt-3">
            <div className="flex flex-col overflow-auto flex-grow scrollbar-thin">
                {tapdances.map((_, i) => {
                    const keycode = `TD(${i})`;
                    const keyContents = getKeyContents(keyboard, keycode) as KeyContent;

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
                        />
                    );
                })}
                {tapdances.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        No tapdances found.
                    </div>
                )}
            </div>
        </section>
    );
};

export default TapdancePanel;
