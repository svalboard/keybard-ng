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
    const { internationalLayout } = useLayoutSettings();
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
                            selected={isKeySelected(row, col)}
                            onClick={handleKeyClick}
                            keyContents={keyContents}
                            layerColor={keyLayerColor}
                            headerClassName={keyHeaderClassFull}
                            hoverBackgroundColor={keyHoverBg}
                            hoverBorderColor={keyHoverBorder}
                            hoverLayerColor={keyHoverLayerColor}
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
                                    <p>
                                        <span className="font-bold">Position:</span> Row {displayRow}, Col {displayCol}
                                    </p>
                                    <p>
                                        <span className="font-bold">Matrix:</span> {displayMatrix}
                                    </p>
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
