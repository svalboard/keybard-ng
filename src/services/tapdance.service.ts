import type { KeyboardInfo } from "../types/vial.types";
import { keyService } from "./key.service";
import { VialUSB } from "./usb.service";

export class TapdanceService {
    constructor(private usb: VialUSB) {}

    async get(kbinfo: KeyboardInfo): Promise<void> {
        // Tap dances are stored in dynamic memory chunks. We do
        // KBINFO.tapdance_count queries. So this can take a bit of time.
        const all_entries = await this.usb.getDynamicEntries(
            VialUSB.DYNAMIC_VIAL_TAP_DANCE_GET,
            (kbinfo as any).tapdance_count!,
            { unpack: '<BHHHHH' }
        );

        (kbinfo as any).tapdances = [];
        all_entries.forEach((raw: any[], idx: number) => {
            (kbinfo as any).tapdances!.push({
                tdid: idx,
                tap: keyService.stringify(raw[1]),
                hold: keyService.stringify(raw[2]),
                doubletap: keyService.stringify(raw[3]),
                taphold: keyService.stringify(raw[4]),
                tapms: raw[5],
            });
        });
    }

    async push(kbinfo: KeyboardInfo, tdid: number): Promise<void> {
        const tapdance = (kbinfo as any).tapdances![tdid];
        await this.usb.sendVial(VialUSB.CMD_VIAL_DYNAMIC_ENTRY_OP, [
            VialUSB.DYNAMIC_VIAL_TAP_DANCE_SET,
            tapdance.tdid,
            ...this.LE16(keyService.parse(tapdance.tap)),
            ...this.LE16(keyService.parse(tapdance.hold)),
            ...this.LE16(keyService.parse(tapdance.doubletap)),
            ...this.LE16(keyService.parse(tapdance.taphold)),
            ...this.LE16(tapdance.tapms),
        ]);
    }

    private LE16(val: number): [number, number] {
        return [val & 0xFF, (val >> 8) & 0xFF];
    }
}
