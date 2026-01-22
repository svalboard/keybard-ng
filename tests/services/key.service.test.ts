import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KeyService } from '../../src/services/key.service';
import { CODEMAP, KEYMAP, KEYALIASES } from '../../src/constants/keygen';
import {
  typicalSvalboardInfo,
  createTestKeyboardInfo,
  minimalKeyboardInfo
} from '../fixtures/keyboard-info.fixture';
import type { KeyboardInfo } from '../../src/types/vial.types';
import type { KeyString } from '../../src/types/keymap';

// Mock the constants module
vi.mock('../../src/constants/keygen', () => {
  const mockKeymap: any = {
    // Basic keys
    'KC_NO': { code: 0x00, qmkid: 'KC_NO', str: '', title: 'None' },
    'KC_A': { code: 0x04, qmkid: 'KC_A', str: 'A', title: 'A' },
    'KC_B': { code: 0x05, qmkid: 'KC_B', str: 'B', title: 'B' },
    'KC_C': { code: 0x06, qmkid: 'KC_C', str: 'C', title: 'C' },
    'KC_D': { code: 0x07, qmkid: 'KC_D', str: 'D', title: 'D' },
    'KC_Q': { code: 0x14, qmkid: 'KC_Q', str: 'Q', title: 'Q' },
    'KC_R': { code: 0x15, qmkid: 'KC_R', str: 'R', title: 'R' },
    'KC_S': { code: 0x16, qmkid: 'KC_S', str: 'S', title: 'S' },
    'KC_T': { code: 0x17, qmkid: 'KC_T', str: 'T', title: 'T' },
    'KC_1': { code: 0x1e, qmkid: 'KC_1', str: '1', title: '1' },
    'KC_SPC': { code: 0x2c, qmkid: 'KC_SPC', str: 'Space', title: 'Space' },
    'KC_SPACE': { code: 0x2c, qmkid: 'KC_SPACE', str: 'Space', title: 'Space' },
    'KC_ENT': { code: 0x28, qmkid: 'KC_ENT', str: 'Enter', title: 'Enter' },
    'KC_ENTER': { code: 0x28, qmkid: 'KC_ENTER', str: 'Enter', title: 'Enter' },

    // Modifiers
    'KC_LSFT': { code: 0xe1, qmkid: 'KC_LSFT', str: 'LShift', title: 'Left Shift' },
    'KC_LCTL': { code: 0xe0, qmkid: 'KC_LCTL', str: 'LCtrl', title: 'Left Control' },
    'KC_LALT': { code: 0xe2, qmkid: 'KC_LALT', str: 'LAlt', title: 'Left Alt' },
    'KC_LGUI': { code: 0xe3, qmkid: 'KC_LGUI', str: 'LGui', title: 'Left GUI' },

    // Modifier masks
    'LCTL(kc)': { code: 0x0100, qmkid: 'LCTL(kc)', str: 'LCtrl+', title: 'Left Control +' },
    'LSFT(kc)': { code: 0x0200, qmkid: 'LSFT(kc)', str: 'LShift+', title: 'Left Shift +' },
    'LALT(kc)': { code: 0x0400, qmkid: 'LALT(kc)', str: 'LAlt+', title: 'Left Alt +' },
    'LGUI(kc)': { code: 0x0800, qmkid: 'LGUI(kc)', str: 'LGui+', title: 'Left GUI +' },

    // Layer keys (pre-initialized for testing)
    'MO(0)': { code: 0x5100, qmkid: 'MO(0)', str: 'MO(0)', title: 'Momentary Layer 0' },
    'MO(1)': { code: 0x5101, qmkid: 'MO(1)', str: 'MO(1)', title: 'Momentary Layer 1' },
    'TO(0)': { code: 0x5200, qmkid: 'TO(0)', str: 'TO(0)', title: 'To Layer 0' },
    'TO(1)': { code: 0x5201, qmkid: 'TO(1)', str: 'TO(1)', title: 'To Layer 1' },
    'TG(0)': { code: 0x5300, qmkid: 'TG(0)', str: 'TG(0)', title: 'Toggle Layer 0' },
    'TG(1)': { code: 0x5301, qmkid: 'TG(1)', str: 'TG(1)', title: 'Toggle Layer 1' },
    'DF(0)': { code: 0x5400, qmkid: 'DF(0)', str: 'DF(0)', title: 'Default Layer 0' },
    'TT(0)': { code: 0x5500, qmkid: 'TT(0)', str: 'TT(0)', title: 'Tap Toggle Layer 0' },
    'OSL(0)': { code: 0x5600, qmkid: 'OSL(0)', str: 'OSL(0)', title: 'One Shot Layer 0' },

    // Macro keys (pre-initialized)
    'M0': { code: 0x7700, qmkid: 'M0', str: 'M0', title: 'Macro 0' },
    'M1': { code: 0x7701, qmkid: 'M1', str: 'M1', title: 'Macro 1' },
    'M10': { code: 0x770a, qmkid: 'M10', str: 'M10', title: 'Macro 10' },

    // Tap dance (pre-initialized)
    'TD(0)': { code: 0x7b00, qmkid: 'TD(0)', str: 'TD(0)', title: 'Tap Dance 0' },
    'TD(1)': { code: 0x7b01, qmkid: 'TD(1)', str: 'TD(1)', title: 'Tap Dance 1' },

    // User keys
    'USER00': { code: 0x7e00, qmkid: 'USER00', str: 'U00', title: 'User 00' },
    'USER01': { code: 0x7e01, qmkid: 'USER01', str: 'U01', title: 'User 01' },
    'USER02': { code: 0x7e02, qmkid: 'USER02', str: 'U02', title: 'User 02' },
  };

  // Initialize missing entries for generateAllKeycodes testing
  for (let i = 0; i < 64; i++) {
    const userkey = 'USER' + ('' + i).padStart(2, '0');
    if (!mockKeymap[userkey]) {
      mockKeymap[userkey] = { code: 0x7e00 + i, qmkid: userkey, str: `U${i}`, title: `User ${i}` };
    }
  }

  for (let i = 0; i < 127; i++) {
    const key = 'M' + i;
    if (!mockKeymap[key]) {
      mockKeymap[key] = { code: 0x7700 + i, qmkid: key, str: key, title: `Macro ${i}` };
    }
  }

  for (let i = 0; i < 32; i++) {
    for (const k of ['MO', 'DF', 'TG', 'TT', 'OSL', 'TO']) {
      const key = `${k}(${i})`;
      if (!mockKeymap[key]) {
        const baseCode = { MO: 0x5100, DF: 0x5400, TG: 0x5300, TT: 0x5500, OSL: 0x5600, TO: 0x5200 }[k]!;
        mockKeymap[key] = { code: baseCode + i, qmkid: key, str: key, title: `${k} Layer ${i}` };
      }
    }
  }

  for (let i = 0; i < 255; i++) {
    const key = `TD(${i})`;
    if (!mockKeymap[key]) {
      mockKeymap[key] = { code: 0x7b00 + i, qmkid: key, str: key, title: `Tap Dance ${i}` };
    }
  }

  const mockCodemap: any = {};
  Object.entries(mockKeymap).forEach(([key, value]: [string, any]) => {
    mockCodemap[value.code] = key;
  });

  // Add modifier masks to codemap
  mockCodemap[0x0100] = 'LCTL(kc)';
  mockCodemap[0x0200] = 'LSFT(kc)';
  mockCodemap[0x0400] = 'LALT(kc)';
  mockCodemap[0x0800] = 'LGUI(kc)';

  const mockKeyaliases: any = {
    'LSHIFT': 'KC_LSFT',
    'LCTRL': 'KC_LCTL',
    'LALT': 'KC_LALT',
    'SPACE': 'KC_SPC',
    'ENTER': 'KC_ENT',
    'RETURN': 'KC_ENT',
  };

  return {
    KEYMAP: mockKeymap,
    CODEMAP: mockCodemap,
    KEYALIASES: mockKeyaliases
  };
});

describe('KeyService', () => {
  let keyService: KeyService;

  beforeEach(() => {
    keyService = new KeyService();
    // Reset mock data before each test
    vi.clearAllMocks();
  });

  describe('generateAllKeycodes', () => {
    it('should populate custom keycodes from keyboard info', () => {
      // Arrange
      const kbinfo = createTestKeyboardInfo({
        custom_keycodes: [
          { name: 'CUSTOM_KEY_1', shortName: 'CK1', title: 'Custom Key 1' },
          { name: 'CUSTOM_KEY_2', shortName: 'CK2', title: 'Custom Key 2' }
        ]
      });

      // Act
      keyService.generateAllKeycodes(kbinfo);

      // Assert
      expect(KEYMAP['USER00']).toEqual({
        code: 0x7e00,
        qmkid: 'CUSTOM_KEY_1',
        str: 'CK1',
        title: 'Custom Key 1'
      });
      expect(KEYMAP['CUSTOM_KEY_1']).toEqual({
        code: 0x7e00,
        qmkid: 'CUSTOM_KEY_1',
        str: 'CK1',
        title: 'Custom Key 1'
      });
      expect(KEYALIASES['CUSTOM_KEY_1']).toBe('USER00');
    });

    it('should add type and idx to macro keys', () => {
      // Arrange
      const kbinfo = minimalKeyboardInfo;

      // Act
      keyService.generateAllKeycodes(kbinfo);

      // Assert
      expect(KEYMAP['M0'].type).toBe('macro');
      expect(KEYMAP['M0'].idx).toBe(0);
      expect(KEYMAP['M10'].type).toBe('macro');
      expect(KEYMAP['M10'].idx).toBe(10);
    });

    it('should add type and idx to layer keys', () => {
      // Arrange
      const kbinfo = minimalKeyboardInfo;

      // Act
      keyService.generateAllKeycodes(kbinfo);

      // Assert
      expect(KEYMAP['MO(1)'].type).toBe('layer');
      expect(KEYMAP['MO(1)'].subtype).toBe('MO');
      expect(KEYMAP['MO(1)'].idx).toBe(1);
      expect(KEYMAP['TO(0)'].type).toBe('layer');
      expect(KEYMAP['TO(0)'].subtype).toBe('TO');
    });

    it('should add type and idx to tap dance keys', () => {
      // Arrange
      const kbinfo = minimalKeyboardInfo;

      // Act
      keyService.generateAllKeycodes(kbinfo);

      // Assert
      expect(KEYMAP['TD(0)'].type).toBe('tapdance');
      expect(KEYMAP['TD(0)'].idx).toBe(0);
      expect(KEYMAP['TD(1)'].type).toBe('tapdance');
      expect(KEYMAP['TD(1)'].idx).toBe(1);
    });

    it('should handle keyboard info without custom keycodes', () => {
      // Arrange
      const kbinfo = createTestKeyboardInfo({ custom_keycodes: undefined });

      // Act & Assert - should not throw
      expect(() => keyService.generateAllKeycodes(kbinfo)).not.toThrow();
    });
  });

  describe('parse', () => {
    it('should parse regular keycodes', () => {
      // Arrange & Act & Assert
      expect(keyService.parse('KC_A')).toBe(0x04);
      expect(keyService.parse('KC_B')).toBe(0x05);
      expect(keyService.parse('KC_SPC')).toBe(0x2c);
    });

    it('should parse aliases', () => {
      // Arrange & Act & Assert
      expect(keyService.parse('LSHIFT')).toBe(0xe1); // Should resolve to KC_LSFT
      expect(keyService.parse('SPACE')).toBe(0x2c); // Should resolve to KC_SPC
      expect(keyService.parse('ENTER')).toBe(0x28); // Should resolve to KC_ENT
    });

    it('should parse layer keys', () => {
      // Arrange & Act & Assert
      expect(keyService.parse('MO(1)')).toBe(0x5101);
      expect(keyService.parse('TO(0)')).toBe(0x5200);
      expect(keyService.parse('TG(1)')).toBe(0x5301);
    });

    it('should parse macro keys', () => {
      // Arrange & Act & Assert
      expect(keyService.parse('M0')).toBe(0x7700);
      expect(keyService.parse('M1')).toBe(0x7701);
      expect(keyService.parse('M10')).toBe(0x770a);
    });

    it('should parse modifier combinations', () => {
      // Arrange & Act & Assert
      expect(keyService.parse('LCTL(KC_A)')).toBe(0x0104); // 0x0100 + 0x04
      expect(keyService.parse('LSFT(KC_B)')).toBe(0x0205); // 0x0200 + 0x05
      expect(keyService.parse('LALT(KC_C)')).toBe(0x0406); // 0x0400 + 0x06
    });

    it('should handle invalid inputs', () => {
      // Arrange & Act & Assert
      expect(keyService.parse(null as any)).toBe(0xff);
      expect(keyService.parse('' as any)).toBe(0xff);
      expect(keyService.parse(-1 as any)).toBe(0xff);
      expect(keyService.parse(0xff as any)).toBe(0xff);
    });

    it('should return numeric value if already a number', () => {
      // Arrange & Act & Assert
      expect(keyService.parse(0x1234 as any)).toBe(0x1234);
    });

    it('should parse string numbers', () => {
      // Arrange & Act & Assert
      expect(keyService.parse('123' as any)).toBe(123);
    });

    it('should handle unknown keys by parsing as integer', () => {
      // Arrange & Act & Assert
      expect(keyService.parse('UNKNOWN_KEY' as any)).toBeNaN();
      expect(keyService.parse('0x1234' as any)).toBe(0x1234);
    });
  });

  describe('stringify', () => {
    it('should stringify regular keycodes', () => {
      // Arrange & Act & Assert
      expect(keyService.stringify(0x04)).toBe('KC_A');
      expect(keyService.stringify(0x05)).toBe('KC_B');
      expect(keyService.stringify(0x2c)).toBe('KC_SPACE'); // Last one added to codemap wins
    });

    it('should stringify layer keys', () => {
      // Arrange & Act & Assert
      expect(keyService.stringify(0x5101)).toBe('MO(1)');
      expect(keyService.stringify(0x5200)).toBe('TO(0)');
      expect(keyService.stringify(0x5301)).toBe('TG(1)');
    });

    it('should stringify macro keys', () => {
      // Arrange & Act & Assert
      expect(keyService.stringify(0x7700)).toBe('M0');
      expect(keyService.stringify(0x7701)).toBe('M1');
    });

    it('should stringify modifier combinations', () => {
      // Arrange & Act & Assert
      expect(keyService.stringify(0x0104)).toBe('LCTL(KC_A)');
      expect(keyService.stringify(0x0205)).toBe('LSFT(KC_B)');
      expect(keyService.stringify(0x0406)).toBe('LALT(KC_C)');
    });

    it('should handle unknown keycodes as hex', () => {
      // Arrange & Act & Assert
      expect(keyService.stringify(0x9999)).toBe('0x9999');
      expect(keyService.stringify(0xabcd)).toBe('0xabcd');
    });

    it('should handle modifier mask with no key', () => {
      // Arrange & Act & Assert
      expect(keyService.stringify(0x0100)).toBe('LCTL(KC_NO)');
    });

    it('should handle parse and stringify as inverse operations', () => {
      // Arrange
      const keys = ['KC_A', 'MO(1)', 'M0', 'LCTL(KC_C)'];

      // Act & Assert
      keys.forEach(key => {
        const parsed = keyService.parse(key);
        const stringified = keyService.stringify(parsed);
        expect(stringified).toBe(key);
      });
    });
  });

  describe('define', () => {
    it('should return key definition for string keys', () => {
      // Arrange & Act
      const result = keyService.define('KC_A');

      // Assert
      expect(result).toEqual({
        code: 0x04,
        qmkid: 'KC_A',
        str: 'A',
        title: 'A'
      });
    });

    it('should return key definition for numeric codes', () => {
      // Arrange & Act
      const result = keyService.define(0x04);

      // Assert
      expect(result).toEqual({
        code: 0x04,
        qmkid: 'KC_A',
        str: 'A',
        title: 'A'
      });
    });

    it('should handle hex string format', () => {
      // Arrange & Act
      const result = keyService.define('0x04');

      // Assert
      expect(result).toEqual({
        code: 0x04,
        qmkid: 'KC_A',
        str: 'A',
        title: 'A'
      });
    });

    it('should handle decimal string format', () => {
      // Arrange & Act
      const result = keyService.define('4');

      // Assert
      expect(result).toEqual({
        code: 0x04,
        qmkid: 'KC_A',
        str: 'A',
        title: 'A'
      });
    });

    it('should resolve aliases', () => {
      // Arrange & Act
      const result = keyService.define('LSHIFT');

      // Assert
      expect(result).toEqual({
        code: 0xe1,
        qmkid: 'KC_LSFT',
        str: 'LShift',
        title: 'Left Shift'
      });
    });

    it('should return undefined for unknown keys', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

      // Act
      const result = keyService.define('UNKNOWN_KEY');

      // Assert
      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('Unknown keystr', 'UNKNOWN_KEY', 'UNKNOWN_KEY');

      consoleSpy.mockRestore();
    });
  });

  describe('canonical', () => {
    it('should return numeric values unchanged', () => {
      // Arrange & Act & Assert
      expect(keyService.canonical(123)).toBe(123);
    });

    it('should return hex strings unchanged', () => {
      // Arrange & Act & Assert
      expect(keyService.canonical('0x1234')).toBe('0x1234');
    });

    it('should resolve aliases', () => {
      // Arrange & Act & Assert
      expect(keyService.canonical('LSHIFT')).toBe('KC_LSFT');
      expect(keyService.canonical('SPACE')).toBe('KC_SPC');
    });

    it('should return non-alias strings unchanged', () => {
      // Arrange & Act & Assert
      expect(keyService.canonical('KC_A')).toBe('KC_A');
      expect(keyService.canonical('UNKNOWN')).toBe('UNKNOWN');
    });

    it('should handle falsy values', () => {
      // Arrange & Act & Assert
      expect(keyService.canonical('')).toBe('');
      expect(keyService.canonical(null as any)).toBe(null);
      expect(keyService.canonical(undefined as any)).toBe(undefined);
    });

    it('should handle 0 correctly', () => {
      // Arrange & Act & Assert
      expect(keyService.canonical(0)).toBe(0);
    });
  });

  describe('localization property', () => {
    it('should have default localization set to english_us', () => {
      // Arrange & Act & Assert
      expect(keyService.localization).toBe('english_us');
    });

    it('should allow changing localization', () => {
      // Arrange & Act
      keyService.localization = 'german';

      // Assert
      expect(keyService.localization).toBe('german');
    });
  });

  describe('Edge cases', () => {
    it('should handle maximum layer index', () => {
      // Arrange
      const kbinfo = minimalKeyboardInfo;

      // Act
      keyService.generateAllKeycodes(kbinfo);

      // Assert
      expect(KEYMAP['MO(31)'].type).toBe('layer');
      expect(KEYMAP['MO(31)'].idx).toBe(31);
    });

    it('should handle maximum macro index', () => {
      // Arrange
      const kbinfo = minimalKeyboardInfo;

      // Act
      keyService.generateAllKeycodes(kbinfo);

      // Assert
      expect(KEYMAP['M126'].type).toBe('macro');
      expect(KEYMAP['M126'].idx).toBe(126);
    });

    it('should handle all 64 user keys', () => {
      // Arrange
      const customKeycodes = Array(64).fill(null).map((_, i) => ({
        name: `CUSTOM_${i}`,
        shortName: `C${i}`,
        title: `Custom ${i}`
      }));
      const kbinfo = createTestKeyboardInfo({ custom_keycodes: customKeycodes });

      // Act
      keyService.generateAllKeycodes(kbinfo);

      // Assert
      expect(KEYMAP['USER63']).toEqual({
        code: 0x7e3f,
        qmkid: 'CUSTOM_63',
        str: 'C63',
        title: 'Custom 63'
      });
    });

    it('should handle modifier(kc) pattern with KC_NO', () => {
      // Arrange & Act
      const result = keyService.parse('LCTL(kc)');

      // Assert
      expect(result).toBe(0x0100); // LCTL mask with KC_NO (0x00)
    });
  });

  describe('parseDesc', () => {
    it('should parse layer keys correctly', () => {
      // Test various layer key types
      expect(keyService.parseDesc('MO(5)')).toEqual({
        type: 'layer',
        mask: 'MO',
        idx: 5
      });

      expect(keyService.parseDesc('DF(10)')).toEqual({
        type: 'layer',
        mask: 'DF',
        idx: 10
      });

      expect(keyService.parseDesc('TG(0)')).toEqual({
        type: 'layer',
        mask: 'TG',
        idx: 0
      });

      expect(keyService.parseDesc('TT(15)')).toEqual({
        type: 'layer',
        mask: 'TT',
        idx: 15
      });

      expect(keyService.parseDesc('OSL(3)')).toEqual({
        type: 'layer',
        mask: 'OSL',
        idx: 3
      });

      expect(keyService.parseDesc('TO(8)')).toEqual({
        type: 'layer',
        mask: 'TO',
        idx: 8
      });
    });

    it('should parse macro keys correctly', () => {
      expect(keyService.parseDesc('M0')).toEqual({
        type: 'macro',
        mask: 'M',
        idx: 0
      });

      expect(keyService.parseDesc('M42')).toEqual({
        type: 'macro',
        mask: 'M',
        idx: 42
      });

      expect(keyService.parseDesc('M126')).toEqual({
        type: 'macro',
        mask: 'M',
        idx: 126
      });
    });

    it('should parse tap dance keys correctly', () => {
      expect(keyService.parseDesc('TD(0)')).toEqual({
        type: 'tapdance',
        mask: 'TD',
        idx: 0
      });

      expect(keyService.parseDesc('TD(99)')).toEqual({
        type: 'tapdance',
        mask: 'TD',
        idx: 99
      });

      expect(keyService.parseDesc('TD(254)')).toEqual({
        type: 'tapdance',
        mask: 'TD',
        idx: 254
      });
    });

    it('should parse hold-tap keys correctly', () => {
      // Initialize keymaps for testing
      keyService.generateAllKeycodes(minimalKeyboardInfo);

      const result = keyService.parseDesc('LCTL(KC_A)');
      expect(result.type).toBe('key');
      expect(result.str).toContain('A');
      expect(result.title).toBeDefined();
    });

    it('should parse normal keys correctly', () => {
      keyService.generateAllKeycodes(minimalKeyboardInfo);

      const result = keyService.parseDesc('KC_ENTER');
      expect(result).toEqual({
        type: 'key',
        str: expect.any(String),
        title: expect.any(String)
      });
    });

    it('should handle hex keys correctly', () => {
      const result = keyService.parseDesc('0x1234');
      expect(result).toEqual({
        type: 'key',
        str: '0x1234'
      });
    });

    it('should handle numbers correctly', () => {
      const result = keyService.parseDesc(123);
      expect(result.type).toBe('key');
      expect(result.str).toMatch(/^0x/);
    });

    it('should handle unknown keys correctly', () => {
      const result = keyService.parseDesc('UNKNOWN_KEY');
      expect(result).toEqual({
        type: 'key',
        str: '<span style="color: red; font-weight: bold;">?? BROKEN ??</span>',
        title: 'UNKNOWN_KEY'
      });
    });

    it('should resolve aliases before parsing', () => {
      keyService.generateAllKeycodes(minimalKeyboardInfo);

      // Assuming some key aliases exist
      const result = keyService.parseDesc('KC_ENT'); // Alias for KC_ENTER
      expect(result.type).toBe('key');
      expect(result.str).toBeDefined();
    });
  });

  describe('stringifyKeymap', () => {
    it('should convert keymap integers to strings', () => {
      const keymapInt = [
        [0x0004, 0x0005, 0x0006, 0x0007], // Layer 0: KC_A, KC_B, KC_C, KC_D
        [0x0014, 0x0015, 0x0016, 0x0017], // Layer 1: KC_Q, KC_R, KC_S, KC_T
      ];

      const result = keyService.stringifyKeymap(keymapInt);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(4);
      expect(result[0][0]).toBe('KC_A');
      expect(result[0][1]).toBe('KC_B');
      expect(result[0][2]).toBe('KC_C');
      expect(result[0][3]).toBe('KC_D');
      expect(result[1][0]).toBe('KC_Q');
      expect(result[1][1]).toBe('KC_R');
      expect(result[1][2]).toBe('KC_S');
      expect(result[1][3]).toBe('KC_T');
    });

    it('should handle 0xff as -1', () => {
      const keymapInt = [
        [0x0004, 0xff, 0x0006],
        [0xff, 0xff, 0xff]
      ];

      const result = keyService.stringifyKeymap(keymapInt);

      expect(result[0][0]).toBe('KC_A');
      expect(result[0][1]).toBe('-1');
      expect(result[0][2]).toBe('KC_C');
      expect(result[1][0]).toBe('-1');
      expect(result[1][1]).toBe('-1');
      expect(result[1][2]).toBe('-1');
    });

    it('should handle modifier combinations', () => {
      const keymapInt = [
        [0x0104, 0x0204, 0x0404, 0x0804] // LCTL(KC_A), LSFT(KC_A), LALT(KC_A), LGUI(KC_A)
      ];

      const result = keyService.stringifyKeymap(keymapInt);

      expect(result[0][0]).toBe('LCTL(KC_A)');
      expect(result[0][1]).toBe('LSFT(KC_A)');
      expect(result[0][2]).toBe('LALT(KC_A)');
      expect(result[0][3]).toBe('LGUI(KC_A)');
    });

    it('should handle empty keymap', () => {
      const keymapInt: number[][] = [];
      const result = keyService.stringifyKeymap(keymapInt);
      expect(result).toEqual([]);
    });

    it('should handle unknown keycodes as hex', () => {
      const keymapInt = [
        [0xFFFF, 0x9999] // Unknown keycodes
      ];

      const result = keyService.stringifyKeymap(keymapInt);

      expect(result[0][0]).toMatch(/^0x/);
      expect(result[0][1]).toMatch(/^0x/);
    });
  });

  describe('parseKeymap', () => {
    it('should convert keymap strings to integers', () => {
      const keymapStr = [
        [['KC_A', 'KC_B'], ['KC_C', 'KC_D']], // Layer 0: 2x2 matrix
        [['KC_Q', 'KC_R'], ['KC_S', 'KC_T']]  // Layer 1: 2x2 matrix
      ];

      const result = keyService.parseKeymap(keymapStr);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([0x0004, 0x0005, 0x0006, 0x0007]);
      expect(result[1]).toEqual([0x0014, 0x0015, 0x0016, 0x0017]);
    });

    it('should handle -1 and 0xff as 0xff', () => {
      const keymapStr = [
        [['KC_A', '0xff'], ['KC_C', 0xff as any]]
      ];

      const result = keyService.parseKeymap(keymapStr);

      expect(result[0]).toEqual([0x0004, 0xff, 0x0006, 0xff]);
    });

    it('should handle empty cells as 0xff', () => {
      const keymapStr = [
        [['KC_A', ''], [null as any, undefined as any]]
      ];

      const result = keyService.parseKeymap(keymapStr);

      expect(result[0]).toEqual([0x0004, 0xff, 0xff, 0xff]);
    });

    it('should handle modifier combinations', () => {
      const keymapStr = [
        [['LCTL(KC_A)', 'LSFT(KC_B)'], ['LALT(KC_C)', 'LGUI(KC_D)']]
      ];

      const result = keyService.parseKeymap(keymapStr);

      expect(result[0]).toEqual([0x0104, 0x0205, 0x0406, 0x0807]);
    });

    it('should handle empty keymap', () => {
      const keymapStr: KeyString[][][] = [];
      const result = keyService.parseKeymap(keymapStr);
      expect(result).toEqual([]);
    });

    it('should handle single layer with single key', () => {
      const keymapStr = [
        [['KC_SPACE']]
      ];

      const result = keyService.parseKeymap(keymapStr);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(1);
      expect(result[0][0]).toBe(0x002c);
    });

    it('should handle numeric strings', () => {
      const keymapStr = [
        [['123', '0x1234']]
      ];

      const result = keyService.parseKeymap(keymapStr);

      expect(result[0][0]).toBe(123);
      expect(result[0][1]).toBe(0x1234);
    });

    it('should handle mixed valid and invalid keys', () => {
      const keymapStr = [
        [['KC_A', 'INVALID_KEY'], ['KC_B', '']]
      ];

      const result = keyService.parseKeymap(keymapStr);

      expect(result[0][0]).toBe(0x0004); // KC_A
      expect(result[0][1]).toBeNaN(); // INVALID_KEY returns NaN from parseInt
      expect(result[0][2]).toBe(0x0005); // KC_B
      expect(result[0][3]).toBe(0xff); // empty string
    });
  });
});
