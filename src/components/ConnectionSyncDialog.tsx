import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConnectionSyncDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadFromKeyboard: () => void;
    onUpdateKeyboard: () => void;
}

export const ConnectionSyncDialog: React.FC<ConnectionSyncDialogProps> = ({
    isOpen,
    onClose,
    onLoadFromKeyboard,
    onUpdateKeyboard,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Keyboard is Connected</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-4">
                    <Button
                        variant="kb-primary"
                        onClick={() => {
                            onUpdateKeyboard();
                            onClose();
                        }}
                        className="w-full h-12 text-base font-semibold"
                    >
                        Update Keyboard With New Changes
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or</span>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onLoadFromKeyboard();
                            onClose();
                        }}
                        className="w-full h-12 text-base font-semibold"
                    >
                        Revert Changes Back to Keyboard's Layout
                    </Button>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
