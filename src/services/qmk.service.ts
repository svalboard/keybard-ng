// QMK Settings service - fetching, parsing, and pushing QMK settings
import { QMK_SETTINGS } from '../constants/qmk-settings';
import type { KeyboardInfo } from '../types/vial.types';
import { VialUSB, usbInstance } from './usb.service';
import { LE16, LE32 } from './utils';

/**
 * QMK Settings are structured as:
 * - JSON file defines QSIDs (QMK Setting IDs) starting from 1
 * - Each QSID has a width: 1 (byte), 2 (uint16), or 4 (uint32)
 * - We fetch each setting by its QSID individually
 * - First byte returned is the QSID echo (ignored)
 */
export class QMKService {
  private usb: VialUSB;

  constructor(usb: VialUSB) {
    this.usb = usb;
  }

  async get(kbinfo: KeyboardInfo): Promise<void> {
    // Get array of QSIDs that the keyboard supports
    // Response format: [1, 2, 3, 4, 5, 6, 7, ... 20, 21, 0xFFFF, 0xFFFF]
    const supported: Record<number, boolean> = {};

    let offset = 0;
    let query = true;

    while (query) {
      const data = await this.usb.sendVial(
        VialUSB.CMD_VIAL_QMK_SETTINGS_QUERY,
        [offset],
        { uint16: true }
      );

      // data should be a Uint16Array
      const dataArray = Array.isArray(data) ? data : Array.from(data);

      for (const val of dataArray) {
        if (val === 0xffff) {
          query = false;
          break;
        }
        supported[val] = true;
      }
      offset += 16;
    }

    // Parse out the widths for each QSID value
    // No width = B (byte). Width 2 = H (short). Width 4 = I (int).
    const qsidUnpacks: Record<number, string> = {};
    for (const tab of QMK_SETTINGS.tabs) {
      for (const field of tab.fields) {
        if (field.width === 2) {
          qsidUnpacks[field.qsid] = 'H';
        } else if (field.width === 4) {
          qsidUnpacks[field.qsid] = 'I';
        } else {
          qsidUnpacks[field.qsid] = 'B';
        }
      }
    }

    // Fetch each supported setting
    const settings: Record<number, number> = {};
    for (const qsid of Object.keys(qsidUnpacks)) {
      const qsidNum = parseInt(qsid);
      if (!supported[qsidNum]) continue;

      // Don't forget the ignored byte
      const unpack = 'B' + qsidUnpacks[qsidNum];
      const val = await this.usb.sendVial(
        VialUSB.CMD_VIAL_QMK_SETTINGS_GET,
        [qsidNum],
        { unpack }
      );
      settings[qsidNum] = val[1] as number;
    }

    kbinfo.settings = settings;
  }

  async push(kbinfo: KeyboardInfo, qsid: number): Promise<void> {
    if (!kbinfo.settings) {
      throw new Error('No settings available to push');
    }

    const val = kbinfo.settings[qsid];
    const vals = LE32(val);
    console.log('Pushing QMK setting:', qsid, vals);
    await this.usb.sendVial(VialUSB.CMD_VIAL_QMK_SETTINGS_SET, [...LE16(qsid), ...vals]);
  }
}

export const qmkService = new QMKService(usbInstance);
