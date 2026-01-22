import { keyService } from "./key.service";
import { KleService } from "./kle.service";
import { VialUSB, usbInstance } from "./usb.service";
import { LE32 } from "./utils";

import { XzReadableStream } from "xz-decompress";
import type { KeyboardInfo } from "../types/vial.types";
import { ComboService } from "./combo.service";
import { MacroService } from "./macro.service";
import { OverrideService } from "./override.service";
import { QMKService } from "./qmk.service";
import { svalService } from "./sval.service";
import { TapdanceService } from "./tapdance.service";

// XZ decompression helper
async function decompress(buffer: ArrayBuffer): Promise<string> {
    try {
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(new Uint8Array(buffer));
                controller.close();
            },
        });

        const xzStream = new XzReadableStream(stream);
        const reader = xzStream.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }

        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        const decoder = new TextDecoder();
        return decoder.decode(result);
    } catch (error) {
        console.error("XZ decompression failed:", error);
        console.error("Buffer size:", buffer.byteLength);
        console.error("Buffer preview:", new Uint8Array(buffer).slice(0, 32));
        throw error;
    }
}

export class VialService {
    private usb: VialUSB;
    private macro: MacroService;
    private tapdance: TapdanceService;
    private combo: ComboService;
    private override: OverrideService;
    private qmk: QMKService;
    private kle: KleService;

    constructor(usb: VialUSB) {
        this.usb = usb;
        this.macro = new MacroService(usb);
        this.tapdance = new TapdanceService(usb);
        this.combo = new ComboService(usb);
        this.override = new OverrideService(usb);
        this.qmk = new QMKService(usb);
        this.kle = new KleService();
    }

    static isWebHIDSupported(): boolean {
        return "hid" in navigator;
    }

    async init(_kbinfo: KeyboardInfo): Promise<void> {
        // Initialization hook for API setup
    }

    async load(kbinfo: KeyboardInfo): Promise<KeyboardInfo> {
        // Load keyboard information
        await this.getKeyboardInfo(kbinfo);

        // Register custom keycodes (SV_...) from the keyboard definition
        keyService.generateAllKeycodes(kbinfo);

        // Populate keylayout using KLE service if payload exists
        if (kbinfo.payload && kbinfo.payload.layouts && kbinfo.payload.layouts.keymap) {
            try {
                (kbinfo as any).keylayout = this.kle.deserializeToKeylayout(kbinfo, kbinfo.payload.layouts.keymap as unknown as any[]);
            } catch (e) {
                console.error("Failed to deserialize keylayout:", e);
            }
        }

        // Check for Svalboard-specific features
        const isSval = await svalService.check(kbinfo);
        // ...
        if (isSval) {
            console.log("Svalboard detected, proto:", kbinfo.sval_proto, "firmware:", kbinfo.sval_firmware);
            await svalService.pull(kbinfo);
        }

        // Set up default cosmetic layer names
        svalService.setupCosmeticLayerNames(kbinfo);

        // Load features (combos, macros, etc.)
        await this.getFeatures(kbinfo);

        // Get keymap for all layers
        await this.getKeyMap(kbinfo);
        await this.macro.get(kbinfo);
        await this.tapdance.get(kbinfo);
        await this.combo.get(kbinfo);
        await this.override.get(kbinfo);

        return kbinfo;
    }

    async getKeyboardInfo(kbinfo: KeyboardInfo): Promise<KeyboardInfo> {
        // VIA Protocol version
        kbinfo.via_proto = (await this.usb.send(VialUSB.CMD_VIA_GET_PROTOCOL_VERSION, [], {
            unpack: "B>H",
            index: 1,
        })) as number;

        // Vial protocol and Keyboard ID
        // Response validation: Reject stale echoes from other commands.
        // Accept if: (Not echo) OR (Echo of correct command)
        const vial_kbid = await this.usb.sendVial(VialUSB.CMD_VIAL_GET_KEYBOARD_ID, [], {
            unpack: "I<Q",
            validateInput: (u8) => u8[0] !== VialUSB.CMD_VIA_VIAL_PREFIX || u8[1] === VialUSB.CMD_VIAL_GET_KEYBOARD_ID
        });
        kbinfo.vial_proto = vial_kbid[0] as number;
        kbinfo.kbid = (vial_kbid[1] as bigint).toString();

        // Get compressed JSON payload size
        const sizeData = await this.usb.sendVial(VialUSB.CMD_VIAL_GET_SIZE, [], {
            uint8: true,
            validateInput: (u8) => u8[0] !== VialUSB.CMD_VIA_VIAL_PREFIX || u8[1] === VialUSB.CMD_VIAL_GET_SIZE
        });

        // Offset logic remains the same (check for echo to determine offset)
        let sizeOffset = 0;
        if ((sizeData[0] as number) === VialUSB.CMD_VIA_VIAL_PREFIX && (sizeData[1] as number) === VialUSB.CMD_VIAL_GET_SIZE) {
            sizeOffset = 2;
        }

        const dvSize = new DataView(sizeData.buffer);
        // Size is always Little Endian
        const payload_size = dvSize.getUint32(sizeOffset, true);

        // console.log("Payload Size:", payload_size, "Offset:", sizeOffset);

        if (payload_size > 50 * 1024 * 1024) { // Safety sanity check (50MB)
            throw new Error(`Invalid payload size: ${payload_size}`);
        }

        let block = 0;
        let sz = payload_size;
        const payload = new ArrayBuffer(payload_size);
        const pdv = new DataView(payload);
        let dstOffset = 0;

        let protocolDataOffset = 0; // Will be determined on first block

        while (sz > 0) {
            const data = await this.usb.sendVial(VialUSB.CMD_VIAL_GET_DEFINITION, [...LE32(block)], {
                uint8: true,
            });

            // On first block, detect offset using XZ Magic Bytes (FD 37 7A 58 5A 00)
            if (block === 0) {
                // Check for Echo (FE 02)
                if ((data[0] as number) === VialUSB.CMD_VIA_VIAL_PREFIX && (data[1] as number) === VialUSB.CMD_VIAL_GET_DEFINITION) {
                    // It *looks* like an echo, but verify against XZ magic if possible to be sure
                    // XZ Magic: FD 37 7A 58 5A 00
                    if (data[2] === 0xFD && data[3] === 0x37) {
                        protocolDataOffset = 2;
                    } else if (data[0] === 0xFD && data[1] === 0x37) {
                        protocolDataOffset = 0;
                    } else {
                        // Fallback heuristic: assume echo if we saw it earlier or strictly see pattern
                        protocolDataOffset = 2;
                    }
                } else {
                    protocolDataOffset = 0;
                }
            }
            const available = data.length - protocolDataOffset;
            const toCopy = Math.min(available, sz);

            for (let i = 0; i < toCopy; i++) {
                if (dstOffset < payload_size) {
                    pdv.setInt8(dstOffset, data[protocolDataOffset + i]);
                    dstOffset += 1;
                }
            }
            sz = sz - toCopy;
            block += 1;
        }

        // Decompress and parse JSON
        // Note: Original uses Int8Array spread, but we can pass buffer directly
        const decompressed = await decompress(payload);
        const payloadData = JSON.parse(decompressed);
        kbinfo.payload = payloadData;

        kbinfo.rows = payloadData.matrix.rows;
        kbinfo.cols = payloadData.matrix.cols;
        kbinfo.custom_keycodes = payloadData.customKeycodes;

        return kbinfo;
    }

    async getFeatures(kbinfo: KeyboardInfo): Promise<void> {
        // Get feature counts
        const counts = await this.usb.sendVial(VialUSB.CMD_VIAL_DYNAMIC_ENTRY_OP, [], {});

        const macro_count = await this.usb.send(VialUSB.CMD_VIA_MACRO_GET_COUNT, [], { uint8: true, index: 1 });

        const macros_size = (await this.usb.send(VialUSB.CMD_VIA_MACRO_GET_BUFFER_SIZE, [], {
            unpack: "B>H",
            index: 1,
        })) as number;

        // Store feature information in kbinfo
        kbinfo.tapdance_count = counts[0];
        kbinfo.combo_count = counts[1];
        kbinfo.key_override_count = counts[2];
        kbinfo.macro_count = macro_count;
        kbinfo.macros_size = macros_size;
    }

    async getKeyMap(kbinfo: KeyboardInfo): Promise<void> {
        kbinfo.layers = await this.usb.send(VialUSB.CMD_VIA_GET_LAYER_COUNT, [], {
            uint8: true,
            index: 1,
        });

        if (!kbinfo.layers) {
            throw new Error("Failed to get layer count");
        }

        const size = kbinfo.layers * kbinfo.rows * kbinfo.cols;

        // Get keymap data as uint16 array (big-endian converted to host endian)
        const alldata = await this.usb.getViaBuffer(VialUSB.CMD_VIA_KEYMAP_GET_BUFFER, size * 2, { uint16: true, slice: 2, bigendian: true, bytes: 2 });

        kbinfo.keymap = [];

        // alldata is now an array of uint16 values
        if (!Array.isArray(alldata)) {
            throw new Error("Expected array of keycodes from getViaBuffer");
        }

        for (let l = 0; l < kbinfo.layers; l++) {
            const layer: number[] = [];
            for (let r = 0; r < kbinfo.rows; r++) {
                for (let c = 0; c < kbinfo.cols; c++) {
                    const offset = l * kbinfo.rows * kbinfo.cols + r * kbinfo.cols + c;
                    const keycode = alldata[offset];
                    layer.push(keycode);
                    // console.log(`Layer ${l} [${r},${c}] = 0x${keycode.toString(16).padStart(4, '0')} "${keyService.stringify(keycode)}"`);
                }
            }
            kbinfo.keymap[l] = layer;
        }
    }

    async pollMatrix(kbinfo: KeyboardInfo): Promise<boolean[][]> {
        const data = await this.usb.send(VialUSB.CMD_VIA_GET_KEYBOARD_VALUE, [VialUSB.VIA_SWITCH_MATRIX_STATE], {}) as Uint8Array;
        const rowbytes = Math.ceil(kbinfo.cols / 8);

        // Debug polling
        // console.log("Poll data len:", data.length, "Rowbytes:", rowbytes, "Rows:", kbinfo.rows, "Cols:", kbinfo.cols);
        // console.log("Byte 0:", data[0], "Byte 1:", data[1]);

        // Determine offset: some firmwares echo the command (0x02 0x03), others might not? 
        // Standard VIA echoes. 
        let offset = 0;
        if (data[0] === VialUSB.CMD_VIA_GET_KEYBOARD_VALUE && data[1] === VialUSB.VIA_SWITCH_MATRIX_STATE) {
            offset = 2;
        }

        const kmpressed: boolean[][] = [];
        for (let row = 0; row < kbinfo.rows; row++) {
            const rowpressed: boolean[] = [];
            // Ensure we don't read past buffer
            if (offset + rowbytes > data.length) {
                break;
            }
            const coldata = data.slice(offset, offset + rowbytes);
            for (let col = 0; col < kbinfo.cols; col++) {
                const colbyte = Math.floor(col / 8);
                const colbit = 1 << (col % 8);

                // Safety check for colbyte
                if (colbyte < coldata.length) {
                    rowpressed.push((coldata[colbyte] & colbit) !== 0);
                } else {
                    rowpressed.push(false);
                }
            }
            offset += rowbytes;
            kmpressed.push(rowpressed);
        }
        return kmpressed;
    }

    // API methods for updating keyboard settings
    async updateKey(layer: number, row: number, col: number, keymask: number): Promise<void> {
        const BE16 = (num: number) => [(num >> 8) & 0xff, num & 0xff];
        await this.usb.send(VialUSB.CMD_VIA_SET_KEYCODE, [layer, row, col, ...BE16(keymask)], {});
    }
    async updateMacros(kbinfo: KeyboardInfo) {
        await this.macro.push(kbinfo);
    }
    async updateTapdance(kbinfo: KeyboardInfo, tdid: number) {
        await this.tapdance.push(kbinfo, tdid);
    }
    async updateCombo(kbinfo: KeyboardInfo, cmbid: number) {
        await this.combo.push(kbinfo, cmbid);
    }
    async updateKeyoverride(kbinfo: KeyboardInfo, koid: number) {
        await this.override.push(kbinfo, koid);
    }
    async updateQMKSetting(kbinfo: KeyboardInfo, qfield: number) {
        await this.qmk.push(kbinfo, qfield);
    }

    isLayerEmpty(layer: number[]): boolean {
        return layer.every((keycode) => keycode === 0 || keycode === -1 || keycode === 255);
    }
}

export const vialService = new VialService(usbInstance);
