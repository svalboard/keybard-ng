import React, { createContext, useCallback, useContext, useRef, useState } from "react";

import { MATRIX_COLS } from "@/constants/svalboard-layout";
import { useChanges } from "@/contexts/ChangesContext";
import { keyService } from "@/services/key.service";
import { useVial } from "./VialContext";

interface BindingTarget {
    type: "keyboard" | "combo" | "tapdance" | "macro" | "override";
    layer?: number;
    row?: number;
    col?: number;
    comboId?: number;
    comboSlot?: number; // 0-4 for combo keys
    tapdanceId?: number;
    tapdanceSlot?: "tap" | "hold" | "doubletap" | "taphold";
    // Add more as needed for other binding types
}

interface KeyBindingContextType {
    selectedTarget: BindingTarget | null;
    selectKeyboardKey: (layer: number, row: number, col: number) => void;
    selectComboKey: (comboId: number, slot: number) => void;
    selectTapdanceKey: (tapdanceId: number, slot: "tap" | "hold" | "doubletap" | "taphold") => void;
    assignKeycode: (keycode: number | string) => void;
    clearSelection: () => void;
    isBinding: boolean;
}

const KeyBindingContext = createContext<KeyBindingContextType | undefined>(undefined);

export const KeyBindingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { keyboard, setKeyboard, updateKey } = useVial();
    const { queue } = useChanges();
    const [selectedTarget, setSelectedTarget] = useState<BindingTarget | null>(null);
    const [isBinding, setIsBinding] = useState(false);

    // Use a ref to always have access to the current selectedTarget value
    const selectedTargetRef = useRef<BindingTarget | null>(null);

    // Keep the ref in sync with the state
    selectedTargetRef.current = selectedTarget;

    const selectKeyboardKey = useCallback(
        (layer: number, row: number, col: number) => {
            setSelectedTarget({
                type: "keyboard",
                layer,
                row,
                col,
            });
            console.log("selectKeyboardKey", layer, row, col);
            // print current keyboard value for the key
            if (keyboard && keyboard.keymap) {
                console.log("keyboard", keyboard?.keymap?.[layer]);
                const layerKeymap = keyboard.keymap?.[layer];
                console.log("layerKeymap", layerKeymap);
                if (layerKeymap) {
                    console.log("aaa");
                    const keyIndex = row * MATRIX_COLS + col;
                    console.log("keyIndex", keyIndex);
                    const keycode = layerKeymap[keyIndex];
                    console.log(`Current keycode at layer ${layer}, row ${row}, col ${col}:`, keycode);
                }
            }
            setIsBinding(true);
        },
        [keyboard]
    );

    const selectComboKey = useCallback((comboId: number, slot: number) => {
        setSelectedTarget({
            type: "combo",
            comboId,
            comboSlot: slot,
        });
        setIsBinding(true);
    }, []);

    const selectTapdanceKey = useCallback((tapdanceId: number, slot: "tap" | "hold" | "doubletap" | "taphold") => {
        setSelectedTarget({
            type: "tapdance",
            tapdanceId,
            tapdanceSlot: slot,
        });
        setIsBinding(true);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedTarget(null);
        setIsBinding(false);
    }, []);

    const assignKeycode = useCallback(
        (keycode: number | string) => {
            // Use the ref to get the current value
            const currentTarget = selectedTargetRef.current;
            if (!currentTarget || !keyboard) return;
            const updatedKeyboard = JSON.parse(JSON.stringify(keyboard));
            console.log("assignKeycode called with", keycode, "for target", currentTarget);
            // Convert keycode string to number using keyService
            const keycodeValue = typeof keycode === "string" ? keyService.parse(keycode) : keycode;
            console.log("assignKeycode to keyboard", currentTarget, keycode, "->", keycodeValue);

            switch (currentTarget.type) {
                case "keyboard": {
                    const { layer, row, col } = currentTarget;
                    if (layer === undefined || row === undefined || col === undefined) break;

                    const matrixPos = row * MATRIX_COLS + col;
                    if (!updatedKeyboard.keymap) updatedKeyboard.keymap = [];
                    if (!updatedKeyboard.keymap[layer]) updatedKeyboard.keymap[layer] = [];

                    // Store previous value for potential rollback
                    const previousValue = updatedKeyboard.keymap[layer][matrixPos];

                    updatedKeyboard.keymap[layer][matrixPos] = keycodeValue;

                    // Queue the change with callback
                    const changeDesc = `key_${layer}_${row}_${col}`;
                    queue(
                        changeDesc,
                        async () => {
                            // This callback will be executed when committing changes
                            // For now, it's a placeholder for future hardware sync
                            console.log(`Committing key change: Layer ${layer}, Key [${row},${col}] → ${keycodeValue}`);
                            updateKey(layer, row, col, keycodeValue);
                        },
                        {
                            type: "key",
                            layer,
                            row,
                            col,
                            keycode: keycodeValue,
                            previousValue,
                        }
                    );

                    break;
                }

                case "combo": {
                    const { comboId, comboSlot } = currentTarget;
                    if (comboId === undefined || comboSlot === undefined) break;

                    // combos is actually an array of arrays with 5 string elements
                    const combos = (updatedKeyboard as any).combos;
                    if (!combos) break;
                    if (!combos[comboId]) {
                        combos[comboId] = ["KC_NO", "KC_NO", "KC_NO", "KC_NO", "KC_NO"];
                    }

                    // Store previous value
                    const previousValue = combos[comboId][comboSlot];

                    // Convert keycode to keycode name string
                    const keycodeName = typeof keycode === "string" ? keycode : `KC_${keycode}`;
                    combos[comboId][comboSlot] = keycodeName;

                    // Queue the change with callback
                    const changeDesc = `combo_${comboId}_${comboSlot}`;
                    queue(
                        changeDesc,
                        async () => {
                            console.log(`Committing combo change: Combo ${comboId}, Slot ${comboSlot} → ${keycodeName}`);
                        },
                        {
                            type: "combo",
                            comboId,
                            comboSlot,
                            keycode: keycodeValue,
                            previousValue,
                        }
                    );

                    break;
                }

                case "tapdance": {
                    const { tapdanceId, tapdanceSlot } = currentTarget;
                    if (tapdanceId === undefined || tapdanceSlot === undefined) break;

                    // tapdance is actually an array with objects having tap/hold/doubletap/taphold properties
                    const tapdances = (updatedKeyboard as any).tapdances;
                    if (!tapdances) break;
                    if (!tapdances[tapdanceId]) {
                        tapdances[tapdanceId] = {
                            tap: "KC_NO",
                            hold: "KC_NO",
                            doubletap: "KC_NO",
                            taphold: "KC_NO",
                            tapms: 200,
                            tdid: tapdanceId,
                        };
                    }

                    // Store previous value
                    const previousValue = tapdances[tapdanceId][tapdanceSlot];

                    const keycodeName = typeof keycode === "string" ? keycode : `KC_${keycode}`;
                    tapdances[tapdanceId][tapdanceSlot] = keycodeName;

                    // Queue the change with callback
                    const changeDesc = `tapdance_${tapdanceId}_${tapdanceSlot}`;
                    queue(
                        changeDesc,
                        async () => {
                            console.log(`Committing tapdance change: Tapdance ${tapdanceId}, ${tapdanceSlot} → ${keycodeName}`);
                        },
                        {
                            type: "tapdance",
                            tapdanceId,
                            tapdanceSlot,
                            keycode: keycodeValue,
                            previousValue,
                        }
                    );

                    break;
                }
            }

            setKeyboard(updatedKeyboard);
            clearSelection();
        },
        [keyboard, setKeyboard, clearSelection, queue]
    );

    const value: KeyBindingContextType = {
        selectedTarget,
        selectKeyboardKey,
        selectComboKey,
        selectTapdanceKey,
        assignKeycode,
        clearSelection,
        isBinding,
    };

    return <KeyBindingContext.Provider value={value}>{children}</KeyBindingContext.Provider>;
};

export const useKeyBinding = (): KeyBindingContextType => {
    const context = useContext(KeyBindingContext);
    if (!context) {
        throw new Error("useKeyBinding must be used within a KeyBindingProvider");
    }
    return context;
};
