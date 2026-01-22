import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Unplug, Zap } from "lucide-react";

interface ConnectButtonProps {
    connect: () => void;
    isConnected: boolean;
}

const ConnectButton = ({ connect, isConnected }: ConnectButtonProps) => (
    <SidebarMenuItem>
        <SidebarMenuButton asChild size="nav" className="text-slate-600 transition-colors h-auto">
            <button type="button" onClick={(e) => { e.stopPropagation(); connect(); }} className="flex items-center w-full justify-start group-data-[state=collapsed]:justify-center">
                <div className={cn("flex items-center justify-start shrink-0 rounded-full !w-full")}>
                    <div className={
                        cn("rounded-full p-2 w-full flex flex-row items-center justify-start group-data-[state=expanded]:gap-4 group-data-[state=expanded]:px-4 group-data-[state=expanded]:mx-4 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:mx-2 transition-all", isConnected ? "bg-green-100 hover:bg-green-200" : "bg-gray-100 hover:bg-gray-200")
                    }>
                        {isConnected ? <Zap className="h-4 w-4 shrink-0 fill-green-700 text-green-700" /> : <Unplug className="h-4 w-4 shrink-0" />}
                        <span className={cn("text-md font-medium truncate group-data-[state=collapsed]:hidden", isConnected ? "text-green-700" : "text-gray-700")}>{isConnected ? "Connected" : "Connect"}</span>
                    </div>
                </div>
            </button>
        </SidebarMenuButton>
    </SidebarMenuItem>
)

export { ConnectButton };
