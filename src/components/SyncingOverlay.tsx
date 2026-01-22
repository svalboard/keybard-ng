import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import React from "react";

interface SyncingOverlayProps {
    isOpen: boolean;
}

export const SyncingOverlay: React.FC<SyncingOverlayProps> = ({ isOpen }) => {
    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent 
                className="sm:max-w-[425px] flex flex-col items-center justify-center p-12"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                showCloseButton={false}
            >
                <DialogHeader className="hidden">
                    <DialogTitle>Syncing with Keyboard</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-6">
                    <Loader2 className="h-12 w-12 animate-spin text-kb-primary" />
                    <div className="space-y-2 text-center">
                        <h2 className="text-xl font-bold tracking-tight">Syncing with Keyboard</h2>
                        <p className="text-muted-foreground text-sm">
                            Fetching layout and configuration. Please don't disconnect.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
