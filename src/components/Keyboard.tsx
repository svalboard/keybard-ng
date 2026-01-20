import "./Keyboard.css";

import { getKeyLabel, getKeycodeName } from "@/utils/layers";
import React from "react";
import { MATRIX_COLS, SVALBOARD_LAYOUT, UNIT_SIZE } from "../constants/svalboard-layout";

import { useKeyBinding } from "@/contexts/KeyBindingContext";
import type { KeyboardInfo } from "../types/vial.types";
import { Key } from "./Key";
import { useLayoutSettings } from "@/contexts/LayoutSettingsContext";
import { getLabelForKeycode } from "./Keyboards/layouts";
import { headerClasses, hoverHeaderClasses, hoverBackgroundClasses, hoverBorderClasses } from "@/utils/colors";
import { InfoIcon } from "./icons/InfoIcon";
import { usePanels } from "@/contexts/PanelsContext";

interface KeyboardProps {
    keyboard: KeyboardInfo;
    onKeyClick?: (layer: number, row: number, col: number) => void;
    selectedLayer: number;
    setSelectedLayer: (layer: number) => void;
}

// Fix unused var warning
export const Keyboard: React.FC<KeyboardProps> = ({ keyboard, selectedLayer }) => {
    const { selectKeyboardKey, selectedTarget, clearSelection, hoveredKey, assignKeycode } = useKeyBinding();
    const { activePanel, itemToEdit } = usePanels();
    const [showInfoPanel, setShowInfoPanel] = React.useState(false);

    const isTransmitting = itemToEdit !== null && ["tapdances", "combos", "macros", "overrides"].includes(activePanel || "");

    // Ref to store the selection before entering transmitting mode
    const savedSelection = React.useRef<{ layer: number; row: number; col: number } | null>(null);

    React.useEffect(() => {
        if (isTransmitting) {
            // Entering transmitting mode
            if (selectedTarget?.type === "keyboard" && typeof selectedTarget.row === "number" && typeof selectedTarget.col === "number") {
                savedSelection.current = {
                    layer: selectedTarget.layer ?? selectedLayer,
                    row: selectedTarget.row,
                    col: selectedTarget.col,
                };
                clearSelection();
            }
        } else {
            // Exiting transmitting mode
            if (savedSelection.current) {
                const { layer, row, col } = savedSelection.current;
                selectKeyboardKey(layer, row, col);
                savedSelection.current = null;
            }
        }
    }, [isTransmitting]); // Depend on isTransmitting to trigger transitions

    // React.useEffect(() => {
    //     if (selectedTarget) {
    //         setShowInfoPanel(true);
    //     }
    // }, [selectedTarget]);
    // }, [selectedTarget]);
    const { internationalLayout, keyVariant } = useLayoutSettings();
    const currentUnitSize = keyVariant === 'small' ? 30 : keyVariant === 'medium' ? 45 : UNIT_SIZE;

    // Use a unit-based offset for the thumb cluster so it scales with key size
    // 12px at 40px/unit = 0.3u
    const THUMB_OFFSET_U = 0.3;

    const layerColor = keyboard.cosmetic?.layer_colors?.[selectedLayer] || "primary";
    const headerClass = headerClasses[layerColor] || headerClasses["primary"];
    const hoverHeaderClass = hoverHeaderClasses[layerColor] || hoverHeaderClasses["primary"];
    // Get the keymap for the selected layer
    const layerKeymap = keyboard.keymap?.[selectedLayer] || [];

    // Check if this key is the globally selected target
    const isKeySelected = (row: number, col: number) => {
        return selectedTarget?.type === "keyboard" && selectedTarget.layer === selectedLayer && selectedTarget.row === row && selectedTarget.col === col;
    };

    const handleKeyClick = (row: number, col: number) => {
        // If in transmitting mode, send the key's value to the selected target
        if (isTransmitting) {
            const pos = row * MATRIX_COLS + col;
            const keycode = layerKeymap[pos] || 0;
            const keycodeName = getKeycodeName(keycode);
            assignKeycode(keycodeName);
            return;
        }

        // if key is already selected, deselect it
        if (isKeySelected(row, col)) {
            clearSelection();
            return;
        }
        selectKeyboardKey(selectedLayer, row, col);
    };

    // Handle Delete/Backspace for selected key
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Delete" || e.key === "Backspace") {
                if (selectedTarget?.type === "keyboard" && selectedTarget.layer === selectedLayer && typeof selectedTarget.row === 'number') {
                    assignKeycode("KC_NO");
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedTarget, selectedLayer, assignKeycode]);

    const CLUSTER_BACKGROUNDS = [
        // Left Cluster
        { x: 7.1, y: 4.9, w: 2.2, h: 1.2 }, // Outer Top (Key 1)
        { x: 7.1, y: 6.2, w: 2.2, h: 1.2 }, // Outer Bottom (Key 2)
        { x: 9.4, y: 4.9, w: 1.2, h: 2.5 }, // Middle (Key 3/4 - Continuous)
        { x: 10.7, y: 4.9, w: 1.2, h: 1.2 }, // Inner Top (Key 5)
        { x: 10.7, y: 6.2, w: 1.2, h: 1.2 }, // Inner Bottom (Key 6)

        // Right Cluster
        { x: 13.1, y: 4.9, w: 1.2, h: 1.2 }, // Inner Top (Key 5)
        { x: 13.1, y: 6.2, w: 1.2, h: 1.2 }, // Inner Bottom (Key 6)
        { x: 14.4, y: 4.9, w: 1.2, h: 2.5 }, // Middle (Key 3/4 - Continuous)
        { x: 15.7, y: 4.9, w: 2.2, h: 1.2 }, // Outer Top (Key 1)
        { x: 15.7, y: 6.2, w: 2.2, h: 1.2 }, // Outer Bottom (Key 2)
    ];

    // Calculate the keyboard dimensions for the container
    const calculateKeyboardSize = () => {
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
    };

    const { width, height } = calculateKeyboardSize();

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="keyboard-layout" style={{ width: `${width}px`, height: `${height}px` }}>
                {/* Cluster Backgrounds */}
                {CLUSTER_BACKGROUNDS.map((bg: any, j) => (
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
                {Object.entries(SVALBOARD_LAYOUT).map(([matrixPos, layout]) => {
                    const pos = Number(matrixPos);
                    const row = Math.floor(pos / MATRIX_COLS);
                    const col = pos % MATRIX_COLS;

                    // Get the keycode for this position in the current layer
                    const keycode = layerKeymap[pos] || 0;
                    const { label: defaultLabel, keyContents } = getKeyLabel(keyboard, keycode);
                    const keycodeName = getKeycodeName(keycode);

                    // Try to get international label
                    const internationalLabel = getLabelForKeycode(getKeycodeName(keycode), internationalLayout);
                    const label = internationalLabel || defaultLabel;

                    // Calculate transmitting style overrides
                    let keyLayerColor = layerColor;
                    let keyHeaderClassFull = `${headerClass} ${hoverHeaderClass}`;
                    let keyHoverBg = undefined;
                    let keyHoverBorder = undefined;
                    let keyHoverLayerColor = undefined;

                    if (isTransmitting) {
                        keyLayerColor = "sidebar";
                        keyHeaderClassFull = `bg-kb-sidebar-dark ${hoverHeaderClass}`;

                        // Use original layer color for hover states
                        keyHoverBg = hoverBackgroundClasses[layerColor];
                        keyHoverBorder = hoverBorderClasses[layerColor];
                        keyHoverLayerColor = layerColor;
                    }

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
                            layerColor={keyLayerColor}
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

            {/* Permanent Info Panel Container */}
            {/* Expandable Info Panel */}
            <div className="absolute bottom-5 right-5 z-50 flex items-end justify-end">
                <div
                    className={`bg-white text-black shadow-lg transition-all duration-300 ease-in-out relative flex flex-col overflow-hidden ${showInfoPanel
                        ? "w-[250px] h-[100px] rounded-2xl p-4 cursor-default"
                        : "w-12 h-12 rounded-2xl cursor-pointer hover:bg-gray-50 bg-white"
                        }`}
                    onClick={(e) => {
                        if (!showInfoPanel) {
                            e.stopPropagation();
                            setShowInfoPanel(true);
                        }
                    }}
                >
                    {/* Content Area - Only visible when open */}
                    <div
                        className={`w-full transition-opacity duration-200 delay-100 ${showInfoPanel ? "opacity-100 visible" : "opacity-0 invisible h-0 overflow-hidden"
                            }`}
                    >
                        {(hoveredKey || selectedTarget) ? (() => {
                            const target = hoveredKey || selectedTarget;
                            // Calculate display values
                            let displayRow = target?.row ?? "?";
                            let displayCol = target?.col ?? "?";
                            let displayMatrix = (typeof target?.row === 'number' && typeof target?.col === 'number')
                                ? (target.row * MATRIX_COLS + target.col)
                                : "?";

                            let displayKeycode = target?.keycode;
                            if (!displayKeycode && target?.type === 'keyboard' && typeof target?.row === 'number' && typeof target?.col === 'number') {
                                displayKeycode = getKeycodeName(layerKeymap[(target.row * MATRIX_COLS) + target.col] || 0);
                            }
                            return (
                                <div className="text-sm space-y-1">
                                    <p>
                                        <span className="font-bold">Keycode:</span> {displayKeycode || "?"}
                                    </p>
                                    {(target?.row !== -1 || target?.col !== -1) && (
                                        <>
                                            <p>
                                                <span className="font-bold">Position:</span> Row {displayRow}, Col {displayCol}
                                            </p>
                                            <p>
                                                <span className="font-bold">Matrix:</span> {displayMatrix}
                                            </p>
                                        </>
                                    )}
                                </div>
                            );
                        })() : (
                            <div className="flex items-center justify-center h-[68px] pr-8">
                                <p className="text-gray-300 italic text-sm text-center">No key selected</p>
                            </div>
                        )}
                    </div>

                    {/* Toggle Button/Icon - Anchored bottom right */}
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
