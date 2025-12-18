import type { KeyboardInfo } from "../types/vial.types";
import { keyService } from "./key.service"; // Assuming you have KEY equivalent
import { VialUSB } from "./usb.service";

export class MacroService {
    private readonly MACRO_IDS = {
        1: "tap",
        tap: 1,
        2: "down",
        down: 2,
        3: "up",
        up: 3,
    } as const;

    private readonly MACRO_DELAY = 4;

    private readonly MACRO_DOUBLES = {
        5: "tap",
        tap: 5,
        6: "down",
        down: 6,
        7: "up",
        up: 7,
    } as const;

    private readonly QMK_EXT_ID = 1;

    constructor(private usb: VialUSB) {}

    async get(kbinfo: KeyboardInfo): Promise<void> {
        function checkComplete(data: any) {
            return data.filter((x: any) => x === 0).length >= kbinfo.macro_count!;
        }
        // Macros are stored as one big chunk of memory, at 28 bytes per fetch.
        // null-separated. In svalboard, it's 795 bytes.
        const macro_memory = await this.usb.getViaBuffer(VialUSB.CMD_VIA_MACRO_GET_BUFFER, kbinfo.macros_size || 0, { slice: 4, uint8: true, bytes: 1 }, checkComplete);

        const raw_macros = this.split(kbinfo, macro_memory);
        kbinfo.macros = raw_macros.map((macro, mid) => this.parse(kbinfo, mid, macro)) as any;
    }

    async push(kbinfo: KeyboardInfo): Promise<void> {
        const raw = this.dump(kbinfo.macros_size!, kbinfo.macros! as any);
        const rawview = new Uint8Array(raw);
        let i;
        let count = 0;
        for (i = 0; i < kbinfo.macros_size! && count <= kbinfo.macro_count!; i++) {
            if (rawview[i] === 0) {
                count++;
            }
        }
        const size = i;
        await this.usb.pushViaBuffer(VialUSB.CMD_VIA_MACRO_SET_BUFFER, size, raw);
    }

    split(kbinfo: KeyboardInfo, rawbuffer: number[] | Uint8Array): (number[] | Uint8Array)[] {
        let offset = 0;
        const macros: (number[] | Uint8Array)[] = [];
        let macronum = 0;
        while (macronum < kbinfo.macro_count! && offset < rawbuffer.length) {
            const start = offset;
            while (rawbuffer[offset] != 0) offset++;
            macros.push(rawbuffer.slice(start, offset));
            macronum++;
            offset++;
        }
        return macros;
    }

    parse(kbinfo: KeyboardInfo, mid: number, rawmacro: number[] | Uint8Array): any {
        const actions: any[] = [];
        let offset = 0;
        let curoffset = 0;

        while (offset < rawmacro.length) {
            if (rawmacro[offset] === this.QMK_EXT_ID) {
                const type = rawmacro[offset + 1];
                if (type in this.MACRO_IDS) {
                    actions.push([this.MACRO_IDS[type as keyof typeof this.MACRO_IDS], keyService.stringify(rawmacro[offset + 2])]);
                    offset += 3;
                } else if (type === this.MACRO_DELAY) {
                    actions.push(["delay", rawmacro[offset + 2] - 1 + (rawmacro[offset + 3] - 1) * 255]);
                    offset += 4;
                } else if (type in this.MACRO_DOUBLES) {
                    actions.push([this.MACRO_DOUBLES[type as keyof typeof this.MACRO_DOUBLES], keyService.stringify(rawmacro[offset + 2] + (rawmacro[offset + 3] << 8))]);
                    offset += 4;
                }
            } else if (rawmacro[offset] === 0) {
                return {
                    mid: mid,
                    actions: actions,
                };
            } else {
                const start = offset;
                while (offset < rawmacro.length && rawmacro[offset] > 4) offset++;
                const newbuffer = new Uint8Array(rawmacro.slice(start, offset));
                const dv = new DataView(newbuffer.buffer);
                const decoder = new TextDecoder();
                actions.push(["text", decoder.decode(dv)]);
            }
            if (curoffset === offset) {
                break;
            }
            curoffset = offset;
        }
        return {
            mid: mid,
            actions: actions,
        };
    }

    dump(size: number, macros: any[]): ArrayBuffer {
        const buffer = new ArrayBuffer(size);
        const dv = new DataView(buffer);
        let offset = 0;

        for (let mid = 0; mid < macros.length; mid++) {
            const macro = macros[mid];
            for (const action of macro.actions) {
                if (action[0] === "text") {
                    const encoder = new TextEncoder();
                    const textbuffer = new Uint8Array(encoder.encode(action[1]));
                    for (let idx = 0; idx < textbuffer.length; idx++) {
                        dv.setUint8(offset++, textbuffer[idx]);
                    }
                } else if (action[0] === "delay") {
                    dv.setUint8(offset++, this.QMK_EXT_ID);
                    dv.setUint8(offset++, this.MACRO_DELAY);
                    dv.setUint8(offset++, (action[1] % 255) + 1);
                    dv.setUint8(offset++, Math.floor(action[1] / 255) + 1);
                } else if (action[0] in this.MACRO_IDS) {
                    const value = keyService.parse(action[1]);
                    dv.setUint8(offset++, this.QMK_EXT_ID);
                    if (value >= 0x100) {
                        dv.setUint8(offset++, this.MACRO_DOUBLES[action[0] as keyof typeof this.MACRO_DOUBLES] as number);
                        dv.setUint8(offset++, value & 0xff);
                        dv.setUint8(offset++, (value >> 8) & 0xff);
                    } else {
                        dv.setUint8(offset++, this.MACRO_IDS[action[0] as keyof typeof this.MACRO_IDS] as number);
                        dv.setUint8(offset++, value);
                    }
                }
            }
            dv.setUint8(offset++, 0);
        }
        return buffer;
    }
}
