// Re-export the useChanges hook from the context for backward compatibility
export { useChanges } from "@/contexts/ChangesContext";
export type { PendingChange } from "@/services/changes.service";

import { useChanges } from "@/contexts/ChangesContext";

/**
 * Hook to check if a specific key has pending changes
 */
export const useKeyChanges = (layer: number, row: number, col: number) => {
    const { hasPendingChangeForKey, getPendingChangeForKey } = useChanges();

    const hasChanges = hasPendingChangeForKey(layer, row, col);
    const pendingChange = getPendingChangeForKey(layer, row, col);

    return {
        hasChanges,
        pendingChange,
    };
};

/**
 * Hook to track changes for a specific layer
 */
export const useLayerChanges = (layer: number) => {
    const { getChangesForLayer } = useChanges();
    return getChangesForLayer(layer);
};
