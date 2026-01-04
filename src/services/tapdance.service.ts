import type { KeyboardInfo } from "../types/vial.types";
import { keyService } from "./key.service";
import { VialUSB } from "./usb.service";

export class TapdanceService {
    constructor(private usb: VialUSB) { }

    async get(kbinfo: KeyboardInfo): Promise<void> {
        const tapdance_count = kbinfo.tapdance_count || 0;
        const all_entries = (await this.usb.getDynamicEntries(
            VialUSB.DYNAMIC_VIAL_TAP_DANCE_GET,
            tapdance_count,
            { unpack: "HHHHB" }
        )) as any[][];

        kbinfo.tapdances = [];
        all_entries.forEach((raw: any[], idx: number) => {
            kbinfo.tapdances!.push({
                idx: idx,
                tap: keyService.stringify(raw[0]),
                hold: keyService.stringify(raw[1]),
                doubletap: keyService.stringify(raw[2]),
                taphold: keyService.stringify(raw[3]),
                tapping_term: raw[4],
            });
        });
    }

    async push(kbinfo: KeyboardInfo): Promise<void> {
        if (!kbinfo.tapdances) return;
        for (const td of kbinfo.tapdances) {
            await this.usb.sendVial(VialUSB.CMD_VIAL_DYNAMIC_ENTRY_OP, [
                VialUSB.DYNAMIC_VIAL_TAP_DANCE_SET,
                td.idx,
                ...this.LE16(keyService.parse(td.tap)),
                ...this.LE16(keyService.parse(td.hold)),
                ...this.LE16(keyService.parse(td.doubletap)),
                ...this.LE16(keyService.parse(td.taphold)),
                td.tapping_term,
            ]);
        }
    }

    private LE16(val: number): [number, number] {
        return [val & 0xFF, (val >> 8) & 0xFF];
    }
}
