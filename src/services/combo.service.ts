import type { KeyboardInfo } from "../types/vial.types";
import { keyService } from "./key.service";
import { VialUSB } from "./usb.service";

export class ComboService {
    constructor(private usb: VialUSB) { }

    async get(kbinfo: KeyboardInfo): Promise<void> {
        const combo_count = kbinfo.combo_count || 0;
        const all_entries = await this.usb.getDynamicEntries(
            VialUSB.DYNAMIC_VIAL_COMBO_GET,
            combo_count,
            { unpack: '<BHHHHH' }
        );

        kbinfo.combos = [];
        all_entries.forEach((raw: any[]) => {
            kbinfo.combos!.push({
                cmbid: raw[0],
                keys: [
                    keyService.stringify(raw[1]),
                    keyService.stringify(raw[2]),
                    keyService.stringify(raw[3]),
                    keyService.stringify(raw[4]),
                ].map(k => k === "KC_NO" ? "KC_NO" : k), // Keep all 4 slots
                output: keyService.stringify(raw[5]),
            });
        });
    }

    async push(kbinfo: KeyboardInfo, cmbid: number): Promise<void> {
        if (!kbinfo.combos) return;
        const combo = kbinfo.combos.find(c => c.cmbid === cmbid);
        if (!combo) return;

        const keys = [...combo.keys];
        while (keys.length < 4) keys.push("KC_NO");

        await this.usb.sendVial(VialUSB.CMD_VIAL_DYNAMIC_ENTRY_OP, [
            VialUSB.DYNAMIC_VIAL_COMBO_SET,
            cmbid,
            ...this.LE16(keyService.parse(keys[0])),
            ...this.LE16(keyService.parse(keys[1])),
            ...this.LE16(keyService.parse(keys[2])),
            ...this.LE16(keyService.parse(keys[3])),
            ...this.LE16(keyService.parse(combo.output)),
        ]);
    }

    private LE16(val: number): [number, number] {
        return [val & 0xFF, (val >> 8) & 0xFF];
    }
}
