import { HelpCircle, Keyboard, LucideIcon, Piano, Settings, SquareDot } from "lucide-react";
import { useCallback } from "react";

import ComboIcon from "@/components/ComboIcon";
import GamepadDirectional from "@/components/icons/GamepadDirectional";

import LayersDefaultIcon from "@/components/icons/LayersDefault";
import MacrosIcon from "@/components/icons/MacrosIcon";
import MouseIcon from "@/components/icons/Mouse";
import OverridesIcon from "@/components/icons/Overrides";
import TapdanceIcon from "@/components/icons/Tapdance";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
} from "@/components/ui/sidebar";
import { usePanels } from "@/contexts/PanelsContext";
import { useVial } from "@/contexts/VialContext";
import { cn } from "@/lib/utils";
import { ConnectButton } from "./Sidebar/SidebarAdditionalButtons";
import SidebarLogo from "./Sidebar/SidebarLogo";
import { BASE_ICON_PADDING, FEATURE_SECTION_OFFSET, ICON_GUTTER_WIDTH, MENU_ITEM_GAP_PX } from "./utils";

export type SidebarItem = {
    title: string;
    url: string;
    icon: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
};

export const primarySidebarItems: SidebarItem[] = [
    { title: "Keyboard", url: "keyboard", icon: Keyboard },
    { title: "Special", url: "special", icon: Piano },
    { title: "One-Shot", url: "qmk", icon: SquareDot },
    { title: "Layer Keys", url: "layers", icon: LayersDefaultIcon },
    { title: "Mouse", url: "mouse", icon: MouseIcon },
    { title: "Tap Dances", url: "tapdances", icon: TapdanceIcon },
    { title: "Macros", url: "macros", icon: MacrosIcon },
];

const featureSidebarItems: SidebarItem[] = [
    { title: "Combos", url: "combos", icon: ComboIcon },
    { title: "Overrides", url: "overrides", icon: OverridesIcon },
];

const footerItems: SidebarItem[] = [
    { title: "About", url: "about", icon: HelpCircle },
    { title: "Matrix Tester", url: "matrixtester", icon: GamepadDirectional },
    { title: "Settings", url: "settings", icon: Settings },
];

// --- Sub-components ---

const SlidingIndicator = ({ y }: { y: number }) => (
    <div
        className="absolute left-[4px] top-0 w-[3px] h-[26px] bg-black z-20 transition-transform duration-300 ease-in-out pointer-events-none"
        style={{ transform: `translateY(${y}px)` }}
    />
);

interface SidebarNavItemProps {
    item: SidebarItem;
    isActive: boolean;
    isPreviousPanel?: boolean;
    alternativeHeader?: boolean;
    onClick: (item: SidebarItem) => void;
}

const SidebarNavItem = ({
    item,
    isActive,
    isPreviousPanel,
    alternativeHeader,
    onClick,
}: SidebarNavItemProps) => (
    <SidebarMenuItem className="cursor-pointer">
        <SidebarMenuButton
            asChild
            isActive={isActive}
            tooltip={item.title}
            sidebarName="primary-nav"
            size="nav"
            className={cn(
                "transition-colors",
                (alternativeHeader ? isPreviousPanel : isActive) ? "text-sidebar-foreground" : "text-gray-400",
                "group-data-[state=collapsed]:w-full flex items-center"
            )}
        >
            <button type="button" onClick={(e) => { e.stopPropagation(); onClick(item); }} className="flex w-full items-center group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:mr-[3px]">
                <div className={cn(ICON_GUTTER_WIDTH, "h-full flex items-center justify-start shrink-0", BASE_ICON_PADDING)}>
                    <item.icon className="h-4 w-4 shrink-0 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:ml-[2px]" />
                </div>
                <span className="truncate group-data-[state=collapsed]:hidden">
                    {item.title}
                </span>
            </button>
        </SidebarMenuButton>
    </SidebarMenuItem>
);

// --- Main Component ---

interface AppSidebarProps {
    onConnect?: () => void;
}

const AppSidebar = ({ onConnect }: AppSidebarProps) => {
    const { state, toggleSidebar } = useSidebar("primary-nav", { defaultOpen: false });
    const isCollapsed = state === "collapsed";

    const {
        setItemToEdit,
        setActivePanel,
        openDetails,
        activePanel,
        panelToGoBack,
        alternativeHeader,
        setPanelToGoBack,
        setAlternativeHeader,
        open,
        handleCloseDetails,
        setOpen,
    } = usePanels();

    const { connect, isConnected } = useVial();

    const handleItemSelect = useCallback(
        (item: SidebarItem) => {
            if (item.url === "matrixtester") {
                if (activePanel === "matrixtester") {
                    setActivePanel(null);
                    return;
                }
                setOpen(false);
                setActivePanel("matrixtester");
                setPanelToGoBack(null);
                setItemToEdit(null);
                return;
            }

            if (activePanel === item.url && open) {
                handleCloseDetails();
            } else {
                setActivePanel(item.url);
                openDetails();
                setPanelToGoBack(null);
                setAlternativeHeader(false);
                setItemToEdit(null);
            }
        },
        [activePanel, open, handleCloseDetails, setActivePanel, openDetails, setPanelToGoBack, setAlternativeHeader, setItemToEdit, setOpen]
    );



    const activePrimaryIndex = primarySidebarItems.findIndex((item) => item.url === activePanel);
    const activeFeatureIndex = featureSidebarItems.findIndex((item) => item.url === activePanel);
    const activeFooterIndex = footerItems.findIndex((item) => item.url === activePanel);

    let indicatorY = -1;
    if (activePrimaryIndex !== -1) {
        indicatorY = activePrimaryIndex * MENU_ITEM_GAP_PX;
    } else if (activeFeatureIndex !== -1) {
        indicatorY = (primarySidebarItems.length * MENU_ITEM_GAP_PX) + FEATURE_SECTION_OFFSET + (activeFeatureIndex * MENU_ITEM_GAP_PX);
    }

    const sidebarClasses = cn(
        "z-11 fixed transition-[box-shadow,border-color] duration-300 ease-out border border-sidebar-border shadow-lg ml-2 h-[98vh] mt-[1vh] transition-all",
        "rounded-3xl"
    );

    return (
        <Sidebar rounded name="primary-nav" defaultOpen={false} collapsible="icon" hideGap className={sidebarClasses}>
            <SidebarHeader className="p-0 py-4">
                <SidebarMenu>
                    <SidebarLogo toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} open={open} activePanel={activePanel} setActivePanel={setActivePanel} handleCloseDetails={handleCloseDetails} />
                    <ConnectButton connect={onConnect || connect} isConnected={isConnected} />
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="py-2 !overflow-visible flex flex-col justify-center">
                <SidebarMenu className="relative">
                    {indicatorY !== -1 && <SlidingIndicator y={indicatorY} />}
                    {primarySidebarItems.map((item) => (
                        <SidebarNavItem
                            key={item.url}
                            item={item}
                            isActive={activePanel === item.url}
                            isPreviousPanel={panelToGoBack === item.url}
                            alternativeHeader={alternativeHeader}
                            onClick={handleItemSelect}
                        />
                    ))}

                    <div className="mx-4 my-2 h-[1px] bg-slate-200" />

                    {featureSidebarItems.map((item) => (
                        <SidebarNavItem
                            key={item.url}
                            item={item}
                            isActive={activePanel === item.url}
                            isPreviousPanel={panelToGoBack === item.url}
                            alternativeHeader={alternativeHeader}
                            onClick={handleItemSelect}
                        />
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-0 py-2 !overflow-visible mb-3">
                <SidebarMenu className="relative">
                    {activeFooterIndex !== -1 && <SlidingIndicator y={activeFooterIndex * MENU_ITEM_GAP_PX} />}
                    {footerItems.map((item) => (
                        <SidebarNavItem
                            key={item.url}
                            item={item}
                            isActive={activePanel === item.url}
                            onClick={handleItemSelect}
                        />
                    ))}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;
