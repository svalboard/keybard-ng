import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { GripVerticalIcon, PencilIcon } from "lucide-react";
import { FC, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useKeyBinding } from "@/contexts/KeyBindingContext";
import { usePanels } from "@/contexts/PanelsContext";
import { cn } from "@/lib/utils";

interface Props {
    icon: React.ReactNode;
    editElement?: React.ReactNode;
    items?: Array<any>;
    bindingType: string;
    notBindable?: boolean;
}

interface ItemGroup<T> {
    label: string;
    items: Array<T>;
    startIndex: number;
    endIndex: number;
}

// suffixByType was here

const getKeyCode = (bindingType: string, index: number) => {
    if (bindingType === "tapdances") {
        return `TD(${index})`;
    } else if (bindingType === "macros") {
        return `M${index}`;
    }
    return "";
};

const BindingsList: FC<Props> = ({ editElement, icon, bindingType, notBindable, items = [] }) => {
    const { itemToEdit, setItemToEdit, setBindingTypeToEdit, setAlternativeHeader, setPanelToGoBack, setActivePanel } = usePanels();
    const itemsCount = items.length;
    const [groups, setGroups] = useState<ItemGroup<any>[]>([]);
    const [activeGroup, setActiveGroup] = useState<ItemGroup<any>>(groups[0] || null);
    const { assignKeycode } = useKeyBinding();
    if (itemsCount === 0) {
        return <div className="grid place-items-center h-full text-center text-sm text-muted-foreground px-6">No items available. Please add some first.</div>;
    }
    useEffect(() => {
        const groupSize = 20;
        const g: ItemGroup<any>[] = [];
        for (let i = 0; i < itemsCount; i += groupSize) {
            g.push({
                label: `${i} - ${Math.min(i + groupSize - 1, itemsCount - 1)}`,
                items: items.slice(i, i + groupSize),
                startIndex: i,
                endIndex: Math.min(i + groupSize - 1, itemsCount - 1),
            });
        }
        setGroups(g);
        setActiveGroup(g[0]);
    }, [items]);

    const renderedItems = useMemo(() => {
        if (!activeGroup) {
            return null;
        }

        const shouldUseDialog = Boolean(editElement);

        return activeGroup.items.map((_, localIndex) => {
            const absoluteIndex = localIndex + activeGroup.startIndex;
            const editButton = (
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                        setItemToEdit(absoluteIndex);
                        setBindingTypeToEdit(bindingType);
                        setAlternativeHeader(true);
                        setPanelToGoBack(bindingType);
                        setActivePanel("keyboard");
                    }}
                    className="h-8 w-8 rounded-full group-hover/item:opacity-100 opacity-0"
                >
                    <PencilIcon className="h-4 w-4" />
                </Button>
            );

            const editControl = shouldUseDialog ? <DialogTrigger asChild>{editButton}</DialogTrigger> : editButton;
            // const isActive = absoluteIndex === itemToEdit;

            return (
                <div className={cn("flex flex-row items-center justify-between p-3 gap-3 panel-layer-item group/item")} key={absoluteIndex}>
                    <div className="flex flex-row items-center">
                        <Button size="sm" variant="ghost" className="cursor-move group-hover/item:opacity-100 opacity-0">
                            <GripVerticalIcon className="h-4 w-4" />
                        </Button>
                        {absoluteIndex}
                    </div>
                    <span className="text-md text-left w-full border-b border-b-dashed py-2"></span>
                    <div className="flex flex-row flex-shrink-0 items-center gap-1">
                        <div
                            className={cn(
                                "flex flex-col bg-black h-12 w-12 rounded-sm flex-shrink-0 items-center cursor-default",
                                notBindable ? "" : "cursor-pointer border-2 hover:border-red-600 border-transparent transition-all"
                            )}
                            onClick={() => {
                                if (!notBindable) assignKeycode(getKeyCode(bindingType, absoluteIndex));
                            }}
                        >
                            <div className="h-4 w-4 mt-2 mb-1 text-white">{icon}</div>
                            <span className="text-xs text-white">{absoluteIndex}</span>
                        </div>

                        {editControl}
                    </div>
                </div>
            );
        });
    }, [activeGroup, editElement, icon, itemToEdit, setItemToEdit]);

    return (
        <section className="space-y-3 h-full max-h-full flex flex-col">
            <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center justify-between rounded-full p-1 gap-2 bg-muted/30">
                    {groups.map((group) => {
                        const isActive = group === activeGroup;
                        return (
                            <Button
                                key={group.label}
                                type="button"
                                size="sm"
                                variant={isActive ? "default" : "ghost"}
                                className={cn("px-8 py-1 text-md rounded-full", isActive ? "shadow" : "text-muted-foreground")}
                                onClick={() => setActiveGroup(group)}
                            >
                                {group.label}
                            </Button>
                        );
                    })}
                </div>
            </div>
            <div className=" flex flex-col overflow-auto flex-grow">
                {editElement ? (
                    <Dialog>
                        {renderedItems}
                        {editElement}
                    </Dialog>
                ) : (
                    renderedItems
                )}
            </div>
        </section>
    );
};

export default BindingsList;
