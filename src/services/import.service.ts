import { KeyboardInfo } from "../types/vial.types";
import { PendingChange } from "./changes.service";
import { keyService } from "./key.service";

export class ImportService {
    async syncWithKeyboard(
        newKb: KeyboardInfo,
        currentKb: KeyboardInfo,
        queue: (desc: string, cb: () => Promise<void>, metadata?: Partial<PendingChange>) => Promise<void>,
        services: any
    ): Promise<void> {
        if (!currentKb) return;

        console.log("Syncing imported keyboard...", newKb);

        // 1. Sync Keymap
        if (newKb.keymap && currentKb.keymap) {
            for (let l = 0; l < (newKb?.layers || 0); l++) {
                if (!newKb.keymap[l]) continue;
                for (let r = 0; r < newKb.rows; r++) {
                    for (let c = 0; c < newKb.cols; c++) {
                        const keyIndex = (r * newKb.cols) + c;
                        const newVal = newKb.keymap[l][keyIndex];
                        const oldVal = currentKb.keymap?.[l]?.[keyIndex];

                        if (newVal !== undefined && newVal !== oldVal) {
                            const keyLabel = keyService.stringify(newVal);
                            await queue(
                                `Update key L${l} R${r} C${c} to ${keyLabel}`,
                                async () => {
                                    await services.vialService.updateKey(l, r, c, newVal);
                                },
                                {
                                    type: "key",
                                    layer: l,
                                    row: r,
                                    col: c,
                                    keycode: newVal,
                                    previousValue: oldVal
                                }
                            );
                        }
                    }
                }
            }
        }

        // 2. Sync Macros
        // We use the NEW macros content, but the CURRENT board's size limits.
        if (JSON.stringify(newKb.macros) !== JSON.stringify(currentKb.macros)) {
            await queue(
                "Update All Macros",
                async () => {
                    // Create a hybrid object for the update call
                    const macroUpdateInfo = {
                        ...newKb,
                        // CRITICAL: Use the connected board's memory limits
                        macros_size: currentKb.macros_size,
                        macro_count: currentKb.macro_count
                    };
                    await services.vialService.updateMacros(macroUpdateInfo);
                },
                { type: "macro" }
            );
        }

        // 3. Sync Combos
        const newCombos = newKb.combos;
        const currentCombos = currentKb.combos;

        if (newCombos && currentCombos) {
            // Only iterate up to the board's supported count
            const maxCombos = currentKb.combo_count || 0;
            newCombos.slice(0, maxCombos).forEach(async (combo: any, idx: number) => {
                const oldCombo = currentCombos[idx];
                if (JSON.stringify(combo) !== JSON.stringify(oldCombo)) {
                    await queue(
                        `Update Combo ${idx}`,
                        async () => {
                            // Ensure the update uses the proper index and object
                            // updateCombo typically reads from the passed kbinfo at index `idx`
                            // So we need to ensure 'newKb' has the combo at that index.
                            // Since we are iterating newCombos, it should be there.
                            if (idx < maxCombos) {
                                // CRITICAL: Ensure the combo has the correct ID
                                combo.cmbid = idx;
                                await services.vialService.updateCombo(newKb, idx);
                            }
                        },
                        { type: "combo", comboId: idx }
                    );
                }
            });
        }

        // 4. Sync Tapdances
        const newTds = newKb.tapdances;
        const oldTds = currentKb.tapdances;

        if (newTds && oldTds) {
             const maxTd = currentKb.tapdance_count || 0;
             newTds.slice(0, maxTd).forEach(async (td: any, idx: number) => {
                const oldTd = oldTds[idx];
                if (JSON.stringify(td) !== JSON.stringify(oldTd)) {
                    await queue(
                        `Update Tapdance ${idx}`,
                        async () => {
                             if (idx < maxTd) {
                                // CRITICAL: Ensure the tapdance has the correct ID
                                td.idx = idx;
                                await services.vialService.updateTapdance(newKb, idx);
                             }
                        },
                        { type: "tapdance", tapdanceId: idx }
                    );
                }
            });
        }

        // 5. Sync Key Overrides
        const newOverrides = newKb.key_overrides;
        const currentOverrides = currentKb.key_overrides;

        if (newOverrides && currentOverrides) {
             const maxKo = currentKb.key_override_count || 0;
             newOverrides.slice(0, maxKo).forEach(async (ko: any, idx: number) => {
                const oldKo = currentOverrides[idx];
                if (JSON.stringify(ko) !== JSON.stringify(oldKo)) {
                    await queue(
                        `Update Key Override ${idx}`,
                        async () => {
                             if (idx < maxKo) {
                                // CRITICAL: Ensure the override has the correct ID
                                ko.koid = idx;
                                await services.vialService.updateKeyoverride(newKb, idx);
                             }
                        },
                        { type: "override" }
                    );
                }
            });
        }

        // 6. Sync QMK Settings
        if (newKb.settings && currentKb.settings) {
            Object.keys(newKb.settings).forEach(async (key) => {
                const qsid = parseInt(key);
                const newVal = newKb.settings![qsid];
                const oldVal = currentKb.settings![qsid];

                if (newVal !== oldVal) {
                    await queue(
                        `Update QMK Setting ${qsid}`,
                        async () => {
                            await services.vialService.updateQMKSetting(newKb, qsid);
                        },
                        { type: "settings", settingId: qsid } 
                    );
                }
            });
        }
    }
}

export const importService = new ImportService();
