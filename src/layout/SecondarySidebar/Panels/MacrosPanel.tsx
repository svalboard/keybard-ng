import React from "react";
import { ArrowRight } from "lucide-react";
import { Key } from "@/components/Key";

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
                {macros.map((macroEntry, i) => {
                    const keycode = `M${i}`;
                    const keyContents = getKeyContents(keyboard, keycode) as KeyContent;

                    // Ensure we have actions to render
                    const actions = macroEntry?.actions || [];
                    const hasActions = actions.length > 0;

                    const renderAction = (action: any, idx: number) => {
                        const [type, value] = action;

                        if (["tap", "down", "up"].includes(type)) {
                            // Render Key
                            const actionKeycode = value || "KC_NO";
                            const actionKeyContents = getKeyContents(keyboard, actionKeycode);

                            return (
                                <div className="w-[30px] h-[30px] relative flex-shrink-0" key={idx}>
                                    <Key
                                        isRelative
                                        x={0}
                                        y={0}
                                        w={1}
                                        h={1}
                                        row={-1}
                                        col={-1}
                                        keycode={actionKeycode}
                                        label={actionKeyContents?.str || ""}
                                        keyContents={actionKeyContents}
                                        variant="small"
                                        layerColor="sidebar"
                                        className="border-kb-gray"
                                        headerClassName="bg-kb-sidebar-dark"
                                    />
                                </div>
                            );
                        } else if (type === "text") {
                            return (
                                <div key={idx} className="flex items-center justify-center bg-black border border-black rounded text-[10px] px-2 h-[30px] whitespace-nowrap max-w-[100px] overflow-hidden text-ellipsis shadow-sm font-medium text-white">
                                    "{value}"
                                </div>
                            );
                        } else if (type === "delay") {
                            return (
                                <div key={idx} className="flex items-center justify-center bg-black border border-black rounded text-[10px] px-2 h-[30px] shadow-sm font-medium text-white">
                                    {value}ms
                                </div>
                            );
                        }
                        return null;
                    };

                    const rowChildren = hasActions ? (
                        <div className="flex flex-row items-center gap-1 w-full overflow-hidden mask-linear-fade">
                            {actions.map((action, idx) => (
                                <React.Fragment key={idx}>
                                    {idx > 0 && <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                                    {renderAction(action, idx)}
                                </React.Fragment>
                            ))}
                        </div>
                    ) : undefined;

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
                        >
                            {rowChildren}
                        </SidebarItemRow>
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
