import "./Keyboard.css";

import { MATRIX_COLS, SVALBOARD_LAYOUT, UNIT_SIZE } from "../constants/svalboard-layout";
import React, { useEffect, useState } from "react";
import { getKeyLabel, getKeycodeName } from "@/utils/layers";

import { Key } from "./Key";
import type { KeyboardInfo } from "../types/vial.types";

interface KeyboardProps {
    keyboard: KeyboardInfo;
    onKeyClick?: (layer: number, row: number, col: number) => void;
    selectedLayer: number;
    setSelectedLayer: (layer: number) => void;
}

export const Keyboard: React.FC<KeyboardProps> = ({ keyboard, onKeyClick, selectedLayer, setSelectedLayer }) => {
    const [selectedKey, setSelectedKey] = useState<{ row: number; col: number } | null>(null);

    // Get the keymap for the selected layer
    const layerKeymap = keyboard.keymap?.[selectedLayer] || [];

    const handleKeyClick = (row: number, col: number) => {
        setSelectedKey({ row, col });
        if (onKeyClick) {
            onKeyClick(selectedLayer, row, col);
        }
    };

    useEffect(() => {
        setSelectedKey(null); // Clear selected key when layer changes
    }, [selectedLayer]);

    // Calculate the keyboard dimensions for the container
    const calculateKeyboardSize = () => {
        let maxX = 0;
        let maxY = 0;

        Object.values(SVALBOARD_LAYOUT).forEach((key) => {
            maxX = Math.max(maxX, key.x + key.w);
            maxY = Math.max(maxY, key.y + key.h);
        });

        return {
            width: maxX * UNIT_SIZE,
            height: maxY * UNIT_SIZE,
        };
    };

    const { width, height } = calculateKeyboardSize();

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="keyboard-layout" style={{ width: `${width}px`, height: `${height}px` }}>
                {Object.entries(SVALBOARD_LAYOUT).map(([matrixPos, layout]) => {
                    const pos = Number(matrixPos);
                    const row = Math.floor(pos / MATRIX_COLS);
                    const col = pos % MATRIX_COLS;

                    // Get the keycode for this position in the current layer
                    const keycode = layerKeymap[pos] || 0;
                    const { label, keyContents } = getKeyLabel(keyboard, keycode);
                    const keycodeName = getKeycodeName(keycode);

                    return (
                        <Key
                            key={`${row}-${col}`}
                            x={layout.x}
                            y={layout.y}
                            w={layout.w}
                            h={layout.h}
                            keycode={keycodeName}
                            label={label}
                            row={row}
                            col={col}
                            selected={selectedKey?.row === row && selectedKey?.col === col}
                            onClick={handleKeyClick}
                            keyContents={keyContents}
                        />
                    );
                })}
            </div>

            {selectedKey && (
                <div className="bg-white text-black p-4 mt-4 rounded shadow-md w-64 absolute bottom-5 right-5 rounded-2xl">
                    <h4>Selected Key</h4>
                    <p>
                        <b>Position</b>: Row {selectedKey.row}, Col {selectedKey.col}
                    </p>
                    <p>
                        <b>Matrix</b>: {selectedKey.row * MATRIX_COLS + selectedKey.col}
                    </p>
                    <p>
                        <b>Keycode</b>: {getKeycodeName(layerKeymap[selectedKey.row * MATRIX_COLS + selectedKey.col] || 0)}
                    </p>
                </div>
            )}
        </div>
    );
};
