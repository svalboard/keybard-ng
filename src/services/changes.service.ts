export interface PendingChange {
    desc: string;
    cb: () => Promise<void>;
    timestamp: number;
    // Metadata for UI display and tracking
    type: "key" | "macro" | "combo" | "tapdance" | "override" | "layer_color";
    layer?: number;
    row?: number;
    col?: number;
    keycode?: number;
    comboId?: number;
    comboSlot?: number;
    tapdanceId?: number;
    tapdanceSlot?: "tap" | "hold" | "doubletap" | "taphold";
    layerColor?: string; // For layer_color changes - store the new color name
    previousValue?: number | string;
}

// Simple utility functions for the changes queue - no class or listeners needed
export const changesUtils = {
    /**
     * Execute a change immediately or return it for queueing
     */
    async processChange(desc: string, cb: () => Promise<void>, metadata: Partial<PendingChange>, instant: boolean): Promise<PendingChange | null> {
        if (instant) {
            await cb();
            return null; // No need to queue
        } else {
            return {
                desc,
                cb,
                timestamp: Date.now(),
                type: metadata?.type || "key",
                ...metadata,
            };
        }
    },

    /**
     * Commit all pending changes
     */
    async commitChanges(todo: Record<string, PendingChange>): Promise<void> {
        for (const [, change] of Object.entries(todo)) {
            if (change && change.cb) {
                await change.cb();
            }
        }
    },

    /**
     * Helper functions for querying changes
     */
    getChangesForLayer(todo: Record<string, PendingChange>, layer: number): PendingChange[] {
        return Object.values(todo).filter((change) => change.layer === layer);
    },

    getChangesByType(todo: Record<string, PendingChange>, type: PendingChange["type"]): PendingChange[] {
        return Object.values(todo).filter((change) => change.type === type);
    },

    hasPendingChangeForKey(todo: Record<string, PendingChange>, layer: number, row: number, col: number): boolean {
        return Object.values(todo).some((change) => change.type === "key" && change.layer === layer && change.row === row && change.col === col);
    },

    getPendingChangeForKey(todo: Record<string, PendingChange>, layer: number, row: number, col: number): PendingChange | null {
        return Object.values(todo).find((change) => change.type === "key" && change.layer === layer && change.row === row && change.col === col) || null;
    },
};
