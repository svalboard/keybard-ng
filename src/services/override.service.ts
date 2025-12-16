import type { KeyboardInfo } from "../types/vial.types";
import { keyService } from "./key.service";
import { VialUSB } from "./usb";

export class OverrideService {
    constructor(private usb: VialUSB) {}

    async get(kbinfo: KeyboardInfo): Promise<void> {
        // Key overrides are stored in dynamic memory chunks. We do
        // KBINFO.key_override_count queries. So this can take a bit of time.
        const all_entries = await this.usb.getDynamicEntries(
            VialUSB.DYNAMIC_VIAL_KEY_OVERRIDE_GET,
            (kbinfo as any).key_override_count!,
            { unpack: '<BHHHBBBB' }
        );

        (kbinfo as any).key_overrides = [];

        all_entries.forEach((raw: any[], idx: number) => {
            (kbinfo as any).key_overrides!.push({
                koid: idx,
                trigger: keyService.stringify(raw[1]),
                replacement: keyService.stringify(raw[2]),
                layers: raw[3],
                trigger_mods: raw[4],
                negative_mod_mask: raw[5],
                suppressed_mods: raw[6],
                options: raw[7],
            });
        });
    }

    async push(kbinfo: KeyboardInfo, koid: number): Promise<void> {
        const ko = (kbinfo as any).key_overrides![koid];

        await this.usb.sendVial(VialUSB.CMD_VIAL_DYNAMIC_ENTRY_OP, [
            VialUSB.DYNAMIC_VIAL_KEY_OVERRIDE_SET,
            koid,
            ...this.LE16(keyService.parse(ko.trigger)),
            ...this.LE16(keyService.parse(ko.replacement)),
            ...this.LE16(ko.layers),
            ko.trigger_mods,
            ko.negative_mod_mask,
            ko.suppressed_mods,
            ko.options,
        ]);
    }

    private LE16(val: number): [number, number] {
        return [val & 0xFF, (val >> 8) & 0xFF];
    }
}
