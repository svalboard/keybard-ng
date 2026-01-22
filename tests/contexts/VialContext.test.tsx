import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { VialProvider, useVial } from '../../src/contexts/VialContext';
import type { KeyboardInfo } from '../../src/types/vial.types';

// Mock the services
vi.mock('../../src/services/file.service', () => ({
  fileService: {
    loadFile: vi.fn(),
  },
}));

vi.mock('../../src/services/vial.service', () => ({
  vialService: {
    init: vi.fn(),
    load: vi.fn(),
    updateKey: vi.fn(),
  },
  VialService: {
    isWebHIDSupported: vi.fn(() => true),
  },
}));

vi.mock('../../src/services/qmk.service', () => ({
  qmkService: {
    get: vi.fn(),
  },
}));

vi.mock('../../src/services/usb.service', () => ({
  usbInstance: {
    open: vi.fn(),
    close: vi.fn(),
    getDeviceName: vi.fn(),
  },
}));

import { fileService } from '../../src/services/file.service';
import { usbInstance } from '../../src/services/usb.service';
import { vialService } from '../../src/services/vial.service';

describe('VialContext - File Loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <VialProvider>{children}</VialProvider>
  );

  it('loadFromFile successfully loads file and updates keyboard state', async () => {
    const mockKeyboardInfo: KeyboardInfo = {
      rows: 6,
      cols: 14,
      kbid: 'test-keyboard',
    };

    vi.mocked(fileService.loadFile).mockResolvedValue(mockKeyboardInfo);

    const { result } = renderHook(() => useVial(), { wrapper });

    const mockFile = new File(['{}'], 'test.kbi', { type: 'application/json' });

    await act(async () => {
      await result.current.loadFromFile(mockFile);
    });

    expect(result.current.keyboard).toEqual(mockKeyboardInfo);
    expect(fileService.loadFile).toHaveBeenCalledWith(mockFile);
  });

  it('loadFromFile sets loadedFrom to file name', async () => {
    const mockKeyboardInfo: KeyboardInfo = {
      rows: 6,
      cols: 14,
    };

    vi.mocked(fileService.loadFile).mockResolvedValue(mockKeyboardInfo);

    const { result } = renderHook(() => useVial(), { wrapper });

    const mockFile = new File(['{}'], 'my-keyboard.kbi', { type: 'application/json' });

    await act(async () => {
      await result.current.loadFromFile(mockFile);
    });

    expect(result.current.loadedFrom).toBe('my-keyboard.kbi');
  });

  it('loadFromFile sets isConnected to false', async () => {
    const mockKeyboardInfo: KeyboardInfo = {
      rows: 6,
      cols: 14,
    };

    vi.mocked(fileService.loadFile).mockResolvedValue(mockKeyboardInfo);

    const { result } = renderHook(() => useVial(), { wrapper });

    const mockFile = new File(['{}'], 'test.kbi', { type: 'application/json' });

    await act(async () => {
      await result.current.loadFromFile(mockFile);
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('loadFromFile throws error for invalid file', async () => {
    vi.mocked(fileService.loadFile).mockRejectedValue(new Error('Invalid file'));

    const { result } = renderHook(() => useVial(), { wrapper });

    const mockFile = new File(['{}'], 'invalid.kbi', { type: 'application/json' });

    await expect(async () => {
      await act(async () => {
        await result.current.loadFromFile(mockFile);
      });
    }).rejects.toThrow('Invalid file');
  });

  it('device connection after file load updates loadedFrom to device name', async () => {
    // First load a file
    const mockFileInfo: KeyboardInfo = {
      rows: 6,
      cols: 14,
    };

    vi.mocked(fileService.loadFile).mockResolvedValue(mockFileInfo);

    const { result } = renderHook(() => useVial(), { wrapper });

    const mockFile = new File(['{}'], 'test.kbi', { type: 'application/json' });

    await act(async () => {
      await result.current.loadFromFile(mockFile);
    });

    expect(result.current.loadedFrom).toBe('test.kbi');

    // Now connect a device
    const mockDeviceInfo: KeyboardInfo = {
      rows: 5,
      cols: 12,
      kbid: 'device-keyboard',
    };

    vi.mocked(usbInstance.open).mockResolvedValue(true);
    vi.mocked(usbInstance.getDeviceName).mockReturnValue('Svalboard');
    vi.mocked(vialService.init).mockResolvedValue(undefined);
    vi.mocked(vialService.load).mockResolvedValue(mockDeviceInfo);

    await act(async () => {
      await result.current.connect();
    });

    await act(async () => {
      await result.current.loadKeyboard();
    });

    expect(result.current.loadedFrom).toBe('Svalboard');
  });

  it('file load after device connection updates loadedFrom to file name', async () => {
    // First connect a device
    const mockDeviceInfo: KeyboardInfo = {
      rows: 5,
      cols: 12,
      kbid: 'device-keyboard',
    };

    vi.mocked(usbInstance.open).mockResolvedValue(true);
    vi.mocked(usbInstance.getDeviceName).mockReturnValue('Svalboard');
    vi.mocked(vialService.init).mockResolvedValue(undefined);
    vi.mocked(vialService.load).mockResolvedValue(mockDeviceInfo);

    const { result } = renderHook(() => useVial(), { wrapper });

    await act(async () => {
      await result.current.connect();
    });

    await act(async () => {
      await result.current.loadKeyboard();
    });

    expect(result.current.loadedFrom).toBe('Svalboard');

    // Now load a file
    const mockFileInfo: KeyboardInfo = {
      rows: 6,
      cols: 14,
    };

    vi.mocked(fileService.loadFile).mockResolvedValue(mockFileInfo);

    const mockFile = new File(['{}'], 'test.kbi', { type: 'application/json' });

    await act(async () => {
      await result.current.loadFromFile(mockFile);
    });

    expect(result.current.loadedFrom).toBe('test.kbi');
  });

  it('disconnect clears loadedFrom', async () => {
    // First connect a device
    const mockDeviceInfo: KeyboardInfo = {
      rows: 5,
      cols: 12,
      kbid: 'device-keyboard',
    };

    vi.mocked(usbInstance.open).mockResolvedValue(true);
    vi.mocked(usbInstance.getDeviceName).mockReturnValue('Svalboard');
    vi.mocked(vialService.init).mockResolvedValue(undefined);
    vi.mocked(vialService.load).mockResolvedValue(mockDeviceInfo);

    const { result } = renderHook(() => useVial(), { wrapper });

    await act(async () => {
      await result.current.connect();
    });

    await act(async () => {
      await result.current.loadKeyboard();
    });

    expect(result.current.loadedFrom).toBe('Svalboard');

    // Now disconnect
    await act(async () => {
      await result.current.disconnect();
    });

    expect(result.current.loadedFrom).toBeNull();
  });
});
