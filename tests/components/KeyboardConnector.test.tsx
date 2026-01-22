import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import KeyboardConnector from '../../src/components/KeyboardConnector';
import { VialProvider } from '../../src/contexts/VialContext';
import type { KeyboardInfo } from '../../src/types/vial.types';

// Mock services
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

vi.mock('../../src/services/usb', () => ({
  usbInstance: {
    open: vi.fn(),
    close: vi.fn(),
  },
}));

vi.mock('../../src/utils/storage', () => ({
  storage: {
    getLastFilePath: vi.fn(),
    setLastFilePath: vi.fn(),
    clearLastFilePath: vi.fn(),
    saveFile: vi.fn().mockResolvedValue(undefined),
  },
}));

import { fileService } from '../../src/services/file.service';

describe('KeyboardConnector - File Loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <VialProvider>
        <KeyboardConnector />
      </VialProvider>
    );
  };

  it('Load button is visible and enabled when not loading', () => {
    renderComponent();

    const loadButton = screen.getByRole('button', { name: /load file/i });
    expect(loadButton).toBeInTheDocument();
    expect(loadButton).not.toBeDisabled();
  });

  it('displays keyboard information after loading valid file', async () => {
    const mockKeyboardInfo: KeyboardInfo = {
      rows: 6,
      cols: 14,
      kbid: 'test-keyboard',
      via_proto: 9,
      vial_proto: 6,
    };

    vi.mocked(fileService.loadFile).mockResolvedValue(mockKeyboardInfo);

    renderComponent();

    const loadButton = screen.getByRole('button', { name: /load file/i });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(
      [JSON.stringify(mockKeyboardInfo)],
      'test.kbi',
      { type: 'application/json' }
    );

    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('Keyboard Information')).toBeInTheDocument();
    });

    expect(screen.getByText('test-keyboard')).toBeInTheDocument();
  });

  it('shows "Invalid JSON" error for malformed JSON', async () => {
    vi.mocked(fileService.loadFile).mockRejectedValue(new Error('Invalid JSON'));

    renderComponent();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['{ invalid json }'], 'invalid.kbi', { type: 'application/json' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON/i)).toBeInTheDocument();
    });
  });

  it('shows "Invalid file" error for missing required fields', async () => {
    vi.mocked(fileService.loadFile).mockRejectedValue(new Error('Invalid file'));

    renderComponent();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(
      [JSON.stringify({ layers: 4 })],
      'missing-fields.kbi',
      { type: 'application/json' }
    );

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid file/i)).toBeInTheDocument();
    });
  });

  it('shows appropriate error for large file (>1MB)', async () => {
    vi.mocked(fileService.loadFile).mockRejectedValue(new Error('File too large'));

    renderComponent();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const largeContent = 'x'.repeat(1048577);
    const file = new File([largeContent], 'large.kbi', { type: 'application/json' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/File too large \(max 1MB\)/i)).toBeInTheDocument();
    });
  });

  it('"Loaded From" shows file name when file is loaded', async () => {
    const mockKeyboardInfo: KeyboardInfo = {
      rows: 6,
      cols: 14,
      kbid: 'test-keyboard',
    };

    vi.mocked(fileService.loadFile).mockResolvedValue(mockKeyboardInfo);

    renderComponent();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(
      [JSON.stringify(mockKeyboardInfo)],
      'my-keyboard.kbi',
      { type: 'application/json' }
    );

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('Loaded From:')).toBeInTheDocument();
      expect(screen.getByText('my-keyboard.kbi')).toBeInTheDocument();
    });
  });

  it('file input resets after selection', async () => {
    const mockKeyboardInfo: KeyboardInfo = {
      rows: 6,
      cols: 14,
    };

    vi.mocked(fileService.loadFile).mockResolvedValue(mockKeyboardInfo);

    renderComponent();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(
      [JSON.stringify(mockKeyboardInfo)],
      'test.kbi',
      { type: 'application/json' }
    );

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(fileInput.value).toBe('');
    });
  });
});
