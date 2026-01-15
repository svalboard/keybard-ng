// USB HID communication layer for Vial protocol
import type { USBSendOptions } from "../types/vial.types";
import { BE16, LE16, MSG_LEN } from "./utils";

export class VialUSB {
  // Via+Vial command constants
  static readonly CMD_VIA_GET_PROTOCOL_VERSION = 0x01;
  static readonly CMD_VIA_GET_KEYBOARD_VALUE = 0x02;
  static readonly CMD_VIA_SET_KEYBOARD_VALUE = 0x03;
  static readonly CMD_VIA_GET_KEYCODE = 0x04;
  static readonly CMD_VIA_SET_KEYCODE = 0x05;
  static readonly CMD_VIA_LIGHTING_SET_VALUE = 0x07;
  static readonly CMD_VIA_LIGHTING_GET_VALUE = 0x08;
  static readonly CMD_VIA_LIGHTING_SAVE = 0x09;
  static readonly CMD_VIA_MACRO_GET_COUNT = 0x0c;
  static readonly CMD_VIA_MACRO_GET_BUFFER_SIZE = 0x0d;
  static readonly CMD_VIA_MACRO_GET_BUFFER = 0x0e;
  static readonly CMD_VIA_MACRO_SET_BUFFER = 0x0f;
  static readonly CMD_VIA_GET_LAYER_COUNT = 0x11;
  static readonly CMD_VIA_KEYMAP_GET_BUFFER = 0x12;
  static readonly CMD_VIA_VIAL_PREFIX = 0xfe;

  static readonly VIA_LAYOUT_OPTIONS = 0x02;
  static readonly VIA_SWITCH_MATRIX_STATE = 0x03;

  static readonly QMK_BACKLIGHT_BRIGHTNESS = 0x09;
  static readonly QMK_BACKLIGHT_EFFECT = 0x0a;
  static readonly QMK_RGBLIGHT_BRIGHTNESS = 0x80;
  static readonly QMK_RGBLIGHT_EFFECT = 0x81;
  static readonly QMK_RGBLIGHT_EFFECT_SPEED = 0x82;
  static readonly QMK_RGBLIGHT_COLOR = 0x83;

  static readonly VIALRGB_GET_INFO = 0x40;
  static readonly VIALRGB_GET_MODE = 0x41;
  static readonly VIALRGB_GET_SUPPORTED = 0x42;
  static readonly VIALRGB_SET_MODE = 0x41;

  static readonly CMD_VIAL_GET_KEYBOARD_ID = 0x00;
  static readonly CMD_VIAL_GET_SIZE = 0x01;
  static readonly CMD_VIAL_GET_DEFINITION = 0x02;
  static readonly CMD_VIAL_GET_ENCODER = 0x03;
  static readonly CMD_VIAL_SET_ENCODER = 0x04;
  static readonly CMD_VIAL_GET_UNLOCK_STATUS = 0x05;
  static readonly CMD_VIAL_UNLOCK_START = 0x06;
  static readonly CMD_VIAL_UNLOCK_POLL = 0x07;
  static readonly CMD_VIAL_LOCK = 0x08;
  static readonly CMD_VIAL_QMK_SETTINGS_QUERY = 0x09;
  static readonly CMD_VIAL_QMK_SETTINGS_GET = 0x0a;
  static readonly CMD_VIAL_QMK_SETTINGS_SET = 0x0b;
  static readonly CMD_VIAL_QMK_SETTINGS_RESET = 0x0c;
  static readonly CMD_VIAL_DYNAMIC_ENTRY_OP = 0x0d;

  static readonly DYNAMIC_VIAL_GET_NUMBER_OF_ENTRIES = 0x00;
  static readonly DYNAMIC_VIAL_TAP_DANCE_GET = 0x01;
  static readonly DYNAMIC_VIAL_TAP_DANCE_SET = 0x02;
  static readonly DYNAMIC_VIAL_COMBO_GET = 0x03;
  static readonly DYNAMIC_VIAL_COMBO_SET = 0x04;
  static readonly DYNAMIC_VIAL_KEY_OVERRIDE_GET = 0x05;
  static readonly DYNAMIC_VIAL_KEY_OVERRIDE_SET = 0x06;

  static readonly SVAL_GET_LEFT_DPI = 0x00;
  static readonly SVAL_GET_RIGHT_DPI = 0x00;
  static readonly SVAL_GET_LEFT_SCROLL = 0x00;
  static readonly SVAL_GET_RIGHT_SCROLL = 0x00;
  static readonly SVAL_GET_AUTOMOUSE = 0x00;
  static readonly SVAL_GET_AUTOMOUSE_MS = 0x00;

  static readonly SVAL_SET_LEFT_DPI = 0x00;
  static readonly SVAL_SET_RIGHT_DPI = 0x00;
  static readonly SVAL_SET_LEFT_SCROLL = 0x00;
  static readonly SVAL_SET_RIGHT_SCROLL = 0x00;
  static readonly SVAL_SET_AUTOMOUSE = 0x00;
  static readonly SVAL_SET_AUTOMOUSE_MS = 0x00;

  private device?: HIDDevice;
  private queue: Promise<void> = Promise.resolve();
  private listener: (data: ArrayBuffer, ev: HIDInputReportEvent) => void =
    () => { };

  public onDisconnect?: () => void;

  private handleDisconnect = (event: HIDConnectionEvent) => {
    if (this.device && event.device === this.device) {
      console.log("Device disconnected:", event.device.productName);
      if (this.onDisconnect) this.onDisconnect();
      this.close();
    }
  };

  async open(filters: HIDDeviceFilter[]): Promise<boolean> {
    const devices = await navigator.hid.requestDevice({ filters });
    if (devices.length !== 1) return false;

    this.device = devices[0];
    if (!this.device.opened) {
      await this.device.open();
    }
    await this.initListener();
    navigator.hid.addEventListener("disconnect", this.handleDisconnect);
    return true;
  }

  getDeviceName(): string | null {
    return this.device?.productName || null;
  }

  async close(): Promise<void> {
    if (this.device) {
      if (this.handleEvent) {
        this.device.removeEventListener("inputreport", this.handleEvent);
        this.handleEvent = undefined;
      }
      await this.device.close();
      this.device = undefined;
    }
    navigator.hid.removeEventListener("disconnect", this.handleDisconnect);
  }

  private handleEvent?: (ev: HIDInputReportEvent) => void;

  private async initListener(): Promise<void> {
    if (!this.device) return;
    const handleEvent = (ev: HIDInputReportEvent) => {
      if (this.listener) {
        const buffer = ev.data.buffer as ArrayBuffer;
        this.listener(buffer, ev);
      }
    };
    this.handleEvent = handleEvent;
    this.device.addEventListener("inputreport", handleEvent);
  }

  // Overload signatures for send()
  async send(cmd: number, args: number[], options: USBSendOptions & { unpack: string; index: number }): Promise<number | bigint>;
  async send(cmd: number, args: number[], options: USBSendOptions & { unpack: string; index?: undefined }): Promise<(number | bigint)[]>;
  async send(cmd: number, args: number[], options: USBSendOptions & { uint8: true; index: number }): Promise<number>;
  async send(cmd: number, args: number[], options: USBSendOptions & { uint8: true; index?: undefined }): Promise<Uint8Array>;
  async send(cmd: number, args: number[], options: USBSendOptions & { uint16: true; index: number }): Promise<number>;
  async send(cmd: number, args: number[], options: USBSendOptions & { uint16: true; index?: undefined }): Promise<Uint16Array>;
  async send(cmd: number, args: number[], options: USBSendOptions & { uint32: true; index: number }): Promise<number>;
  async send(cmd: number, args: number[], options: USBSendOptions & { uint32: true; index?: undefined }): Promise<Uint32Array>;
  async send(cmd: number, args: number[], options?: USBSendOptions): Promise<Uint8Array>;

  // Implementation


  async send(
    cmd: number,
    args: number[],
    options: USBSendOptions = {}
  ): Promise<Uint8Array | Uint16Array | Uint32Array | number | bigint | (number | bigint)[]> {
    if (!this.device) throw new Error("USB device not connected");

    const message = new Uint8Array(MSG_LEN);
    message[0] = cmd;
    for (let i = 0; i < args.length; i++) {
      message[i + 1] = args[i];
    }

    // Queue the operations to prevent listener collision using a simple mutex pattern
    const operation = this.queue.then(async () => {
      return new Promise<Uint8Array | Uint16Array | Uint32Array | number | bigint | (number | bigint)[]>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          console.warn("USB Command Timed out waiting for valid response:", cmd);
          reject(new Error("USB Command Timeout"));
        }, 1000);

        this.listener = (data: ArrayBuffer) => {
          const u8 = new Uint8Array(data);
          // Validation: Only filter out explicit mismatches if validation is provided
          if (options.validateInput) {
            if (!options.validateInput(u8)) {
              return;
            }
          }

          clearTimeout(timeoutId);
          try {
            const result = this.parseResponse(data, options);
            resolve(result);
          } catch (e) {
            reject(e);
          }
        };

        this.device!.sendReport(0, message).catch(err => {
          clearTimeout(timeoutId);
          reject(err);
        });
      });
    });

    // Advance queue, handling errors so queue doesn't get stuck
    this.queue = operation.then(() => undefined).catch(() => undefined);

    return operation;
  }

  // Overload signatures for sendVial()
  async sendVial(cmd: number, args: number[], options: USBSendOptions & { unpack: string; index: number }): Promise<number | bigint>;
  async sendVial(cmd: number, args: number[], options: USBSendOptions & { unpack: string; index?: undefined }): Promise<(number | bigint)[]>;
  async sendVial(cmd: number, args: number[], options: USBSendOptions & { uint8: true; index: number }): Promise<number>;
  async sendVial(cmd: number, args: number[], options: USBSendOptions & { uint8: true; index?: undefined }): Promise<Uint8Array>;
  async sendVial(cmd: number, args: number[], options: USBSendOptions & { uint16: true; index: number }): Promise<number>;
  async sendVial(cmd: number, args: number[], options: USBSendOptions & { uint16: true; index?: undefined }): Promise<Uint16Array>;
  async sendVial(cmd: number, args: number[], options: USBSendOptions & { uint32: true; index: number }): Promise<number>;
  async sendVial(cmd: number, args: number[], options: USBSendOptions & { uint32: true; index?: undefined }): Promise<Uint32Array>;
  async sendVial(cmd: number, args: number[], options?: USBSendOptions): Promise<Uint8Array>;

  // Implementation
  async sendVial(
    cmd: number,
    args: number[],
    options: USBSendOptions = {}
  ): Promise<Uint8Array | Uint16Array | Uint32Array | number | bigint | (number | bigint)[]> {
    return this.send(VialUSB.CMD_VIA_VIAL_PREFIX, [cmd, ...args], options);
  }

  // Overload signatures for type safety
  private parseResponse(data: ArrayBuffer, options: USBSendOptions & { unpack: string; index: number }): number | bigint;
  private parseResponse(data: ArrayBuffer, options: USBSendOptions & { unpack: string; index?: undefined }): (number | bigint)[];
  private parseResponse(data: ArrayBuffer, options: USBSendOptions & { uint8: true; index: number }): number;
  private parseResponse(data: ArrayBuffer, options: USBSendOptions & { uint8: true; index?: undefined }): Uint8Array;
  private parseResponse(data: ArrayBuffer, options: USBSendOptions & { uint16: true; index: number }): number;
  private parseResponse(data: ArrayBuffer, options: USBSendOptions & { uint16: true; index?: undefined }): Uint16Array;
  private parseResponse(data: ArrayBuffer, options: USBSendOptions & { uint32: true; index: number }): number;
  private parseResponse(data: ArrayBuffer, options: USBSendOptions & { uint32: true; index?: undefined }): Uint32Array;
  private parseResponse(data: ArrayBuffer, options: USBSendOptions): Uint8Array;

  // Implementation signature
  private parseResponse(data: ArrayBuffer, options: USBSendOptions): Uint8Array | Uint16Array | Uint32Array | number | bigint | (number | bigint)[] {
    const dv = new DataView(data);
    const u8 = new Uint8Array(data);

    if (options.unpack) {
      const unpacked = this.unpackData(dv, options.unpack);
      // If index is specified, return just that element
      if (options.index !== undefined) {
        return unpacked[options.index];
      }
      return unpacked;
    }

    if (options.uint8) {
      // If index is specified, return single byte; otherwise return full array
      if (options.index !== undefined) {
        return u8[options.index];
      }
      return u8;
    }

    if (options.uint16) {
      // If index is specified, return single uint16; otherwise return array
      if (options.index !== undefined) {
        return dv.getUint16(options.index, !options.bigendian);
      }
      // Create uint16 array
      let u16Array = new Uint16Array(data);

      // Convert from big-endian to little-endian if needed
      if (options.bigendian) {
        // Swap bytes for each uint16
        u16Array = u16Array.map(num => ((num >> 8) & 0xFF) | ((num << 8) & 0xFF00));
      }

      // Apply slice if specified
      if (options.slice !== undefined) {
        u16Array = u16Array.slice(options.slice);
      }

      return u16Array;
    }

    if (options.uint32) {
      // If index is specified, return single uint32; otherwise return array
      if (options.index !== undefined) {
        return dv.getUint32(options.index, !options.bigendian);
      }
      // Return array of uint32 values
      const u32Array = new Uint32Array(data);
      return u32Array;
    }

    return u8;
  }

  private unpackData(dv: DataView, format: string): (number | bigint)[] {
    const results: (number | bigint)[] = [];
    let offset = 0;
    let littleEndian = true;

    if (format.includes("<")) littleEndian = true;
    if (format.includes(">")) littleEndian = false;

    const formatChars = format.replace(/[<>]/g, "");

    for (const char of formatChars) {
      switch (char) {
        case "B": // unsigned byte
          results.push(dv.getUint8(offset));
          offset += 1;
          break;
        case "H": // unsigned short
          results.push(dv.getUint16(offset, littleEndian));
          offset += 2;
          break;
        case "I": // unsigned int
          results.push(dv.getUint32(offset, littleEndian));
          offset += 4;
          break;
        case "Q": // unsigned long long
          results.push(dv.getBigUint64(offset, littleEndian));
          offset += 8;
          break;
      }
    }

    return results;
  }

  async getViaBuffer(
    cmd: number,
    size: number,
    options: USBSendOptions = {},
    checkComplete?: (data: number[] | Uint8Array) => boolean
  ): Promise<number[] | Uint8Array> {
    const chunksize = 28;
    const bytes = options.bytes || 1;
    const alldata: number[] = [];
    let offset = 0;

    while (offset < size) {
      let sz = chunksize;
      if (sz > size - offset) {
        sz = size - offset;
      }

      // Send command with big-endian offset
      const args = [...BE16(offset), sz];
      // Cast the result of this.send to Uint8Array because we expect byte data here.
      // The `options` passed to `send` here don't specify `unpack`, `uint16`, or `uint32`,
      // so the default return type from the `send` implementation is `Uint8Array`.
      const data = await this.send(cmd, args, options) as Uint8Array;

      // If we got less than requested, slice the data
      if (sz < chunksize) {
        const sliceSize = Math.floor(sz / bytes);
        // `data` is now guaranteed to be Uint8Array due to the cast
        alldata.push(...Array.from(data).slice(0, sliceSize));
      } else {
        if (Array.isArray(data)) {
          alldata.push(...data);
        } else {
          alldata.push(...Array.from(data));
        }
      }

      if (checkComplete && checkComplete(alldata)) {
        break;
      }

      offset += chunksize;
    }

    // If uint16 was requested, the data is already processed by send()
    // Just return the array as-is
    if (options.uint16) {
      return alldata;
    }

    // Otherwise return as Uint8Array for backward compatibility
    return new Uint8Array(alldata);
  }

  async pushViaBuffer(
    cmd: number,
    size: number,
    data: ArrayBuffer
  ): Promise<void> {
    const buffer = new Uint8Array(data);
    let offset = 0;
    let chunkOffset = 0;

    while (offset < size) {
      const chunk = new Uint8Array(MSG_LEN - 4);
      for (let i = 0; i < chunk.length && offset < size; i++) {
        chunk[i] = buffer[offset++];
      }

      await this.send(cmd, [...LE16(chunkOffset), ...chunk], {});
      chunkOffset += chunk.length;
    }
  }

  // Overload signatures for getDynamicEntries()
  async getDynamicEntries(dynamicCmd: number, count: number, options: USBSendOptions & { unpack: string; index: number }): Promise<(number | bigint)[]>;
  async getDynamicEntries(dynamicCmd: number, count: number, options: USBSendOptions & { unpack: string; index?: undefined }): Promise<(number | bigint)[][]>;
  async getDynamicEntries(dynamicCmd: number, count: number, options: USBSendOptions & { uint8: true; index: number }): Promise<number[]>;
  async getDynamicEntries(dynamicCmd: number, count: number, options: USBSendOptions & { uint8: true; index?: undefined }): Promise<Uint8Array[]>;
  async getDynamicEntries(dynamicCmd: number, count: number, options: USBSendOptions & { uint16: true; index: number }): Promise<number[]>;
  async getDynamicEntries(dynamicCmd: number, count: number, options: USBSendOptions & { uint16: true; index?: undefined }): Promise<Uint16Array[]>;
  async getDynamicEntries(dynamicCmd: number, count: number, options: USBSendOptions & { uint32: true; index: number }): Promise<number[]>;
  async getDynamicEntries(dynamicCmd: number, count: number, options: USBSendOptions & { uint32: true; index?: undefined }): Promise<Uint32Array[]>;
  async getDynamicEntries(dynamicCmd: number, count: number, options?: USBSendOptions): Promise<Uint8Array[]>;

  // Implementation
  async getDynamicEntries(
    dynamicCmd: number,
    count: number,
    options: USBSendOptions = {}
  ): Promise<(Uint8Array | Uint16Array | Uint32Array | number | bigint | (number | bigint)[])[]> {
    const entries: (Uint8Array | Uint16Array | Uint32Array | number | bigint | (number | bigint)[])[] = [];
    for (let i = 0; i < count; i++) {
      const data = await this.sendVial(
        VialUSB.CMD_VIAL_DYNAMIC_ENTRY_OP,
        [dynamicCmd, i],
        options
      );
      entries.push(data);
    }
    return entries;
  }
}

export const usbInstance = new VialUSB();
