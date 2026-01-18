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

                    // CRITICAL: Ensure combos array exists and is properly copied
                    if (!(updatedKeyboard as any).combos) {
                        (updatedKeyboard as any).combos = [];
                    }

                    // Create a defensive copy of the entire combos array to preserve all combos
                    const originalCombos = (keyboard as any)?.combos || [];
                    const combos = Array.isArray(originalCombos) ? [...originalCombos] : [];
                    (updatedKeyboard as any).combos = combos;

                    // Get the ORIGINAL combo from the source keyboard to preserve existing values
                    const originalCombo = originalCombos[comboId];
                    const combo = combos[comboId];
                    if (!combo) break;

                    const keycodeName = typeof keycode === "string" ? keycode : `KC_${keycode}`;



                    if (comboSlot === 4) {
                        // Output - but we must also preserve the input keys!
                        // CRITICAL: Preserve the keys array from the original combo
                        const originalKeys = Array.isArray(originalCombo?.keys) ? originalCombo.keys : [];
                        combo.keys = [...originalKeys];
                        while (combo.keys.length < 4) combo.keys.push("KC_NO");

                        combo.output = keycodeName;

                        console.log("combo update debug (output): preserved keys", combo.keys);
                    } else {
                        // Input keys - preserve all existing values from the ORIGINAL keyboard state
                        // CRITICAL: Check if keys is actually an array, not the prototype's keys() function
                        const originalKeys = Array.isArray(originalCombo?.keys) ? originalCombo.keys : [];

                        console.log("combo update debug: originalKeys", originalKeys, "comboId", comboId, "slot", comboSlot);

                        // Build a fresh 4-element array from the original state
                        const newKeys: string[] = [];
                        for (let i = 0; i < 4; i++) {
                            const val = originalKeys[i];
                            newKeys.push(typeof val === "string" && val ? val : "KC_NO");
                        }

                        // Now update just the target slot
                        newKeys[comboSlot] = keycodeName;
                        combo.keys = newKeys;

                        console.log("combo update debug: newKeys after", combo.keys);
                    }

                    // Update the local state only. The ComboEditor component will handle queueing the change when the editor is closed.
                    // This aligns with the Macro editing behavior.
                    
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
                    const { macroId, macroIndex } = currentTarget;
                    if (macroId === undefined || macroIndex === undefined) break;

                    const macros = updatedKeyboard.macros;
                    if (!macros || !macros[macroId]) break;

                    // macros[macroId].actions is an array of [type, value]
                    // e.g. ["down", "KC_A"]
                    // We only support assigning keycodes to tap/down/up actions
                    const action = macros[macroId].actions[macroIndex];
                    if (!action || !["tap", "down", "up"].includes(action[0])) break;

                    // const previousValue = action[1];
                    const keycodeName = typeof keycode === "string" ? keycode : `KC_${keycode}`;

                    // Update the value
                    macros[macroId].actions[macroIndex][1] = keycodeName;

                    // Queue change? Macros might be complex to queue individually if the whole macro is an object.
                    // For now, let's just update the keyboard state, similar to how MacroEditor handles it locally, but via queue if possible.
                    // But here we are updating one action.

                    // Note: MacroEditor saves the *entire* macro object. 
                    // To be consistent with other bindings, we should queue it.
                    // But the backend API probably expects the full macro definiton.

                    // Let's assume queue() handles this or we just setKeyboard to trigger the save in MacroEditor?
                    // Actually, if we use queue(), we need a way to commit it.
                    // For now, let's stick to updating the local state and letting the UI react.
                    // However, assigning a keycode is a "user action" that should probably persist.

                    // Since MacroEditor has its own persistence logic (useEffect on actions), 
                    // simply updating 'keyboard' here might be enough IF MacroEditor picks it up.
                    // But wait, assignKeycode calls 'updateKey' for keyboard, but for others?
                    // It seems the queue mechanics are specific.

                    // Let's just update the keyboard object for now. The generic "setKeyboard" at the end triggers React updates.

                    break;
                }

                case "override": {
                    const { overrideId, overrideSlot } = currentTarget;
                    if (overrideId === undefined || overrideSlot === undefined) break;

                    const overrides = updatedKeyboard.key_overrides;
                    if (!overrides || !overrides[overrideId]) break;

                    const previousValue = overrides[overrideId][overrideSlot];
                    const keycodeName = typeof keycode === "string" ? keycode : `KC_${keycode}`;
                    overrides[overrideId][overrideSlot] = keycodeName;

                    // Queue the change with callback
                    const changeDesc = `override_${overrideId}_${overrideSlot}`;
                    queue(
                        changeDesc,
                        async () => {
                            console.log(`Committing override change: Override ${overrideId}, ${overrideSlot} → ${keycodeName}`);
                        },
                        {
                            type: "override",
                            overrideId,
                            overrideSlot,
                            keycode: keycodeValue,
                            previousValue,
                        } as any
                    );

                    break;
                }
            }
            setKeyboard(updatedKeyboard);
            clearSelection();
        },
        [keyboard, setKeyboard, clearSelection, queue]
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
