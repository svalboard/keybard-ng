import { PendingChange, changesUtils } from "@/services/changes.service";
import React, { ReactNode, createContext, useCallback, useContext, useState } from "react";

interface ChangesContextType {
    todo: Record<string, PendingChange>;
    isInstant: boolean;
    setInstant: (instant: boolean) => void;
    queue: (desc: string, cb: () => Promise<void>, metadata?: Partial<PendingChange>) => Promise<void>;
    clear: (desc: string) => void;
    commit: () => Promise<void>;
    clearAll: () => void;
    // Helper functions
    getPendingChanges: () => PendingChange[];
    getPendingCount: () => number;
    getChangesForLayer: (layer: number) => PendingChange[];
    getChangesByType: (type: PendingChange["type"]) => PendingChange[];
    hasPendingChangeForKey: (layer: number, row: number, col: number) => boolean;
    getPendingChangeForKey: (layer: number, row: number, col: number) => PendingChange | null;
}

const ChangesContext = createContext<ChangesContextType | undefined>(undefined);

interface ChangesProviderProps {
    children: ReactNode;
}

export const ChangesProvider: React.FC<ChangesProviderProps> = ({ children }) => {
    const [todo, setTodo] = useState<Record<string, PendingChange>>({});
    const [isInstant, setInstant] = useState(true);

    const queue = useCallback(
        async (desc: string, cb: () => Promise<void>, metadata?: Partial<PendingChange>) => {
            const change = await changesUtils.processChange(desc, cb, metadata || {}, isInstant);

            if (change) {
                // Only add to queue if not instant
                setTodo((prev) => ({
                    ...prev,
                    [desc]: change,
                }));
            }
        },
        [isInstant]
    );

    const clear = useCallback((desc: string) => {
        setTodo((prev) => {
            const newTodo = { ...prev };
            delete newTodo[desc];
            return newTodo;
        });
    }, []);

    const commit = useCallback(async () => {
        await changesUtils.commitChanges(todo);
        setTodo({}); // Clear all changes after commit
    }, [todo]);

    const clearAll = useCallback(() => {
        setTodo({});
    }, []);

    // Helper functions using the current todo state
    const getPendingChanges = useCallback(() => Object.values(todo), [todo]);
    const getPendingCount = useCallback(() => Object.keys(todo).length, [todo]);
    const getChangesForLayer = useCallback((layer: number) => changesUtils.getChangesForLayer(todo, layer), [todo]);
    const getChangesByType = useCallback((type: PendingChange["type"]) => changesUtils.getChangesByType(todo, type), [todo]);
    const hasPendingChangeForKey = useCallback((layer: number, row: number, col: number) => changesUtils.hasPendingChangeForKey(todo, layer, row, col), [todo]);
    const getPendingChangeForKey = useCallback((layer: number, row: number, col: number) => changesUtils.getPendingChangeForKey(todo, layer, row, col), [todo]);

    const value: ChangesContextType = {
        todo,
        isInstant,
        setInstant,
        queue,
        clear,
        commit,
        clearAll,
        getPendingChanges,
        getPendingCount,
        getChangesForLayer,
        getChangesByType,
        hasPendingChangeForKey,
        getPendingChangeForKey,
    };

    return <ChangesContext.Provider value={value}>{children}</ChangesContext.Provider>;
};

export const useChanges = (): ChangesContextType => {
    const context = useContext(ChangesContext);
    if (!context) {
        throw new Error("useChanges must be used within a ChangesProvider");
    }
    return context;
};
