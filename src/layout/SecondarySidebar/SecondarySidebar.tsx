import "./SecondarySidebar.css";

import * as React from "react";

import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { ArrowLeft, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePanels } from "@/contexts/PanelsContext";
import BasicKeyboards from "./Panels/BasicKeyboards";
import CombosPanel from "./Panels/CombosPanel";
import LayersPanel from "./Panels/LayersPanel";
import MacrosPanel from "./Panels/MacrosPanel";
import MiscKeysPanel from "./Panels/MiscKeysPanel/MiscKeysPanel";
import OverridesPanel from "./Panels/OverridesPanel";
import QmkKeyPanel from "./Panels/QmkKeysPanel";
import SettingsPanel from "./Panels/SettingsPanel";
import TapdancePanel from "./Panels/TapdancePanel";
import BindingEditorContainer from "./components/BindingEditor/BindingEditorContainer";

export const DETAIL_SIDEBAR_WIDTH = "32rem";

type SecondarySidebarProps = {};

const AlternativeHeader = () => {
    const { activePanel, panelToGoBack, handleCloseEditor } = usePanels();

    return (
        <div className="flex items-center justify-start gap-4">
            <div onClick={() => handleCloseEditor()} className="bg-transparent hover:bg-muted/60 rounded-full p-2 cursor-pointer">
                <ArrowLeft className="h-6 w-6 text-gray-500" />
            </div>
            <div>
                <h2 className="text-[22px] font-semibold leading-none text-slate-700">
                    Add {getPanelTitle(activePanel!)} to {getPanelTitle(panelToGoBack!)}
                </h2>
            </div>
        </div>
    );
};

const SecondarySidebar: React.FC<SecondarySidebarProps> = ({ }) => {
    const primarySidebar = useSidebar("primary-nav", { defaultOpen: false });
    const primaryOffset = primarySidebar.state === "collapsed" ? "calc(var(--sidebar-width-icon) + var(--spacing)*4)" : "calc(var(--sidebar-width-base) + var(--spacing)*4)";
    const { activePanel, handleCloseDetails, state, alternativeHeader, itemToEdit, setItemToEdit } = usePanels();

    const handleClose = React.useCallback(() => {
        setItemToEdit(null);
        handleCloseDetails();
    }, [handleCloseDetails]);

    const renderContent = () => {
        if (!activePanel) {
            return (
                <div className="grid place-items-center h-full text-center text-sm text-muted-foreground px-6">Select a menu item to view contextual actions and key groups.</div>
            );
        }

        if (activePanel === "keyboard") return <BasicKeyboards />;
        if (activePanel === "layers") return <LayersPanel />;
        if (activePanel === "tapdances") return <TapdancePanel />;
        if (activePanel === "macros") return <MacrosPanel />;
        if (activePanel === "combos") return <CombosPanel />;
        if (activePanel === "overrides") return <OverridesPanel />;
        if (activePanel === "qmk") return <QmkKeyPanel />;
        if (activePanel === "misc") return <MiscKeysPanel />;
        if (activePanel === "settings") return <SettingsPanel />;

        return <div className="grid place-items-center h-full text-center text-sm text-muted-foreground px-6">{`Content for "${activePanel}" will appear here soon.`}</div>;
    };

    return (
        <Sidebar
            name="details-panel"
            defaultOpen={false}
            collapsible="offcanvas"
            hideGap
            className="z-9 absolute bg-sidebar-background"
            style={
                {
                    left: state === "collapsed" ? undefined : primaryOffset,
                    "--sidebar-width": DETAIL_SIDEBAR_WIDTH,
                } as React.CSSProperties
            }
        >
            <SidebarHeader className="px-4 py-6">
                {alternativeHeader ? (
                    <AlternativeHeader />
                ) : (
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-[22px] font-semibold leading-none text-slate-700">{getPanelTitle(activePanel!)}</h2>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={handleClose} aria-label="Close details panel">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </SidebarHeader>
            <SidebarContent className="px-4">
                <div key={activePanel ?? "panel-placeholder"} className="panel-fade-bounce">
                    {renderContent()}
                </div>
                {itemToEdit !== null ? <BindingEditorContainer /> : null}
            </SidebarContent>
        </Sidebar>
    );
};

const getPanelTitle = (panel: string | null) => {
    if (!panel) {
        return "Details";
    }

    switch (panel) {
        case "keyboard":
            return "Keyboard Keys";
        case "layers":
            return "Layers";
        case "tapdances":
            return "Tap Dances";
        case "macros":
            return "Macros";
        case "qmk":
            return "QMK Keys";
        case "misc":
            return "Misc Keys";
        case "combos":
            return "Combos";
        case "overrides":
            return "Overrides";
        case "settings":
            return "Settings";
        case "about":
            return "About";
        default:
            return "Details";
    }
};

export default SecondarySidebar;
