import type { KeyboardInfo } from "../types/vial.types";
import { keyService } from "./key.service";
import { VialUSB } from "./usb.service";

export class ComboService {
    constructor(private usb: VialUSB) {}

    async get(kbinfo: KeyboardInfo): Promise<void> {
        // Combos are stored in dynamic memory chunks. We do
        // KBINFO.combo_count queries. So this can take a bit of time.
        const all_entries = await this.usb.getDynamicEntries(
            VialUSB.DYNAMIC_VIAL_COMBO_GET,
            (kbinfo as any).combo_count!,
            { unpack: '<BHHHHH' }
        );

        (kbinfo as any).combos = [];
        all_entries.forEach((raw: any[], idx: number) => {
            (kbinfo as any).combos!.push([
                keyService.stringify(raw[1]),
                keyService.stringify(raw[2]),
                keyService.stringify(raw[3]),
                keyService.stringify(raw[4]),
                keyService.stringify(raw[5]),
            ]);
        });
    }

    async push(kbinfo: KeyboardInfo, cmbid: number): Promise<void> {
        const combo = (kbinfo as any).combos![cmbid];
        await this.usb.sendVial(VialUSB.CMD_VIAL_DYNAMIC_ENTRY_OP, [
            VialUSB.DYNAMIC_VIAL_COMBO_SET,
            cmbid,
            ...this.LE16(keyService.parse(combo[0])),
            ...this.LE16(keyService.parse(combo[1])),
            ...this.LE16(keyService.parse(combo[2])),
            ...this.LE16(keyService.parse(combo[3])),
            ...this.LE16(keyService.parse(combo[4])),
        ]);
    }

    private LE16(val: number): [number, number] {
        return [val & 0xFF, (val >> 8) & 0xFF];
    }
}
