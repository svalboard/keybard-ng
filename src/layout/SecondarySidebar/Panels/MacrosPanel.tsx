import React from "react";

import SidebarItemRow from "@/layout/SecondarySidebar/components/SidebarItemRow";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useLayer } from "@/contexts/LayerContext";
import { usePanels } from "@/contexts/PanelsContext";
import { useVial } from "@/contexts/VialContext";
import { hoverBackgroundClasses, hoverBorderClasses, hoverHeaderClasses } from "@/utils/colors";
import { getKeyContents } from "@/utils/keys";
import { KeyContent } from "@/types/vial.types";

interface Props {
    isPicker?: boolean;
}

const MacrosPanel: React.FC<Props> = ({ isPicker }) => {
    const { keyboard } = useVial();
    const { assignKeycode } = useKeyBinding();
    const { selectedLayer } = useLayer();
    const {
        setItemToEdit,
        setBindingTypeToEdit,
        setAlternativeHeader,
        setPanelToGoBack,
    } = usePanels();

    if (!keyboard) return null;

    const layerColorName = keyboard?.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const hoverBorderColor = hoverBorderClasses[layerColorName] || hoverBorderClasses["primary"];
    const hoverBackgroundColor = hoverBackgroundClasses[layerColorName] || hoverBackgroundClasses["primary"];
    const hoverHeaderClass = hoverHeaderClasses[layerColorName] || hoverHeaderClasses["primary"];

    const macros = keyboard.macros || [];

    const handleEdit = (index: number) => {
        setItemToEdit(index);
        setBindingTypeToEdit("macros");
        setAlternativeHeader(true);
        setPanelToGoBack("macros");
    };

    return (
        <section className="space-y-3 h-full max-h-full flex flex-col pt-3">
            {isPicker && (
                <div className="pb-2">
                    <span className="font-semibold text-xl text-slate-700">Macros</span>
                </div>
            )}
            <div className="flex flex-col overflow-auto flex-grow scrollbar-thin">
                {macros.map((_, i) => {
                    const keycode = `M${i}`;
                    const keyContents = getKeyContents(keyboard, keycode) as KeyContent;

                    return (
                        <SidebarItemRow
                            key={i}
                            index={i}
                            keyboard={keyboard}
                            keycode={keycode}
                            label={i.toString()}
                            hasCustomName={!!keyboard.cosmetic?.macros?.[i.toString()]}
                            customName={keyboard.cosmetic?.macros?.[i.toString()]}
                            keyContents={keyContents}
                            onEdit={isPicker ? undefined : handleEdit}
                            onAssignKeycode={assignKeycode}
                            hoverBorderColor={hoverBorderColor}
                            hoverBackgroundColor={hoverBackgroundColor}
                            hoverLayerColor={layerColorName}
                            hoverHeaderClass={hoverHeaderClass}
                        />
                    );
                })}
                {macros.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        No macros found.
                    </div>
                )}
            </div>
        </section>
    );
};

export default MacrosPanel;
