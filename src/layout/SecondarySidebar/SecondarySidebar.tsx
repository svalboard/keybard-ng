import "./SecondarySidebar.css";

import * as React from "react";
import { ArrowLeft, X } from "lucide-react";

import BindingEditorContainer from "./components/BindingEditor/BindingEditorContainer";
import BasicKeyboards from "./Panels/BasicKeyboards";
import CombosPanel from "./Panels/CombosPanel";
import LayersPanel from "./Panels/LayersPanel";
import MacrosPanel from "./Panels/MacrosPanel";
import SpecialKeysPanel from "./Panels/SpecialKeysPanel/SpecialKeysPanel";
import OverridesPanel from "./Panels/OverridesPanel";
import QmkKeyPanel from "./Panels/QmkKeysPanel";
import SettingsPanel from "./Panels/SettingsPanel";
import TapdancePanel from "./Panels/TapdancePanel";

import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { usePanels } from "@/contexts/PanelsContext";

export const DETAIL_SIDEBAR_WIDTH = "32rem";

/**
 * Resolves the human-readable title for a given panel identifier.
 */
const getPanelTitle = (panel: string | null | undefined): string => {
    if (!panel) return "Details";

    const titles: Record<string, string> = {
        keyboard: "Keyboard Keys",
        layers: "Layers",
        tapdances: "Tap Dances",
        macros: "Macros",
        qmk: "QMK Keys",
        special: "Special Keys",
        combos: "Combos",
        overrides: "Overrides",
        settings: "Settings",
        about: "About",
    };

    return titles[panel] ?? "Details";
};

/**
 * Header component shown when in "Add Key" mode (Alternative Header).
 */
const AlternativeHeader = () => {
    const { activePanel, panelToGoBack, handleCloseEditor } = usePanels();

    const title = `Add ${getPanelTitle(activePanel)} to ${getPanelTitle(panelToGoBack)}`;

    return (
        <div className="flex items-center justify-start gap-4">
            <button
                type="button"
                onClick={() => handleCloseEditor()}
                className="bg-transparent hover:bg-muted/60 rounded-full p-2 cursor-pointer transition-colors"
                aria-label="Go back"
            >
                <ArrowLeft className="h-6 w-6 text-gray-500" />
            </button>
            <div>
                <h2 className="text-[22px] font-semibold leading-none text-slate-700">
                    {title}
                </h2>
            </div>
        </div>
    );
};

/**
 * The Secondary Sidebar (Detail Panel) slides in to show context-specific tools
 * like Layer management, Key settings, macros, etc.
 */
const SecondarySidebar = () => {
    const primarySidebar = useSidebar("primary-nav", { defaultOpen: false });
    const { activePanel, handleCloseDetails, state, alternativeHeader, itemToEdit, setItemToEdit } = usePanels();

    // Calculate dynamic offset based on primary sidebar state
    const primaryOffset = primarySidebar.state === "collapsed"
        ? "calc(var(--sidebar-width-icon) + var(--spacing)*4)"
        : "calc(var(--sidebar-width-base) + var(--spacing)*4)";

    const handleClose = React.useCallback(() => {
        setItemToEdit(null);
        handleCloseDetails();
    }, [handleCloseDetails, setItemToEdit]);

    const renderContent = () => {
        if (!activePanel) {
            return (
                <div className="grid place-items-center h-full text-center text-sm text-muted-foreground px-6">
                    Select a menu item to view contextual actions and key groups.
                </div>
            );
        }

        switch (activePanel) {
            case "keyboard": return <BasicKeyboards />;
            case "layers": return <LayersPanel />;
            case "tapdances": return <TapdancePanel />;
            case "macros": return <MacrosPanel />;
            case "combos": return <CombosPanel />;
            case "overrides": return <OverridesPanel />;
            case "qmk": return <QmkKeyPanel />;
            case "special": return <SpecialKeysPanel />;
            case "settings": return <SettingsPanel />;
            default:
                return (
                    <div className="grid place-items-center h-full text-center text-sm text-muted-foreground px-6">
                        {`Content for "${activePanel}" will appear here soon.`}
                    </div>
                );
        }
    };

    return (
        <Sidebar
            name="details-panel"
            defaultOpen={false}
            collapsible="offcanvas"
            hideGap
            className="z-9 absolute bg-sidebar-background"
            style={{
                left: state === "collapsed" ? undefined : primaryOffset,
                "--sidebar-width": DETAIL_SIDEBAR_WIDTH,
            } as React.CSSProperties}
        >
            <SidebarHeader className="px-4 py-6">
                {alternativeHeader ? (
                    <AlternativeHeader />
                ) : (
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-[22px] font-semibold leading-none text-slate-700">
                                {getPanelTitle(activePanel)}
                            </h2>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            onClick={handleClose}
                            aria-label="Close details panel"
                        >
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

export default SecondarySidebar;
