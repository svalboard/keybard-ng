import Logo from "@/components/Logo";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarLogoProps {
    toggleSidebar: () => void;
    isCollapsed: boolean;
    open: boolean;
    activePanel?: string | null;
    setActivePanel: (panel: string | null) => void;
    handleCloseDetails: () => void;
}

const SidebarLogo = ({ toggleSidebar, isCollapsed, open, activePanel, setActivePanel, handleCloseDetails }: SidebarLogoProps) => (
    <SidebarMenuItem>
        <SidebarMenuButton asChild size="nav" className="transition-colors">
            <button
                type="button"
                className="flex w-full items-center justify-center group-data-[state=expanded]:justify-center "
                onClick={(e) => {
                    e.stopPropagation();

                    const isPanelOpen = open;
                    const isMatrixTesterActive = activePanel === "matrixtester";

                    handleCloseDetails();
                    if (isMatrixTesterActive) {
                        setActivePanel(null);
                    }

                    if (!isCollapsed) {
                        toggleSidebar();
                    } else if (!isPanelOpen && !isMatrixTesterActive) {
                        toggleSidebar();
                    }
                }}
            >
                <div className={cn("h-4 flex items-center justify-center shrink-0")}>
                    <Logo />
                </div>
                <span className="text-[22px] font-semibold truncate group-data-[state=collapsed]:hidden">keybard</span>
            </button>
        </SidebarMenuButton>
    </SidebarMenuItem>
    )

export default SidebarLogo;