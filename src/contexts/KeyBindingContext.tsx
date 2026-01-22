import { KeyboardInfo } from "@/types/vial.types";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { MATRIX_COLS } from "@/constants/svalboard-layout";
import { useChanges } from "@/contexts/ChangesContext";
import { useSettings } from "@/contexts/SettingsContext";
import { keyService } from "@/services/key.service";
import { KEYBOARD_EVENT_MAP } from "@/utils/keyboard-mapper";
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
    macroId?: number;
    macroIndex?: number;
    // Add more as needed for other binding types
    isHover?: boolean;
    keycode?: string | number;
    label?: string;
    overrideId?: number;
    overrideSlot?: "trigger" | "replacement";
}


interface KeyBindingContextType {
    selectedTarget: BindingTarget | null;
    selectKeyboardKey: (layer: number, row: number, col: number) => void;
    selectComboKey: (comboId: number, slot: number) => void;
    selectTapdanceKey: (tapdanceId: number, slot: "tap" | "hold" | "doubletap" | "taphold") => void;
    selectMacroKey: (macroId: number, index: number) => void;
    selectOverrideKey: (overrideId: number, slot: "trigger" | "replacement") => void;
    assignKeycode: (keycode: number | string) => void;
    assignKeycodeTo: (target: BindingTarget, keycode: number | string) => void;
    swapKeys: (target1: BindingTarget, target2: BindingTarget) => void;
    clearSelection: () => void;
    isBinding: boolean;
    hoveredKey: BindingTarget | null;
    setHoveredKey: (target: BindingTarget | null) => void;
}


const KeyBindingContext = createContext<KeyBindingContextType | undefined>(undefined);

export const KeyBindingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { keyboard, setKeyboard, updateKey, updateTapDance } = useVial();
    const { queue } = useChanges();
    const [selectedTarget, setSelectedTarget] = useState<BindingTarget | null>(null);
    const [hoveredKey, setHoveredKey] = useState<BindingTarget | null>(null);
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

    const selectMacroKey = useCallback((macroId: number, index: number) => {
        setSelectedTarget({
            type: "macro",
            macroId,
            macroIndex: index,
        });
        setIsBinding(true);
    }, []);

    const selectOverrideKey = useCallback((overrideId: number, slot: "trigger" | "replacement") => {
        setSelectedTarget({
            type: "override",
            overrideId,
            overrideSlot: slot,
        });
        setIsBinding(true);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedTarget(null);
        setIsBinding(false);
    }, []);

    const assignKeycodeTo = useCallback(
        (target: BindingTarget, keycode: number | string) => {
            if (!target || !keyboard) return;
            const updatedKeyboard: KeyboardInfo = JSON.parse(JSON.stringify(keyboard));
            console.log("assignKeycodeTo called with", keycode, "for target", target);
            // Convert keycode string to number using keyService
            const keycodeValue = typeof keycode === "string" ? keyService.parse(keycode) : keycode;
            console.log("assignKeycode to keyboard", target, keycode, "->", keycodeValue);

            switch (target.type) {
                case "keyboard": {
                    const { layer, row, col } = target;
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
                    const { comboId, comboSlot } = target;
                    if (comboId === undefined || comboSlot === undefined) break;

                    // Ensure combos array exists
                    if (!updatedKeyboard.combos) {
                        updatedKeyboard.combos = [];
                    }

                    // Create a defensive copy of the entire combos array to preserve all combos
                    const originalCombos = keyboard.combos || [];
                    const combos = [...originalCombos];
                    updatedKeyboard.combos = combos;

                    // Get the ORIGINAL combo from the source keyboard to preserve existing values
                    const originalCombo = originalCombos[comboId];
                    const combo = combos[comboId];
                    if (!combo) break;

                    const keycodeName = typeof keycode === "string" ? keycode : `KC_${keycode}`;



                    if (comboSlot === 4) {
                        // Output - but we must also preserve the input keys!
                        const originalKeys = Array.isArray(originalCombo?.keys) ? originalCombo.keys : [];
                        combo.keys = [...originalKeys];
                        while (combo.keys.length < 4) combo.keys.push("KC_NO");

                        combo.output = keycodeName;
                    } else {
                        // Input keys - preserve all existing values from the ORIGINAL keyboard state
                        const originalKeys = Array.isArray(originalCombo?.keys) ? originalCombo.keys : [];

                        // Build a fresh 4-element array from the original state
                        const newKeys: string[] = [];
                        for (let i = 0; i < 4; i++) {
                            const val = originalKeys[i];
                            newKeys.push(typeof val === "string" && val ? val : "KC_NO");
                        }

                        // Now update just the target slot
                        newKeys[comboSlot] = keycodeName;
                        combo.keys = newKeys;
                    }

                    // Update the local state only. The ComboEditor component will handle queueing the change when the editor is closed.
                    // This aligns with the Macro editing behavior.
                    
                    break;
                }

                case "tapdance": {
                    const { tapdanceId, tapdanceSlot } = target;
                    if (tapdanceId === undefined || tapdanceSlot === undefined) break;

                    const tapdances = updatedKeyboard.tapdances;
                    if (!tapdances) break; // Should probably init if missing, but stricter check

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
                            await updateTapDance(tapdanceId, updatedKeyboard);
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

                case "macro": {
                    const { macroId, macroIndex } = target;
                    if (macroId === undefined || macroIndex === undefined) break;

                    const macros = updatedKeyboard.macros;
                    if (!macros || !macros[macroId]) break;

                    const action = macros[macroId].actions[macroIndex];
                    if (!action || !["tap", "down", "up"].includes(action[0])) break;

                    const keycodeName = typeof keycode === "string" ? keycode : `KC_${keycode}`;

                    // Update the value
                    macros[macroId].actions[macroIndex][1] = keycodeName;

                    break;
                }

                case "override": {
                    const { overrideId, overrideSlot } = target;
                    if (overrideId === undefined || overrideSlot === undefined) break;

                    const overrides = updatedKeyboard.key_overrides;
                    if (!overrides || !overrides[overrideId]) break;

                    // const previousValue = overrides[overrideId][overrideSlot];
                    const keycodeName = typeof keycode === "string" ? keycode : `KC_${keycode}`;
                    overrides[overrideId][overrideSlot] = keycodeName;

                    // Update local state only. OverrideEditor handles queueing on close.
                    
                    break;
                }
            }
            setKeyboard(updatedKeyboard);

            if (target === selectedTargetRef.current) {
                clearSelection();
            }
        },
        [keyboard, setKeyboard, clearSelection, queue]
    );

    const swapKeys = useCallback(
        (target1: BindingTarget, target2: BindingTarget) => {
            if (!keyboard) return;

            // Only support keyboard swaps for now, but structure allows extension
            if (target1.type !== "keyboard" || target2.type !== "keyboard") return;

            const { layer: layer1, row: row1, col: col1 } = target1;
            const { layer: layer2, row: row2, col: col2 } = target2;

            if (
                layer1 === undefined || row1 === undefined || col1 === undefined ||
                layer2 === undefined || row2 === undefined || col2 === undefined
            ) return;

            // Clone state ONCE
            const updatedKeyboard = JSON.parse(JSON.stringify(keyboard));
            if (!updatedKeyboard.keymap) updatedKeyboard.keymap = [];

            // Ensure layers exist
            if (!updatedKeyboard.keymap[layer1]) updatedKeyboard.keymap[layer1] = [];
            if (!updatedKeyboard.keymap[layer2]) updatedKeyboard.keymap[layer2] = [];

            const matrixPos1 = row1 * MATRIX_COLS + col1;
            const matrixPos2 = row2 * MATRIX_COLS + col2;

            // Get values from CLONED state (or original, same thing at start)
            const val1 = updatedKeyboard.keymap[layer1][matrixPos1] || 0;
            const val2 = updatedKeyboard.keymap[layer2][matrixPos2] || 0;

            console.log(`Swapping keys: [${layer1},${row1},${col1}](${val1}) <-> [${layer2},${row2},${col2}](${val2})`);

            // Swap values
            updatedKeyboard.keymap[layer1][matrixPos1] = val2;
            updatedKeyboard.keymap[layer2][matrixPos2] = val1;

            // Queue changes
            // Change 1: Target 1 gets Val 2
            queue(
                `key_${layer1}_${row1}_${col1}`,
                async () => {
                    console.log(`Committing swap change 1: Layer ${layer1}, Key [${row1},${col1}] → ${val2}`);
                    updateKey(layer1, row1, col1, val2);
                },
                {
                    type: "key",
                    layer: layer1,
                    row: row1,
                    col: col1,
                    keycode: val2,
                    previousValue: val1,
                }
            );

            // Change 2: Target 2 gets Val 1
            queue(
                `key_${layer2}_${row2}_${col2}`,
                async () => {
                    console.log(`Committing swap change 2: Layer ${layer2}, Key [${row2},${col2}] → ${val1}`);
                    updateKey(layer2, row2, col2, val1);
                },
                {
                    type: "key",
                    layer: layer2,
                    row: row2,
                    col: col2,
                    keycode: val1,
                    previousValue: val2,
                }
            );

            setKeyboard(updatedKeyboard);
            // Optionally clear selection if involved?
            // If dragging, we might want to clear.
            clearSelection();
        },
        [keyboard, setKeyboard, queue, clearSelection, updateKey]
    );

    const assignKeycode = useCallback(
        (keycode: number | string) => {
            if (selectedTargetRef.current) {
                assignKeycodeTo(selectedTargetRef.current, keycode);
            }
        },
        [assignKeycodeTo]
    );

    const { getSetting } = useSettings();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const typingBindsKey = getSetting("typing-binds-key");

            if (!typingBindsKey || !selectedTargetRef.current) return;

            // Ignore if user is typing in an input or textarea
            const target = event.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

            const qmkKeycode = KEYBOARD_EVENT_MAP[event.code];

            if (qmkKeycode) {
                event.preventDefault();
                event.stopPropagation();
                assignKeycode(qmkKeycode);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [assignKeycode, getSetting]);

    const value: KeyBindingContextType = {
        selectedTarget,
        selectKeyboardKey,
        selectComboKey,
        selectTapdanceKey,
        selectMacroKey,
        selectOverrideKey,
        assignKeycode,
        // Add assignKeycodeTo to interface
        assignKeycodeTo,
        swapKeys,
        clearSelection,
        isBinding,
        hoveredKey,
        setHoveredKey,
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
