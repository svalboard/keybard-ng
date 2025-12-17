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
                        const idx = r * newKb.cols + c; // Not used for index, but for grid logic
                        const val = newKb.keymap[l][idx] || 0; // Assuming flat array per layer OR 2D?
                        // keymap in KBINFO is type number[][] (layers -> flat array of keys) 
                        // Wait, looking at file.service.ts/vial.service.ts
                        // vial.service.ts: kbinfo.keymap[l] = layer (which is number[])
                        // So correct access is newKb.keymap[l][r * cols + c] or similar?
                        // Let's check vial.service.ts line 215: keycode = alldata[offset]; layer.push(keycode).
                        // It pushes in row-major order.
                        // So keymap[l] is an array of size rows*cols.
                        
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
        // Macros are tricky because we only have 'push' which pushes ALL macros.
        // We really should just check if ANY macro changed and push all if so.
        // Or if the service allows pushing single macro?
        // macro.service.ts has `push(kbinfo)` which dumps ALL macros.
        // So we just queue one big "Update Macros" task if macros differ.
        if (JSON.stringify(newKb.macros) !== JSON.stringify(currentKb.macros)) {
            await queue(
                "Update All Macros",
                async () => {
                    // We must update the CURRENT kbinfo object with new macros before pushing
                    // But wait, if we update 'currentKb' in place here, React might catch it?
                    // The 'cb' runs later. We should ensure 'currentKb' (which is the main state)
                    // has the new macros when this runs.
                    // Actually, the caller 'SettingsPanel' sets keyboard state *immediately* after calling sync.
                    // So when this queue callback runs, 'vialContext.keyboard' will already be 'newKb'.
                    // Wait, if we queue it, we pass 'newKb' to the update function?
                    // updateMacros takes (kbinfo).
                    await services.vialService.updateMacros(newKb);
                },
                { type: "macro" }
            );
        }

        // 3. Sync Combos
        // combos is a direct array of combo data
        // Check both combos and combos.entries just in case, but prefer array
        const newCombos = Array.isArray(newKb.combos) ? newKb.combos : newKb.combos?.entries;
        const currentCombos = Array.isArray(currentKb.combos) ? currentKb.combos : currentKb.combos?.entries;

        if (newCombos && currentCombos) {
            newCombos.forEach(async (combo: any, idx: number) => {
                const oldCombo = currentCombos[idx];
                if (JSON.stringify(combo) !== JSON.stringify(oldCombo)) {
                    await queue(
                        `Update Combo ${idx}`,
                        async () => {
                             await services.vialService.updateCombo(newKb, idx);
                        },
                        { type: "combo", comboId: idx }
                    );
                }
            });
        }

        // 4. Sync Tapdances
        // Handle both 'tapdance' and 'tapdances' property names
        // @ts-ignore
        const newTds = Array.isArray(newKb.tapdances) ? newKb.tapdances : (Array.isArray(newKb.tapdance) ? newKb.tapdance : (newKb.tapdance?.entries || newKb.tapdances?.entries));
        // @ts-ignore
        const oldTds = Array.isArray(currentKb.tapdances) ? currentKb.tapdances : (Array.isArray(currentKb.tapdance) ? currentKb.tapdance : (currentKb.tapdance?.entries || currentKb.tapdances?.entries));
        
        if (newTds && oldTds) {
            newTds.forEach(async (td: any, idx: number) => {
                const oldTd = oldTds[idx];
                if (JSON.stringify(td) !== JSON.stringify(oldTd)) {
                     await queue(
                        `Update Tapdance ${idx}`,
                        async () => {
                            await services.vialService.updateTapdance(newKb, idx);
                        },
                        { type: "tapdance", tapdanceId: idx }
                     );
                }
            });
        }

        // 5. Sync Key Overrides
        const newOverrides = Array.isArray(newKb.key_overrides) ? newKb.key_overrides : newKb.key_overrides?.entries;
        const currentOverrides = Array.isArray(currentKb.key_overrides) ? currentKb.key_overrides : currentKb.key_overrides?.entries;

        if (newOverrides && currentOverrides) {
            newOverrides.forEach(async (ko: any, idx: number) => {
                const oldKo = currentOverrides[idx];
                if (JSON.stringify(ko) !== JSON.stringify(oldKo)) {
                    await queue(
                        `Update Key Override ${idx}`,
                        async () => {
                            await services.vialService.updateKeyoverride(newKb, idx);
                        },
                        { type: "override" } 
                    );
                }
            });
        }

        // 6. Sync QMK Settings
        // qmk.service.ts: push(kbinfo, qsid)
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
                        { type: "key" } // Reuse key or add new type
                     );
                }
            });
        }
    }
}

export const importService = new ImportService();
