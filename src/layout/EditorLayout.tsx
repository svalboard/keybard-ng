import * as React from "react";

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { PanelsProvider, usePanels } from "@/contexts/PanelsContext";
import SecondarySidebar, { DETAIL_SIDEBAR_WIDTH } from "./SecondarySidebar/SecondarySidebar";

import { Keyboard } from "@/components/Keyboard";
import { useVial } from "@/contexts/VialContext";
import { cn } from "@/lib/utils";
import LayerSelector from "./LayerSelector";
import AppSidebar from "./Sidebar";

import { LayerProvider, useLayer } from "@/contexts/LayerContext";

import { LayoutSettingsProvider } from "@/contexts/LayoutSettingsContext";

import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useChanges } from "@/hooks/useChanges";
import { Zap } from "lucide-react";

const EditorLayout = () => {
    return (
        <SidebarProvider defaultOpen={false}>
            <PanelsProvider>
                <LayoutSettingsProvider>
                    <LayerProvider>
                        <EditorLayoutInner />
                    </LayerProvider>
                </LayoutSettingsProvider>
            </PanelsProvider>
        </SidebarProvider>
    );
};

const EditorLayoutInner = () => {
    const { keyboard } = useVial();
    const { selectedLayer, setSelectedLayer } = useLayer();
    const { clearSelection } = useKeyBinding();

    const { getSetting } = useSettings();
    const { getPendingCount, commit } = useChanges();

    const liveUpdating = getSetting("live-updating");
    const hasChanges = getPendingCount() > 0;

    const primarySidebar = useSidebar("primary-nav", { defaultOpen: false });
    const { isMobile, state } = usePanels();

    const primaryOffset = primarySidebar.isMobile ? undefined : primarySidebar.state === "collapsed" ? "var(--sidebar-width-icon)" : "var(--sidebar-width-base)";
    const showDetailsSidebar = !isMobile && state === "expanded";
    const contentOffset = showDetailsSidebar ? `calc(${primaryOffset ?? "0px"} + ${DETAIL_SIDEBAR_WIDTH})` : primaryOffset ?? undefined;
    const contentStyle = React.useMemo<React.CSSProperties>(
        () => ({
            marginLeft: contentOffset,
            transition: "margin-left 320ms cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "margin-left",
        }),
        [contentOffset]
    );

    return (
        <div className={cn("flex h-screen max-w-screen p-0", showDetailsSidebar && "bg-white")}>
            <AppSidebar />
            <SecondarySidebar />
            <div
                className="relative flex-1 px-4 h-screen max-h-screen flex flex-col max-w-full w-full overflow-hidden bg-kb-gray border-none"
                style={contentStyle}
                onClick={() => clearSelection()}
            >
                <LayerSelector selectedLayer={selectedLayer} setSelectedLayer={setSelectedLayer} />
                <div className="flex-1 overflow-auto flex items-center overflow-x-auto max-w-full">
                    <div className={cn(showDetailsSidebar && "pr-[450px]")}>
                        <Keyboard keyboard={keyboard!} selectedLayer={selectedLayer} setSelectedLayer={setSelectedLayer} />
                    </div>
                </div>

                {liveUpdating ? (
                    <div className="absolute bottom-9 left-[37px] flex items-center gap-2 text-sm font-medium animate-in fade-in zoom-in duration-300">
                        <Zap className="h-4 w-4 fill-black text-black" />
                        <span>Live Updating</span>
                    </div>
                ) : (
                    <button
                        className={cn(
                            "absolute bottom-9 left-[37px] h-9 rounded-full px-4 text-sm font-medium transition-all shadow-sm flex items-center gap-2",
                            hasChanges
                                ? "bg-black text-white hover:bg-black/90 cursor-pointer animate-in fade-in zoom-in duration-300"
                                : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        )}
                        disabled={!hasChanges}
                        onClick={(e) => {
                            e.stopPropagation();
                            commit();
                        }}
                    >
                        Update Changes
                    </button>
                )}
            </div>
        </div>
    );
};

export default EditorLayout;
