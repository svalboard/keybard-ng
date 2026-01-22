
export interface HardwareSettingHandler {
    get: () => Promise<number | boolean>;
    set: (value: number | boolean) => Promise<void>;
}

export const HARDWARE_SETTINGS_REGISTRY: Record<string, HardwareSettingHandler> = {
    "left-dpi": {
        get: async () => {
            // return await usbInstance.send(VialUSB.SVAL_GET_LEFT_DPI, [], { uint16: true, index: 0 });
            return 1000;
        },
        set: async (value: number | boolean) => {
            // await usbInstance.send(VialUSB.SVAL_SET_LEFT_DPI, split16(Number(value)));
            console.log("Setting left dpi to", value);
        }
    },
    "right-dpi": {
        get: async () => {
            // return await usbInstance.send(VialUSB.SVAL_GET_RIGHT_DPI, [], { uint16: true, index: 0 });
            return 1000;
        },
        set: async (value) => {
            // await usbInstance.send(VialUSB.SVAL_SET_RIGHT_DPI, split16(Number(value)));
            console.log("Setting right dpi to", value);
        }
    },
    "scroll-left": {
        get: async () => {
            // const val = await usbInstance.send(VialUSB.SVAL_GET_LEFT_SCROLL, [], { uint8: true, index: 0 });
            // return val === 1; // Assuming 1 is true
            return true;
        },
        set: async (value) => {
            // await usbInstance.send(VialUSB.SVAL_SET_LEFT_SCROLL, [value ? 1 : 0]);
            console.log("Setting scroll left to", value);
        }
    },
    "scroll-right": {
        get: async () => {
            // const val = await usbInstance.send(VialUSB.SVAL_GET_RIGHT_SCROLL, [], { uint8: true, index: 0 });
            // return val === 1;
            return true;
        },
        set: async (value) => {
            // await usbInstance.send(VialUSB.SVAL_SET_RIGHT_SCROLL, [value ? 1 : 0]);
            console.log("Setting scroll right to", value);
        }
    },
    "auto-mouse": {
        get: async () => {
            // const val = await usbInstance.send(VialUSB.SVAL_GET_AUTOMOUSE, [], { uint8: true, index: 0 });
            // return val === 1;
            return true;
        },
        set: async (value) => {
            // await usbInstance.send(VialUSB.SVAL_SET_AUTOMOUSE, [value ? 1 : 0]);
            console.log("Setting auto mouse to", value);
        }
    },
    "auto-mouse-timeout": {
        get: async () => {
            // return await usbInstance.send(VialUSB.SVAL_GET_AUTOMOUSE_MS, [], { uint16: true, index: 0 });
            return 1000;
        },
        set: async (value) => {
            // await usbInstance.send(VialUSB.SVAL_SET_AUTOMOUSE_MS, split16(Number(value)));
            console.log("Setting auto mouse timeout to", value);
        }
    }
};

// function split16(num: number): number[] {
//     return [num & 0xFF, (num >> 8) & 0xFF];
// }
