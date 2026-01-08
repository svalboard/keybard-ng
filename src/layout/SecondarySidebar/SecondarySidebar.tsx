import "./SecondarySidebar.css";

import * as React from "react";
import { ArrowLeft, X } from "lucide-react";

import BindingEditorContainer from "./components/BindingEditor/BindingEditorContainer";
import EditorSidePanel, { PickerMode } from "./components/EditorSidePanel";
import BasicKeyboards from "./Panels/BasicKeyboards";
import CombosPanel from "./Panels/CombosPanel";
import LayersPanel from "./Panels/LayersPanel";
import MacrosPanel from "./Panels/MacrosPanel";
import SpecialKeysPanel from "./Panels/SpecialKeysPanel/SpecialKeysPanel";
import OverridesPanel from "./Panels/OverridesPanel";
import QmkKeyPanel from "./Panels/QmkKeysPanel";
import MousePanel from "./Panels/MousePanel";
import SettingsPanel from "./Panels/SettingsPanel";
import TapdancePanel from "./Panels/TapdancePanel";

import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { usePanels } from "@/contexts/PanelsContext";
import { cn } from "@/lib/utils";

export const DETAIL_SIDEBAR_WIDTH = "32rem";

/**
 * Resolves the human-readable title for a given panel identifier.
 */
const getPanelTitle = (panel: string | null | undefined): string => {
    if (!panel) return "Details";

    const titles: Record<string, string> = {
        keyboard: "Keyboard",
        layers: "Layer Keys",
        tapdances: "Tap Dances",
        macros: "Macros",
        qmk: "QMK",
        special: "Special",
        mouse: "Mouse",
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
interface AlternativeHeaderProps {
    onBack?: () => void;
}

const AlternativeHeader = ({ onBack }: AlternativeHeaderProps) => {
    const { activePanel, handleCloseEditor } = usePanels();

    const title = `Add Keys to ${getPanelTitle(activePanel)}`;

    return (
        <div className="flex items-center justify-start gap-4">
            <button
                type="button"
                onClick={() => onBack ? onBack() : handleCloseEditor()}
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

    // Check if we should show the key picker overlay
    // We show it if we are editing an item and we are in a panel that supports key picking
    const showPicker = itemToEdit !== null && ["tapdances", "combos", "macros", "overrides"].includes(activePanel || "");

    const [pickerMode, setPickerMode] = React.useState<PickerMode>("keyboard");
    const [isClosingEditor, setIsClosingEditor] = React.useState(false);

    // Reset picker mode when picker closes
    React.useEffect(() => {
        if (!showPicker) {
            const timeout = setTimeout(() => setPickerMode("keyboard"), 500);
            return () => clearTimeout(timeout);
        }
    }, [showPicker]);

    React.useEffect(() => {
        if (itemToEdit === null) setIsClosingEditor(false);
    }, [itemToEdit]);

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
            case "mouse": return <MousePanel />;
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
            className="z-9 absolute"
            style={{
                left: state === "collapsed" ? undefined : primaryOffset,
                "--sidebar-width": DETAIL_SIDEBAR_WIDTH,
            } as React.CSSProperties}
        >
            <div className="absolute inset-0 bg-sidebar-background pointer-events-none" />
            <SidebarHeader className="px-4 py-6 z-10 bg-sidebar-background">
                {(alternativeHeader || showPicker) ? (
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
            <SidebarContent className="z-10 relative flex-1 overflow-visible">
                <div
                    key={activePanel ?? "panel-placeholder"}
                    className="panel-fade-bounce absolute inset-0 overflow-auto px-4 transition-all duration-300 ease-in-out"
                >
                    {renderContent()}
                </div>
            </SidebarContent>

            {/* Overlay Panel for Key Picker */}
            <div
                className={cn(
                    "absolute top-0 bottom-0 left-0 -right-[2px] bg-white shadow-[4px_0_16px_rgba(0,0,0,0.1)] z-20 transition-all duration-500 ease-in-out flex flex-col",
                    showPicker ? "translate-x-0 opacity-100" : "-translate-x-[120%] opacity-0 pointer-events-none"
                )}
                aria-hidden={!showPicker}
                style={{ clipPath: "inset(-50px -300px -50px 0px)" }}
            >
                <div className="px-4 py-6 bg-white shrink-0">
                    <AlternativeHeader onBack={() => setIsClosingEditor(true)} />
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 -right-[56px] h-48 z-50">
                    <EditorSidePanel activeTab={pickerMode} onTabChange={setPickerMode} showMacros={activePanel !== "macros"} />
                </div>

                <div className="flex-1 overflow-auto px-4 pb-4">
                    {pickerMode === "keyboard" && <BasicKeyboards isPicker />}
                    {pickerMode === "layers" && <LayersPanel isPicker />}
                    {pickerMode === "macros" && <MacrosPanel isPicker />}
                    {pickerMode === "qmk" && <QmkKeyPanel isPicker />}
                    {pickerMode === "special" && <SpecialKeysPanel isPicker />}
                    {pickerMode === "mouse" && <MousePanel isPicker />}
                </div>
            </div>
            {itemToEdit !== null ? <div className="z-[-1] absolute inset-y-0 right-0 h-full w-0"><BindingEditorContainer shouldClose={isClosingEditor} /></div> : null}
        </Sidebar>
    );
};

export default SecondarySidebar;
