import * as React from "react";

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { PanelsProvider, usePanels } from "@/contexts/PanelsContext";
import SecondarySidebar from "./SecondarySidebar/SecondarySidebar";

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
import { MatrixTester } from "@/components/MatrixTester";

import { SidebarShield } from "./components/SidebarShield";
import { BottomToolbar } from "./components/BottomToolbar";
import { ConnectionSyncDialog } from "@/components/ConnectionSyncDialog";
import {
    DETAIL_SIDEBAR_WIDTH,
    LAYOUT_TRANSITION_CURVE,
    LAYOUT_TRANSITION_DURATION,
    PANEL_PADDING_X,
    PANELS_SUPPORTING_PICKER,
    SCROLL_BUFFER_SIZE
} from "./layout.constants";

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
    // --- Context Hooks ---
    const { keyboard, isConnected, connect, loadKeyboard } = useVial();
    const { selectedLayer, setSelectedLayer } = useLayer();
    const { clearSelection } = useKeyBinding();
    const { keyVariant, setKeyVariant } = useLayoutSettings();
    const { getSetting } = useSettings();
    const { getPendingCount, commit, setInstant } = useChanges();
    const [isSyncDialogOpen, setIsSyncDialogOpen] = React.useState(false);
    const primarySidebar = useSidebar("primary-nav", { defaultOpen: false });
    const { isMobile, state, activePanel, itemToEdit } = usePanels();

    // --- State & Settings ---
    const liveUpdating = getSetting("live-updating");
    const hasChanges = getPendingCount() > 0;

    const handleConnect = React.useCallback(async () => {
        const success = await connect();
        if (success) {
            if (!liveUpdating) {
                setIsSyncDialogOpen(true);
            } else {
                await loadKeyboard();
            }
        }
    }, [connect, liveUpdating, loadKeyboard]);

    const handleLoadFromKeyboard = React.useCallback(async () => {
        await loadKeyboard();
    }, [loadKeyboard]);

    const handleUpdateKeyboard = React.useCallback(async () => {
        await commit();
    }, [commit]);

    React.useEffect(() => {
        setInstant(!!liveUpdating);
    }, [liveUpdating, setInstant]);

    // --- Layout Calculations ---
    const primaryOffset = primarySidebar.isMobile
        ? undefined
        : primarySidebar.state === "collapsed" ? "56px" : "calc(var(--sidebar-width-base) + 8px)";

    const showDetailsSidebar = !isMobile && state === "expanded" && !!activePanel;
    const showPicker = itemToEdit !== null && (PANELS_SUPPORTING_PICKER as readonly string[]).includes(activePanel || "");

    // --- Scroll Management ---
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const animationRef = React.useRef<number | null>(null);

    // Initial scroll adjustment when picker opens/closes to prevent visual jumps
    React.useLayoutEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        if (animationRef.current !== null) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        if (showPicker) {
            container.scrollLeft += SCROLL_BUFFER_SIZE;
            requestAnimationFrame(() => {
                if (container.scrollLeft < SCROLL_BUFFER_SIZE) {
                    container.scrollLeft += SCROLL_BUFFER_SIZE;
                }
            });
        } else {
            const startScroll = container.scrollLeft;
            const targetScroll = Math.max(0, startScroll - SCROLL_BUFFER_SIZE);

            if (startScroll === targetScroll) return;

            const duration = parseInt(LAYOUT_TRANSITION_DURATION);
            const startTime = performance.now();

            const animate = (time: number) => {
                const elapsed = time - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 4); // Quart-Out

                container.scrollLeft = startScroll + (targetScroll - startScroll) * ease;

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    animationRef.current = null;
                }
            };
            animationRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
        };
    }, [showPicker]);

    // --- Styles & Transitions ---
    const sharedTransition = `320ms ${LAYOUT_TRANSITION_CURVE}`;

    const contentStyle = React.useMemo<React.CSSProperties>(
        () => ({
            marginLeft: primaryOffset,
            transition: `margin-left ${sharedTransition}`,
            willChange: "margin-left",
        }),
        [primaryOffset, sharedTransition]
    );

    const spacerStyle = React.useMemo<React.CSSProperties>(
        () => ({
            width: showDetailsSidebar ? `calc(${DETAIL_SIDEBAR_WIDTH} + ${PANEL_PADDING_X})` : 0,
            minWidth: showDetailsSidebar ? `calc(${DETAIL_SIDEBAR_WIDTH} + ${PANEL_PADDING_X})` : 0,
            transition: `width ${sharedTransition}, min-width ${sharedTransition}`,
            willChange: "width, min-width",
        }),
        [showDetailsSidebar, sharedTransition]
    );

    const bufferStyle = React.useMemo<React.CSSProperties>(
        () => ({
            width: showPicker ? SCROLL_BUFFER_SIZE : 0,
            minWidth: showPicker ? SCROLL_BUFFER_SIZE : 0,
            visibility: showPicker || animationRef.current !== null ? 'visible' : 'hidden',
            transition: showPicker ? "none" : `width ${sharedTransition}, min-width ${sharedTransition}`,
            willChange: "width, min-width",
        }),
        [showPicker, sharedTransition]
    );

    const bottomUiStyle = React.useMemo<React.CSSProperties>(
        () => ({
            transform: showDetailsSidebar ? `translateX(calc(${DETAIL_SIDEBAR_WIDTH} + ${PANEL_PADDING_X}))` : "translateX(0)",
            transition: `transform ${sharedTransition}`,
            willChange: "transform",
        }),
        [showDetailsSidebar, sharedTransition]
    );

    return (
        <div className={cn("flex h-screen max-w-screen p-0", showDetailsSidebar ? "bg-white" : "bg-kb-gray")}>
            <SidebarShield
                isVisible={showDetailsSidebar || showPicker}
                primaryOffset={primaryOffset}
            />

            <AppSidebar />
            <SecondarySidebar />

            <div
                className="relative flex-1 px-4 h-screen max-h-screen flex flex-col max-w-full w-full overflow-hidden bg-kb-gray border-none"
                style={contentStyle}
                onClick={() => clearSelection()}
            >
                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-auto flex items-start overflow-x-auto max-w-full"
                    style={{ scrollBehavior: "auto" }}
                >
                    <div className="flex-shrink-0 h-full pointer-events-none" style={bufferStyle} />
                    <div className="flex-shrink-0 h-full pointer-events-none" style={spacerStyle} />

                    <div className={cn("flex flex-col flex-1 h-full min-h-full", showDetailsSidebar && "pr-[450px]")} style={{ paddingRight: '100vw' }}>
                        <LayerSelector selectedLayer={selectedLayer} setSelectedLayer={setSelectedLayer} />
                        <div className="flex-1 flex items-center min-h-[500px] py-8">
                            {activePanel === "matrixtester" ? (
                                <MatrixTester />
                            ) : (
                                <Keyboard keyboard={keyboard!} selectedLayer={selectedLayer} setSelectedLayer={setSelectedLayer} />
                            )}
                        </div>
                    </div>
                </div>

                <BottomToolbar
                    isConnected={isConnected}
                    liveUpdating={!!liveUpdating}
                    hasChanges={hasChanges}
                    keyVariant={keyVariant}
                    onConnect={handleConnect}
                    onCommit={commit}
                    onSetKeyVariant={setKeyVariant}
                    style={bottomUiStyle}
                />
            </div>
            <ConnectionSyncDialog
                isOpen={isSyncDialogOpen}
                onClose={() => setIsSyncDialogOpen(false)}
                onLoadFromKeyboard={handleLoadFromKeyboard}
                onUpdateKeyboard={handleUpdateKeyboard}
            />
        </div>
    );
};

export default EditorLayout;

