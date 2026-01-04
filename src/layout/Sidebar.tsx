import { ChevronsRight, Cpu, HelpCircle, LucideIcon, Settings } from "lucide-react";
import { useCallback } from "react";

import ComboIcon from "@/components/ComboIcon";
import GamepadDirectional from "@/components/icons/GamepadDirectional";
import KeyboardIcon from "@/components/icons/Keyboard";
import LayersDefaultIcon from "@/components/icons/LayersDefault";
import MacrosIcon from "@/components/icons/MacrosIcon";
import MatrixTesterIcon from "@/components/icons/MatrixTester";
import MouseIcon from "@/components/icons/Mouse";
import OverridesIcon from "@/components/icons/Overrides";
import TapdanceIcon from "@/components/icons/Tapdance";
import Logo from "@/components/Logo";
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
import { cn } from "@/lib/utils";

// --- Constants ---
const ICON_GUTTER_WIDTH = "w-[43px]";
const BASE_ICON_PADDING = "pl-[13px]";
const LOGO_ICON_PADDING = "pl-[10px]";
const MENU_ITEM_GAP_PX = 42; // Matches Gap-4 (16px) + Button Height (26px)

export type SidebarItem = {
    title: string;
    url: string;
    icon: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
};

export const primarySidebarItems: SidebarItem[] = [
    { title: "Keys", url: "keyboard", icon: KeyboardIcon },
    { title: "Special Keys", url: "special", icon: MatrixTesterIcon },
    { title: "QMK Keys", url: "qmk", icon: Cpu },
    { title: "Mouse", url: "mouse", icon: MouseIcon },
    { title: "Layers", url: "layers", icon: LayersDefaultIcon },
    { title: "Tap Dances", url: "tapdances", icon: TapdanceIcon },
    { title: "Combos", url: "combos", icon: ComboIcon },
    { title: "Macros", url: "macros", icon: MacrosIcon },
    { title: "Overrides", url: "overrides", icon: OverridesIcon },
];

const footerItems: SidebarItem[] = [
    { title: "About", url: "about", icon: HelpCircle },
    { title: "Matrix Tester", url: "matrixtester", icon: GamepadDirectional },
    { title: "Settings", url: "settings", icon: Settings },
];

// --- Sub-components ---

const SlidingIndicator = ({ index }: { index: number }) => (
    <div
        className="absolute left-[4px] top-0 w-[3px] h-[26px] bg-black z-20 transition-transform duration-300 ease-in-out pointer-events-none"
        style={{ transform: `translateY(${index * MENU_ITEM_GAP_PX}px)` }}
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
                (alternativeHeader ? isPreviousPanel : isActive) ? "text-sidebar-foreground" : "text-gray-400"
            )}
        >
            <button type="button" onClick={() => onClick(item)} className="flex w-full items-center justify-start">
                <div className={cn(ICON_GUTTER_WIDTH, "h-full flex items-center justify-start shrink-0", BASE_ICON_PADDING)}>
                    <item.icon className="h-4 w-4 shrink-0" />
                </div>
                <span className="truncate group-data-[state=collapsed]:hidden">
                    {item.title}
                </span>
            </button>
        </SidebarMenuButton>
    </SidebarMenuItem>
);

// --- Main Component ---

const AppSidebar = () => {
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
    } = usePanels();

    const handleItemSelect = useCallback(
        (item: SidebarItem) => {
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
        [activePanel, open, handleCloseDetails, setActivePanel, openDetails, setPanelToGoBack, setAlternativeHeader, setItemToEdit]
    );

    const activePrimaryIndex = primarySidebarItems.findIndex((item) => item.url === activePanel);
    const activeFooterIndex = footerItems.findIndex((item) => item.url === activePanel);

    const sidebarClasses = cn(
        "z-11 fixed transition-[box-shadow,border-color] duration-300 ease-out border border-sidebar-border shadow-lg ml-2 h-[98vh] mt-[1vh] transition-all",
        "rounded-3xl"
    );

    return (
        <Sidebar rounded name="primary-nav" defaultOpen={false} collapsible="icon" hideGap className={sidebarClasses}>
            <SidebarHeader className="p-0 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="nav" className="hover:bg-transparent cursor-default">
                            <div className="flex w-full items-center justify-start">
                                <div className={cn(ICON_GUTTER_WIDTH, "h-4 flex items-center justify-start shrink-0", LOGO_ICON_PADDING)}>
                                    <Logo />
                                </div>
                                <span className="text-[22px] font-semibold truncate group-data-[state=collapsed]:hidden">Keybard</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="nav" className="text-slate-600 transition-colors">
                            <button type="button" onClick={() => toggleSidebar()} className="flex w-full items-center justify-start">
                                <div className={cn(ICON_GUTTER_WIDTH, "h-4 flex items-center justify-start shrink-0", BASE_ICON_PADDING)}>
                                    <ChevronsRight className={cn("h-4 w-4 shrink-0 transition-transform", !isCollapsed ? "rotate-180" : "")} />
                                </div>
                                <span className="text-md font-medium truncate group-data-[state=collapsed]:hidden">Hide Menu</span>
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="py-2 !overflow-visible flex flex-col justify-center">
                <SidebarMenu className="relative">
                    {activePrimaryIndex !== -1 && <SlidingIndicator index={activePrimaryIndex} />}
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
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-0 py-2 !overflow-visible mb-3">
                <SidebarMenu className="relative">
                    {activeFooterIndex !== -1 && <SlidingIndicator index={activeFooterIndex} />}
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
