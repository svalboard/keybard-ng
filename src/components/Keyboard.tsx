import "./Keyboard.css";

import { getKeyLabel, getKeycodeName } from "@/utils/layers";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { MATRIX_COLS, SVALBOARD_LAYOUT, UNIT_SIZE } from "../constants/svalboard-layout";
import { CLUSTER_BACKGROUNDS_DATA, THUMB_OFFSET_U } from "../constants/keyboard-visuals";

import { useKeyBinding } from "@/contexts/KeyBindingContext";
import type { KeyboardInfo } from "../types/vial.types";
import { Key } from "./Key";
import { useLayoutSettings } from "@/contexts/LayoutSettingsContext";
import { getLabelForKeycode } from "./Keyboards/layouts";
import {
    headerClasses,
    hoverHeaderClasses,
    hoverBackgroundClasses,
    hoverBorderClasses
} from "@/utils/colors";
import { InfoIcon } from "./icons/InfoIcon";
import { usePanels } from "@/contexts/PanelsContext";

interface KeyboardProps {
    keyboard: KeyboardInfo;
    onKeyClick?: (layer: number, row: number, col: number) => void;
    selectedLayer: number;
    setSelectedLayer: (layer: number) => void;
}

/**
 * Main Keyboard component for the Svalboard layout.
 * Renders individual keys, cluster backgrounds, and an information panel.
 */
export const Keyboard: React.FC<KeyboardProps> = ({ keyboard, selectedLayer }) => {
    const {
        selectKeyboardKey,
        selectedTarget,
        clearSelection,
        hoveredKey,
        assignKeycode
    } = useKeyBinding();

    const { activePanel, itemToEdit } = usePanels();
    const [showInfoPanel, setShowInfoPanel] = useState(false);

    const { internationalLayout, keyVariant } = useLayoutSettings();
    const isTransmitting = useMemo(() =>
        itemToEdit !== null && ["tapdances", "combos", "macros", "overrides"].includes(activePanel || ""),
        [itemToEdit, activePanel]
    );

    const currentUnitSize = useMemo(() =>
        keyVariant === 'small' ? 30 : keyVariant === 'medium' ? 45 : UNIT_SIZE,
        [keyVariant]
    );

    // Ref to store the selection before entering transmitting mode
    const savedSelection = useRef<{ layer: number; row: number; col: number } | null>(null);

    useEffect(() => {
        if (isTransmitting) {
            if (selectedTarget?.type === "keyboard" && typeof selectedTarget.row === "number" && typeof selectedTarget.col === "number") {
                savedSelection.current = {
                    layer: selectedTarget.layer ?? selectedLayer,
                    row: selectedTarget.row,
                    col: selectedTarget.col,
                };
                clearSelection();
            }
        } else if (savedSelection.current) {
            const { layer, row, col } = savedSelection.current;
            selectKeyboardKey(layer, row, col);
            savedSelection.current = null;
        }
    }, [isTransmitting, selectedTarget, selectedLayer, clearSelection, selectKeyboardKey]);

    const layerColor = useMemo(() =>
        keyboard.cosmetic?.layer_colors?.[selectedLayer] || "primary",
        [keyboard.cosmetic, selectedLayer]
    );

    const layerKeymap = useMemo(() =>
        keyboard.keymap?.[selectedLayer] || [],
        [keyboard.keymap, selectedLayer]
    );

    const isKeySelected = (row: number, col: number) => {
        return selectedTarget?.type === "keyboard" &&
            selectedTarget.layer === selectedLayer &&
            selectedTarget.row === row &&
            selectedTarget.col === col;
    };

    const handleKeyClick = (row: number, col: number) => {
        if (isTransmitting) {
            const pos = row * MATRIX_COLS + col;
            const keycode = layerKeymap[pos] || 0;
            const keycodeName = getKeycodeName(keycode);
            assignKeycode(keycodeName);
            return;
        }

        if (isKeySelected(row, col)) {
            clearSelection();
            return;
        }
        selectKeyboardKey(selectedLayer, row, col);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === "Delete" || e.key === "Backspace") && selectedTarget?.type === "keyboard") {
                if (selectedTarget.layer === selectedLayer && typeof selectedTarget.row === 'number') {
                    assignKeycode("KC_NO");
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedTarget, selectedLayer, assignKeycode]);

    const keyboardSize = useMemo(() => {
        let maxX = 0;
        let maxY = 0;

        Object.values(SVALBOARD_LAYOUT).forEach((key) => {
            const yPos = key.y >= 6 ? key.y + THUMB_OFFSET_U : key.y;
            maxX = Math.max(maxX, key.x + key.w);
            maxY = Math.max(maxY, yPos + key.h);
        });

        return {
            width: maxX * currentUnitSize,
            height: maxY * currentUnitSize + 20,
        };
    }, [currentUnitSize]);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div
                className="keyboard-layout relative"
                style={{ width: `${keyboardSize.width}px`, height: `${keyboardSize.height}px` }}
            >
                {/* Cluster Backgrounds */}
                {CLUSTER_BACKGROUNDS_DATA.map((bg, j) => (
                    <div
                        key={`bg-${j}`}
                        className="absolute bg-[#E6E6E3]"
                        style={{
                            left: `${bg.x * currentUnitSize}px`,
                            top: `${bg.y * currentUnitSize}px`,
                            width: `${bg.w * currentUnitSize}px`,
                            height: `${bg.h * currentUnitSize}px`,
                            borderRadius: `${10 * (currentUnitSize / UNIT_SIZE)}px`,
                            zIndex: 0
                        }}
                    />
                ))}

                {/* Keys */}
                {Object.entries(SVALBOARD_LAYOUT).map(([matrixPos, layout]) => {
                    const pos = Number(matrixPos);
                    const row = Math.floor(pos / MATRIX_COLS);
                    const col = pos % MATRIX_COLS;

                    const keycode = layerKeymap[pos] || 0;
                    const { label: defaultLabel, keyContents } = getKeyLabel(keyboard, keycode);
                    const keycodeName = getKeycodeName(keycode);

                    const label = getLabelForKeycode(keycodeName, internationalLayout) || defaultLabel;

                    // Styles for transmitting mode
                    const activeLayerColor = isTransmitting ? "sidebar" : layerColor;
                    const headerClass = headerClasses[activeLayerColor] || headerClasses["primary"];
                    const hoverHeaderClass = hoverHeaderClasses[activeLayerColor] || hoverHeaderClasses["primary"];
                    const keyHeaderClassFull = `${headerClass} ${hoverHeaderClass}`;

                    const keyHoverBg = isTransmitting ? hoverBackgroundClasses[layerColor] : undefined;
                    const keyHoverBorder = isTransmitting ? hoverBorderClasses[layerColor] : undefined;
                    const keyHoverLayerColor = isTransmitting ? layerColor : undefined;

                    const yPos = layout.y >= 6 ? layout.y + THUMB_OFFSET_U : layout.y;

                    return (
                        <Key
                            key={`${row}-${col}`}
                            x={layout.x}
                            y={yPos}
                            w={layout.w}
                            h={layout.h}
                            keycode={keycodeName}
                            label={label}
                            row={row}
                            col={col}
                            selected={isKeySelected(row, col)}
                            onClick={handleKeyClick}
                            keyContents={keyContents}
                            layerColor={activeLayerColor}
                            headerClassName={keyHeaderClassFull}
                            hoverBackgroundColor={keyHoverBg}
                            hoverBorderColor={keyHoverBorder}
                            hoverLayerColor={keyHoverLayerColor}
                            variant={keyVariant}
                            layerIndex={selectedLayer}
                        />
                    );
                })}
            </div>

            {/* Key Information Panel */}
            <div className="absolute bottom-5 right-5 z-50 flex items-end justify-end">
                <div
                    className={`bg-white text-black shadow-lg transition-all duration-300 ease-in-out relative flex flex-col overflow-hidden ${showInfoPanel
                            ? "w-[250px] h-[100px] rounded-2xl p-4 cursor-default"
                            : "w-12 h-12 rounded-2xl cursor-pointer hover:bg-gray-50 bg-white"
                        }`}
                    onClick={() => !showInfoPanel && setShowInfoPanel(true)}
                >
                    <div className={`w-full transition-opacity duration-200 delay-100 ${showInfoPanel ? "opacity-100" : "opacity-0 invisible h-0"
                        }`}>
                        {useMemo(() => {
                            const target = hoveredKey || selectedTarget;
                            if (!target) {
                                return (
                                    <div className="flex items-center justify-center h-[68px] pr-8">
                                        <p className="text-gray-300 italic text-sm text-center">No key selected</p>
                                    </div>
                                );
                            }

                            const pos = (typeof target.row === 'number' && typeof target.col === 'number')
                                ? (target.row * MATRIX_COLS + target.col)
                                : null;

                            const keycode = target.keycode || (pos !== null ? getKeycodeName(layerKeymap[pos] || 0) : "?");

                            return (
                                <div className="text-sm space-y-1">
                                    <p><span className="font-bold">Keycode:</span> {keycode}</p>
                                    {pos !== null && (
                                        <>
                                            <p><span className="font-bold">Position:</span> Row {target.row}, Col {target.col}</p>
                                            <p><span className="font-bold">Matrix:</span> {pos}</p>
                                        </>
                                    )}
                                </div>
                            );
                        }, [hoveredKey, selectedTarget, layerKeymap])}
                    </div>

                    <button
                        className="absolute bottom-0 right-0 p-4 focus:outline-none text-black hover:text-gray-600 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowInfoPanel(!showInfoPanel);
                        }}
                        title={showInfoPanel ? "Close Info" : "Show Key Info"}
                    >
                        <InfoIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};
