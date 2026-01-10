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

import { LayoutSettingsProvider, useLayoutSettings } from "@/contexts/LayoutSettingsContext";

import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useChanges } from "@/hooks/useChanges";
import { Zap } from "lucide-react";
import { MatrixTester } from "@/components/MatrixTester";

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
    const { keyboard, isConnected } = useVial();
    const { selectedLayer, setSelectedLayer } = useLayer();
    const { clearSelection } = useKeyBinding();
    const { keyVariant, setKeyVariant } = useLayoutSettings();

    const { getSetting } = useSettings();
    const { getPendingCount, commit, setInstant } = useChanges();

    const liveUpdating = getSetting("live-updating");

    React.useEffect(() => {
        setInstant(!!liveUpdating);
    }, [liveUpdating, setInstant]);

    const hasChanges = getPendingCount() > 0;

    const primarySidebar = useSidebar("primary-nav", { defaultOpen: false });
    const { isMobile, state, activePanel } = usePanels();

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
                        {activePanel === "matrixtester" ? (
                            <MatrixTester />
                        ) : (
                            <Keyboard keyboard={keyboard!} selectedLayer={selectedLayer} setSelectedLayer={setSelectedLayer} />
                        )}
                    </div>
                </div>


                <div className="absolute bottom-9 left-[37px] flex items-center gap-6">
                    {liveUpdating ? (
                        <div className={cn("flex items-center gap-2 text-sm font-medium animate-in fade-in zoom-in duration-300", !isConnected && "opacity-30")}>
                            <Zap className="h-4 w-4 fill-black text-black" />
                            <span>Live Updating</span>
                        </div>
                    ) : (
                        <button
                            className={cn(
                                "h-9 rounded-full px-4 text-sm font-medium transition-all shadow-sm flex items-center gap-2",
                                isConnected
                                    ? "bg-black text-white hover:bg-black/90 cursor-pointer animate-in fade-in zoom-in duration-300"
                                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                            )}
                            disabled={!isConnected}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (hasChanges) {
                                    commit();
                                }
                            }}
                        >
                            Update Changes
                        </button>
                    )}

                    <div className="flex flex-row items-center gap-0.5 bg-gray-200/50 p-0.5 rounded-md border border-gray-300/50 w-fit">
                        {(['default', 'medium', 'small'] as const).map((variant) => (
                            <button
                                key={variant}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setKeyVariant(variant);
                                }}
                                className={cn(
                                    "px-2 py-0.5 text-[10px] uppercase tracking-wide rounded-[4px] transition-all font-semibold border",
                                    keyVariant === variant
                                        ? "bg-black text-white shadow-sm border-black"
                                        : "text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-300/50"
                                )}
                                title={`Set key size to ${variant}`}
                            >
                                {variant === 'default' ? 'Normal' : variant}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorLayout;
