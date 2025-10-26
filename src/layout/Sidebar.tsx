import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ChevronsLeftRightEllipsis, Cpu, HelpCircle, Layers, LucideIcon, Settings } from "lucide-react";

import ComboIcon from "@/components/ComboIcon";
import KeyboardIcon from "@/components/icons/Keyboard";
import MacrosIcon from "@/components/icons/MacrosIcon";
import MatrixTesterIcon from "@/components/icons/MatrixTester";
import OverridesIcon from "@/components/icons/Overrides";
import TapdanceIcon from "@/components/icons/Tapdance";
import Logo from "@/components/Logo";
import { usePanels } from "@/contexts/PanelsContext";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

export type SidebarItem = {
    title: string;
    url: string;
    icon: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
};

export const primarySidebarItems: SidebarItem[] = [
    { title: "Basic Keyboard", url: "keyboard", icon: KeyboardIcon },
    { title: "Layers", url: "layers", icon: Layers },
    { title: "Tapdances", url: "tapdances", icon: TapdanceIcon },
    { title: "Macros", url: "macros", icon: MacrosIcon },
    { title: "Combos", url: "combos", icon: ComboIcon },
    { title: "Overrides", url: "overrides", icon: OverridesIcon },
    { title: "QMK Keys", url: "qmk", icon: Cpu },
    { title: "Misc Keys", url: "misc", icon: ChevronsLeftRightEllipsis },
    { title: "Matrix Tester", url: "matrixtester", icon: MatrixTesterIcon },
];

const footerItems: SidebarItem[] = [
    { title: "About", url: "about", icon: HelpCircle },
    { title: "Settings", url: "settings", icon: Settings },
];

const AppSidebar = () => {
    const { state } = useSidebar("primary-nav", { defaultOpen: false });
    const isCollapsed = state === "collapsed";
    const sidebarClasses = cn(
        "z-11 fixed transition-[box-shadow,border-color] duration-300 ease-out border border-sidebar-border shadow-lg ml-2 h-[98vh] mt-[1vh] transition-all",
        state === "collapsed" ? "rounded-full " : "rounded-2xl"
    );
    const { setItemToEdit, setActivePanel, openDetails, activePanel, panelToGoBack, alternativeHeader, setPanelToGoBack, setAlternativeHeader } = usePanels();
    const sidebarHeaderClasses = cn("flex items-center gap-2", isCollapsed ? "justify-center py-3" : "justify-center py-3");
    const handleItemSelect = useCallback(
        (item: SidebarItem) => {
            setActivePanel(item.url);
            openDetails();
            setPanelToGoBack(null);
            setAlternativeHeader(false);
            setItemToEdit(null);
        },
        [openDetails]
    );

    return (
        <Sidebar rounded name="primary-nav" defaultOpen={false} collapsible="icon" hideGap className={sidebarClasses}>
            <SidebarHeader className="p-1">
                <div className={sidebarHeaderClasses}>
                    <div className="flex items-center justify-center">
                        <Logo />
                    </div>
                    {!isCollapsed && <span className="text-xl font-bold">Keybard</span>}
                </div>
                <div className={cn("flex w-full", isCollapsed ? "justify-center" : "justify-center items-center")}>
                    <SidebarTrigger name="primary-nav" className="z-10" />
                    <span className={cn("mr-2 text-sm font-semibold text-slate-600 cursor-default", isCollapsed ? "hidden" : "block")}>Hide menu</span>
                </div>
            </SidebarHeader>

            <SidebarContent className="py-2">
                <SidebarMenu className="justify-center h-full">
                    {primarySidebarItems.map((item) => {
                        const isActive = activePanel === item.url;
                        const isPreviousPanel = panelToGoBack === item.url;
                        return (
                            <SidebarMenuItem key={item.title} className={`cursor-pointer`}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    sidebarName="primary-nav"
                                    sidebarDefaultOpen={false}
                                    className={cn(
                                        "h-12 transition-colors hover:bg-sidebar-accent font-semibold",
                                        (alternativeHeader ? isPreviousPanel : isActive) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-gray-400",
                                        isCollapsed ? "mx-0" : "mx-2"
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleItemSelect(item)}
                                        className="flex w-full items-center gap-3"
                                        aria-current={isActive ? "page" : undefined}
                                    >
                                        <item.icon className="h-10 w-10" />
                                        {!isCollapsed && <span>{item.title}</span>}
                                    </button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="px-2 py-4">
                <SidebarMenu>
                    {footerItems.map((item) => {
                        const isActive = activePanel === item.url;
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    sidebarName="primary-nav"
                                    sidebarDefaultOpen={false}
                                    className="h-12 transition-colors hover:bg-sidebar-accent"
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleItemSelect(item)}
                                        className={cn("flex w-full items-center", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground")}
                                    >
                                        <item.icon />
                                        {!isCollapsed && <span>{item.title}</span>}
                                    </button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;
