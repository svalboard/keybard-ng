import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VialService } from '../../src/services/vial.service';
import { createTestKeyboardInfo } from '../fixtures/keyboard-info.fixture';

// Mock the key service
vi.mock('../../src/services/key.service', () => ({
  keyService: {
    stringify: vi.fn((keycode: number) => `KC_${keycode.toString(16).toUpperCase()}`),
    parse: vi.fn((keystr: string) => parseInt(keystr.replace('KC_', ''), 16)),
    generateAllKeycodes: vi.fn()
  }
}));

// Mock xz-decompress
vi.mock('xz-decompress', () => ({
  XzReadableStream: vi.fn().mockImplementation(() => ({
    getReader: () => ({
      read: vi.fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('{"matrix":{"rows":4,"cols":12},"customKeycodes":[],"lighting":"none"}')
        })
        .mockResolvedValue({ done: true })
    })
  }))
}));

// Mock sval service
vi.mock('../../src/services/sval.service', () => ({
  svalService: {
    check: vi.fn(),
    pull: vi.fn(),
    setupCosmeticLayerNames: vi.fn()
  }
}));

// Mock kle service
vi.mock('../../src/services/kle.service', () => ({
  KleService: vi.fn().mockImplementation(() => ({
    deserializeToKeylayout: vi.fn()
  }))
}));

import { svalService } from '../../src/services/sval.service';

describe('VialService', () => {
  let vialService: VialService;
  let mockUSB: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create a comprehensive USB mock
    mockUSB = {
      send: vi.fn(),
      sendVial: vi.fn(),
      getViaBuffer: vi.fn(),
      getDynamicEntries: vi.fn(),
      open: vi.fn().mockResolvedValue(true),
      close: vi.fn().mockResolvedValue(undefined)
    };


    // Setup default mock responses
    mockUSB.send.mockImplementation((cmd: number, args: number[], options?: any) => {
      if (cmd === 0x01) { // VIA protocol version
        if (options?.unpack === 'B>H' && options?.index === 1) {
          return Promise.resolve(0x0C);
        }
        return Promise.resolve(new Uint8Array([0x01, 0x00, 0x0C]));
      }
      if (cmd === 0x11) { // Layer count
        if (options?.uint8 && options?.index === 1) {
          return Promise.resolve(4);
        }
        return Promise.resolve(new Uint8Array([0x11, 4]));
      }
      if (cmd === 0x0C) { // Macro count
        if (options?.uint8 && options?.index === 1) {
          return Promise.resolve(2);
        }
        return Promise.resolve(new Uint8Array([0x0C, 2]));
      }
      if (cmd === 0x0D) { // Macro buffer size
        if (options?.unpack === 'B>H' && options?.index === 1) {
          return Promise.resolve(256);
        }
        return Promise.resolve(new Uint8Array([0x0D, 0x01, 0x00]));
      }
      if (cmd === 0x02) { // Get keyboard value (for matrix polling)
        // Return matrix state data
        const response = new Uint8Array(32);
        response[0] = 0x02;
        response[1] = 0x03; // Matrix state type
        // Row 0: col 0 and 2 pressed
        response[2] = 0b00000101;
        // Row 1: no keys pressed
        response[3] = 0b00000000;
        return Promise.resolve(response);
      }
      if (cmd === 0x05) { // Set keycode
        return Promise.resolve(new Uint8Array([0x05]));
      }
      if (cmd === 0x12) { // Get keymap buffer
        // This should not be called directly, getViaBuffer handles it
        return Promise.resolve(new Uint8Array(32));
      }
      return Promise.resolve(new Uint8Array(32));
    });

    mockUSB.sendVial.mockImplementation((cmd: number, args: number[], options?: any) => {
      if (cmd === 0x00) { // Get keyboard ID
        if (options?.unpack === 'I<Q') {
          return Promise.resolve([6, BigInt('0x1234567890ABCDEF')]);
        }
        return Promise.resolve(new Uint8Array([0xFE, 0x00, 0x06, 0, 0, 0, 0xEF, 0xCD, 0xAB, 0x90, 0x78, 0x56, 0x34, 0x12]));
      }
      if (cmd === 0x01) { // Get size
        if (options?.uint32 && options?.index === 0) {
          return Promise.resolve(100); // Small payload for testing
        }
        return Promise.resolve(new Uint8Array([100, 0, 0, 0]));
      }
      if (cmd === 0x02) { // Get definition
        if (options?.uint8) {
          // Return mock compressed data
          const data = new Uint8Array(32);
          data[0] = 0xFD; // XZ magic bytes
          data[1] = 0x37;
          data[2] = 0x7A;
          data[3] = 0x58;
          data[4] = 0x5A;
          return Promise.resolve(data);
        }
        return Promise.resolve(new Uint8Array(32));
      }
      if (cmd === 0x0D) { // Dynamic entry op
        return Promise.resolve(new Uint8Array([0xFE, 0x0D]));
      }
      return Promise.resolve(new Uint8Array(32));
    });

    mockUSB.getViaBuffer.mockImplementation((cmd: number, size: number, options?: any) => {
      // Return mock keymap data
      if (options?.uint16) {
        // When uint16 is true, return array of numbers
        const data: number[] = [];
        for (let i = 0; i < size / 2; i++) {
          data.push(i);  // Return sequential keycodes as numbers
        }
        return Promise.resolve(data);
      } else {
        // Return Uint8Array for byte data
        const buffer = new Uint8Array(size);
        // Fill with sequential keycodes for testing
        for (let i = 0; i < size / 2; i++) {
          buffer[i * 2] = (i >> 8) & 0xFF; // Big endian high byte
          buffer[i * 2 + 1] = i & 0xFF;    // Big endian low byte
        }
        return Promise.resolve(buffer);
      }
    });

    mockUSB.getDynamicEntries.mockResolvedValue([]);

    vialService = new VialService(mockUSB);
  });

  describe('init', () => {
    it('should initialize without errors', async () => {
      const kbinfo = createTestKeyboardInfo();
      await expect(vialService.init(kbinfo)).resolves.toBeUndefined();
    });
  });

  describe('getKeyboardInfo', () => {
    it('should retrieve VIA protocol version', async () => {
      const kbinfo = createTestKeyboardInfo();
      await vialService.getKeyboardInfo(kbinfo);
      expect(kbinfo.via_proto).toBe(0x0C);
    });

    it('should retrieve Vial protocol version', async () => {
      const kbinfo = createTestKeyboardInfo();
      await vialService.getKeyboardInfo(kbinfo);
      expect(kbinfo.vial_proto).toBe(6);
    });

    it('should retrieve keyboard ID', async () => {
      const kbinfo = createTestKeyboardInfo();
      await vialService.getKeyboardInfo(kbinfo);
      // The bigint 0x1234567890ABCDEF is converted to decimal string
      expect(kbinfo.kbid).toBe('1311768467294899695');
    });

    it('should handle USB disconnection during info retrieval', async () => {
      const kbinfo = createTestKeyboardInfo();
      mockUSB.send.mockRejectedValue(new Error('USB disconnected'));
      await expect(vialService.getKeyboardInfo(kbinfo)).rejects.toThrow('USB disconnected');
    });

    it('should retrieve matrix size', async () => {
      const kbinfo = createTestKeyboardInfo();
      await vialService.getKeyboardInfo(kbinfo);
      expect(kbinfo.rows).toBe(4);
      expect(kbinfo.cols).toBe(12);
    });
  });

  describe('getFeatures', () => {
    it('should retrieve macro count and buffer size', async () => {
      const kbinfo = createTestKeyboardInfo();
      await vialService.getFeatures(kbinfo);
      expect(kbinfo.macro_count).toBe(2);
      expect(kbinfo.macros_size).toBe(256);
    });

    it('should handle keyboards with no macros', async () => {
      const kbinfo = createTestKeyboardInfo();
      mockUSB.send.mockImplementation((cmd: number, args: number[], options?: any) => {
        if (cmd === 0x0C) { // Macro count
          if (options?.uint8 && options?.index === 1) {
            return Promise.resolve(0);
          }
        }
        if (cmd === 0x0D) { // Macro buffer size
          if (options?.unpack === 'B>H' && options?.index === 1) {
            return Promise.resolve(0);
          }
        }
        return Promise.resolve(new Uint8Array(32));
      });

      await vialService.getFeatures(kbinfo);
      expect(kbinfo.macro_count).toBe(0);
      expect(kbinfo.macros_size).toBe(0);
    });
  });

  describe('getKeyMap', () => {
    it('should retrieve keymap for all layers', async () => {
      const kbinfo = createTestKeyboardInfo();
      kbinfo.rows = 2;
      kbinfo.cols = 2;

      await vialService.getKeyMap(kbinfo);

      expect(kbinfo.keymap).toHaveLength(4); // 4 layers
      expect(kbinfo.keymap?.[0]).toHaveLength(4); // 2x2 = 4 keys per layer
      expect(kbinfo.keymap?.[0][0]).toBe(0); // First key (numeric keycode)
    });

    it('should throw error if layer count is not available', async () => {
      const kbinfo = createTestKeyboardInfo();
      mockUSB.send.mockImplementation((cmd: number) => {
        if (cmd === 0x11) { // Layer count
          return Promise.resolve(undefined);
        }
        return Promise.resolve(new Uint8Array(32));
      });

      await expect(vialService.getKeyMap(kbinfo)).rejects.toThrow('Failed to get layer count');
    });

    it('should handle empty keymap', async () => {
      const kbinfo = createTestKeyboardInfo();
      kbinfo.rows = 0;
      kbinfo.cols = 0;
      mockUSB.send.mockImplementation((cmd: number, args: number[], options?: any) => {
        if (cmd === 0x11) { // Layer count
          if (options?.uint8 && options?.index === 1) {
            return Promise.resolve(1);
          }
        }
        return Promise.resolve(new Uint8Array(32));
      });

      await vialService.getKeyMap(kbinfo);

      expect(kbinfo.keymap).toHaveLength(1);
      expect(kbinfo.keymap?.[0]).toHaveLength(0);
    });

    it('should throw error if getViaBuffer returns non-array', async () => {
      const kbinfo = createTestKeyboardInfo();
      // Mock getViaBuffer to return something that is not an array (though typing says it should be)
      mockUSB.getViaBuffer.mockResolvedValue(new Uint8Array(0) as any);

      await expect(vialService.getKeyMap(kbinfo)).rejects.toThrow('Expected array of keycodes from getViaBuffer');
    });
  });

  describe('load', () => {
    it('should load complete keyboard information', async () => {
      const kbinfo = createTestKeyboardInfo();
      kbinfo.rows = 2;
      kbinfo.cols = 2;

      const result = await vialService.load(kbinfo);

      expect(result).toBe(kbinfo);
      expect(kbinfo.via_proto).toBe(0x0C);
      expect(kbinfo.vial_proto).toBe(6);
      expect(kbinfo.kbid).toBe('1311768467294899695');
      expect(kbinfo.macro_count).toBe(2);
      expect(kbinfo.keymap).toHaveLength(4);
    });

    it('should process kle payload if present', async () => {
      const kbinfo = createTestKeyboardInfo();
      kbinfo.payload = {
        layouts: {
          keymap: []
        },
        matrix: { rows: 2, cols: 2 },
        customKeycodes: []
      } as any;

      const mockDeserialize = vi.fn().mockReturnValue({});
      // Access the private kle service (since it's instantiated in constructor)
      // Note: Since we mocked the module, the instance method should be mockable via the prototype or if checking call
      // Better: we can mock implementation of the kle instance attached to vialService
      (vialService as any).kle.deserializeToKeylayout = mockDeserialize;

      // Mock getKeyboardInfo to prevent it from overwriting our payload
      vi.spyOn(vialService, 'getKeyboardInfo').mockResolvedValue(kbinfo);

      await vialService.load(kbinfo);
      expect(mockDeserialize).toHaveBeenCalled();
      expect((kbinfo as any).keylayout).toBeDefined();
    });

    it('should catch error during kle deserialization', async () => {
      const kbinfo = createTestKeyboardInfo();
      kbinfo.payload = {
        layouts: {
          keymap: []
        },
        matrix: { rows: 2, cols: 2 },
        customKeycodes: []
      } as any;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
      const mockDeserialize = vi.fn().mockImplementation(() => { throw new Error('KLE fail'); });
      (vialService as any).kle.deserializeToKeylayout = mockDeserialize;

      // Mock getKeyboardInfo to prevent it from overwriting our payload
      vi.spyOn(vialService, 'getKeyboardInfo').mockResolvedValue(kbinfo);

      await vialService.load(kbinfo);

      expect(mockDeserialize).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to deserialize keylayout:', expect.any(Error));
    });

    it('should detect WebHID support', () => {
      // Should be true by default due to setup.ts
      expect(VialService.isWebHIDSupported()).toBe(true);

      // Test false case by temporarily removing hid
      const originalHid = (global as any).navigator.hid;
      delete (global as any).navigator.hid;

      try {
        expect(VialService.isWebHIDSupported()).toBe(false);
      } finally {
        (global as any).navigator.hid = originalHid;
      }
    });

    it('should handle errors during load gracefully', async () => {
      const kbinfo = createTestKeyboardInfo();
      mockUSB.sendVial.mockRejectedValue(new Error('Load failed'));

      await expect(vialService.load(kbinfo)).rejects.toThrow('Load failed');
    });

    it('should detect and pull Svalboard features', async () => {
      const kbinfo = createTestKeyboardInfo();
      vi.mocked(svalService.check).mockResolvedValue(true);

      await vialService.load(kbinfo);

      expect(svalService.check).toHaveBeenCalledWith(kbinfo);
      expect(svalService.pull).toHaveBeenCalledWith(kbinfo);
    });
  });

  describe('pollMatrix', () => {
    it('should return matrix state as boolean array', async () => {
      const kbinfo = createTestKeyboardInfo();
      kbinfo.rows = 2;
      kbinfo.cols = 8;

      const matrix = await vialService.pollMatrix(kbinfo);

      expect(matrix).toHaveLength(2);
      expect(matrix[0]).toEqual([true, false, true, false, false, false, false, false]);
      expect(matrix[1]).toEqual([false, false, false, false, false, false, false, false]);
    });

    it('should handle larger matrices', async () => {
      const kbinfo = createTestKeyboardInfo();
      kbinfo.rows = 4;
      kbinfo.cols = 16;

      mockUSB.send.mockImplementation(() => {
        const response = new Uint8Array(32);
        response[0] = 0x02;
        response[1] = 0x03;
        // Each row needs 2 bytes for 16 columns
        response[2] = 0xFF; // Row 0, cols 0-7
        response[3] = 0x00; // Row 0, cols 8-15
        response[4] = 0x00; // Row 1, cols 0-7
        response[5] = 0xFF; // Row 1, cols 8-15
        response[6] = 0xAA; // Row 2, cols 0-7
        response[7] = 0x55; // Row 2, cols 8-15
        response[8] = 0x00; // Row 3, cols 0-7
        response[9] = 0x00; // Row 3, cols 8-15
        return Promise.resolve(response);
      });

      const matrix = await vialService.pollMatrix(kbinfo);

      expect(matrix).toHaveLength(4);
      expect(matrix[0][0]).toBe(true);  // First bit of 0xFF
      expect(matrix[1][8]).toBe(true);  // First bit of second byte (0xFF)
      expect(matrix[2][1]).toBe(true); // Second bit of 0xAA (10101010)
    });
  });

  describe('updateKey', () => {
    it('should update a key at specific position', async () => {
      await vialService.updateKey(0, 1, 2, 0x0004);

      expect(mockUSB.send).toHaveBeenCalledWith(
        0x05, // CMD_VIA_SET_KEYCODE
        [0, 1, 2, 0, 4] // layer, row, col, BE16(keymask)
      );
    });

    it('should encode keymask as big endian', async () => {
      await vialService.updateKey(2, 3, 7, 0x1234);

      expect(mockUSB.send).toHaveBeenCalledWith(
        0x05,
        [2, 3, 7, 0x12, 0x34] // 0x1234 in big endian
      );
    });

    it('should handle USB disconnection during update', async () => {
      mockUSB.send.mockRejectedValue(new Error('USB disconnected'));

      await expect(vialService.updateKey(0, 0, 0, 0x0004)).rejects.toThrow('USB disconnected');
    });
  });

  describe('USB disconnection scenarios', () => {
    it('should handle disconnection during keymap loading', async () => {
      const kbinfo = createTestKeyboardInfo();
      mockUSB.getViaBuffer.mockRejectedValue(new Error('USB disconnected'));

      await expect(vialService.getKeyMap(kbinfo)).rejects.toThrow('USB disconnected');
    });

    it('should handle permission denied errors', async () => {
      const kbinfo = createTestKeyboardInfo();
      mockUSB.send.mockRejectedValue(new DOMException('Permission denied'));

      await expect(vialService.getKeyboardInfo(kbinfo)).rejects.toThrow('Permission denied');
    });
  });

  describe('XZ decompression error handling', () => {
    it('should handle xz-decompress read error', async () => {
      // Create a separate mock for XzReadableStream that throws an error
      const { XzReadableStream } = await import('xz-decompress');
      const mockXzReadableStream = vi.mocked(XzReadableStream);

      // Mock to throw error during read
      mockXzReadableStream.mockImplementationOnce(() => ({
        getReader: () => ({
          read: vi.fn().mockRejectedValue(new Error('XZ decompression failed')),
          releaseLock: vi.fn(),
          closed: Promise.resolve(undefined),
          cancel: vi.fn().mockResolvedValue(undefined)
        })
      }) as any);

      const kbinfo = createTestKeyboardInfo();

      // Mock sendVial to return proper responses for getting keyboard info
      mockUSB.sendVial.mockImplementation((cmd: number, _args: number[], options?: any) => {
        if (cmd === 0x01) { // Get size
          if (options?.uint32 && options?.index === 0) {
            return Promise.resolve(100);
          }
        }
        if (cmd === 0x02) { // Get definition - this will trigger XZ decompression
          if (options?.uint8) {
            // Return XZ compressed data
            const data = new Uint8Array(32);
            data[0] = 0xFD; // XZ magic bytes
            data[1] = 0x37;
            data[2] = 0x7A;
            data[3] = 0x58;
            data[4] = 0x5A;
            return Promise.resolve(data);
          }
        }
        return Promise.resolve(new Uint8Array(32));
      });

      // The getKeyboardInfo method internally calls methods that use XZ decompression
      await expect(vialService.getKeyboardInfo(kbinfo)).rejects.toThrow('XZ decompression failed');
    });
  });

  describe('update methods', () => {
    it('should delegate updateMacros to macro service', async () => {
      const kbinfo = createTestKeyboardInfo();
      // Spy on the private macro service
      const spy = vi.spyOn((vialService as any).macro, 'push').mockResolvedValue(undefined);

      await vialService.updateMacros(kbinfo);
      expect(spy).toHaveBeenCalledWith(kbinfo);
    });

    it('should delegate updateTapdance to tapdance service', async () => {
      const kbinfo = createTestKeyboardInfo();
      const spy = vi.spyOn((vialService as any).tapdance, 'push').mockResolvedValue(undefined);

      await vialService.updateTapdance(kbinfo, 1);
      expect(spy).toHaveBeenCalledWith(kbinfo, 1);
    });

    it('should delegate updateCombo to combo service', async () => {
      const kbinfo = createTestKeyboardInfo();
      const spy = vi.spyOn((vialService as any).combo, 'push').mockResolvedValue(undefined);

      await vialService.updateCombo(kbinfo, 2);
      expect(spy).toHaveBeenCalledWith(kbinfo, 2);
    });

    it('should delegate updateKeyoverride to override service', async () => {
      const kbinfo = createTestKeyboardInfo();
      const spy = vi.spyOn((vialService as any).override, 'push').mockResolvedValue(undefined);

      await vialService.updateKeyoverride(kbinfo, 3);
      expect(spy).toHaveBeenCalledWith(kbinfo, 3);
    });

    it('should delegate updateQMKSetting to qmk service', async () => {
      const kbinfo = createTestKeyboardInfo();
      const spy = vi.spyOn((vialService as any).qmk, 'push').mockResolvedValue(undefined);

      await vialService.updateQMKSetting(kbinfo, 4);
      expect(spy).toHaveBeenCalledWith(kbinfo, 4);
    });
  });

  describe('isLayerEmpty', () => {
    it('should return true for empty layers (0, -1, 255)', () => {
      expect(vialService.isLayerEmpty([0, 0, 0])).toBe(true);
      expect(vialService.isLayerEmpty([-1, -1])).toBe(true);
      expect(vialService.isLayerEmpty([255, 255])).toBe(true);
      expect(vialService.isLayerEmpty([0, -1, 255])).toBe(true);
    });

    it('should return false if any key is defined', () => {
      expect(vialService.isLayerEmpty([0, 4, 0])).toBe(false);
      expect(vialService.isLayerEmpty([65, -1])).toBe(false);
    });

    it('should return true for empty array', () => {
      expect(vialService.isLayerEmpty([])).toBe(true);
    });
  });
});
