import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { svalService } from "../services/sval.service";
import { VialService, vialService } from "../services/vial.service";

import { fileService } from "../services/file.service";
import { keyService } from "../services/key.service";
import { qmkService } from "../services/qmk.service";
import { usbInstance } from "../services/usb.service";
import type { KeyboardInfo } from "../types/vial.types";
import { storage } from "../utils/storage";

interface VialContextType {
    keyboard: KeyboardInfo | null;
    setKeyboard: (keyboard: KeyboardInfo) => void;
    isConnected: boolean;
    isWebHIDSupported: boolean;
    loadedFrom: string | null;
    connect: (filters?: HIDDeviceFilter[]) => Promise<boolean>;
    disconnect: () => Promise<void>;
    loadKeyboard: () => Promise<void>;
    loadFromFile: (file: File) => Promise<void>;
    updateKey: (layer: number, row: number, col: number, keymask: number) => Promise<void>;
    updateTapDance: (tdid: number, overrideKeyboard?: KeyboardInfo) => Promise<void>;
    pollMatrix: () => Promise<boolean[][]>;
    lastHeartbeat: number;
}

const VialContext = createContext<VialContextType | undefined>(undefined);

export const VialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [keyboard, setKeyboard] = useState<KeyboardInfo | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loadedFrom, setLoadedFrom] = useState<string | null>(null);
    const [lastHeartbeat, setLastHeartbeat] = useState<number>(0);
    const isWebHIDSupported = VialService.isWebHIDSupported();
    useEffect(() => {
        console.log("keyboard changed", keyboard);
    }, [keyboard]);

    const connect = useCallback(async (filters?: HIDDeviceFilter[]) => {
        try {
            const defaultFilters = [
                { usagePage: 0xff60, usage: 0x61 },
                { usagePage: 0xff60, usage: 0x62 },
            ];
            const success = await usbInstance.open(filters || defaultFilters);
            if (success) {
                usbInstance.onDisconnect = () => {
                    console.log("Disconnect detected via listener");
                    setIsConnected(false);
                };
            }
            setIsConnected(success);
            console.log("connected success:", success);
            return success;
        } catch (error) {
            console.error("Failed to connect to keyboard:", error);
            return false;
        }
    }, []);

    const disconnect = useCallback(async () => {
        try {
            await usbInstance.close();
            setIsConnected(false);
        } catch (error) {
            console.error("Failed to disconnect:", error);
        }
    }, []);

    const loadKeyboard = useCallback(async () => {
        if (!usbInstance.isOpened) {
            console.log("loadKeyboard not connected");
            throw new Error("USB device not connected");
        }

        try {
            const kbinfo: KeyboardInfo = {
                rows: 0,
                cols: 0,
            };
            await vialService.init(kbinfo);
            const loadedInfo = await vialService.load(kbinfo);

            // Load QMK settings
            try {
                await qmkService.get(loadedInfo);
            } catch (error) {
                console.warn("Failed to load QMK settings:", error);
            }

            // Sync layer colors from physical keyboard to frontend (overriding cosmetics if needed)
            try {
                svalService.syncPhysicalColorsToCosmetic(loadedInfo);
            } catch (error) {
                console.warn("Failed to sync layer colors:", error);
            }

            setKeyboard(loadedInfo);
            // Set loadedFrom to device product name
            const deviceName = usbInstance.getDeviceName();
            setLoadedFrom(deviceName || loadedInfo.kbid || "Connected Device");
        } catch (error) {
            console.error("Failed to load keyboard:", error);
            throw error;
        }
    }, []);

    // Auto-load removed to allow UI to decide when to sync
    // useEffect(() => {
    //     if (isConnected) {
    //         loadKeyboard().catch((error) => {
    //             console.error("Failed to auto-load keyboard:", error);
    //             setIsConnected(false);
    //         });
    //     }
    // }, [isConnected, loadKeyboard]);

    const loadFromFile = useCallback(async (file: File) => {
        try {
            const kbinfo = await fileService.loadFile(file);
            svalService.setupCosmeticLayerNames(kbinfo);
            keyService.generateAllKeycodes(kbinfo);
            setKeyboard(kbinfo);
            const filePath = file.name;
            setLoadedFrom(filePath);
            storage.setLastFilePath(filePath);
            setIsConnected(false);
            await storage.saveFile(kbinfo).catch((err) => {
                console.error("Failed to save file:", err);
            });
        } catch (error) {
            console.error("Failed to load file:", error);
            throw error;
        }
    }, []);

    useEffect(() => {
        // On mount, try to load last saved file from localStorage
        const loadSavedFile = async () => {
            try {
                const savedContent = localStorage.getItem("keybard_saved_file");
                if (savedContent) {
                    const kbinfo = JSON.parse(savedContent) as KeyboardInfo;
                    svalService.setupCosmeticLayerNames(kbinfo);
                    keyService.generateAllKeycodes(kbinfo);
                    setKeyboard(kbinfo);
                    setLoadedFrom("Last Saved File");
                    setIsConnected(false);
                }
            } catch (error) {
                console.error("Failed to load saved file from storage:", error);
            }
        };
        loadSavedFile();
    }, []);

    const updateKey = useCallback(
        async (layer: number, row: number, col: number, keymask: number) => {
            if (!usbInstance.isOpened) {
                throw new Error("USB device not connected");
            }
            await vialService.updateKey(layer, row, col, keymask);
        },
        []
    );

    const updateTapDance = useCallback(
        async (tdid: number, overrideKeyboard?: KeyboardInfo) => {
            const kbToUse = overrideKeyboard || keyboard;
            if (!usbInstance.isOpened || !kbToUse) {
                 if (!usbInstance.isOpened) console.warn("Not connected, skipping hardware updateTapDance");
                 if (!usbInstance.isOpened) return;
            }
            if (kbToUse) {
                await vialService.updateTapdance(kbToUse, tdid);
            }
        },
        [keyboard]
    );

    const pollMatrix = useCallback(async () => {
        if (!keyboard || !isConnected) return [];
        const result = await vialService.pollMatrix(keyboard);
        setLastHeartbeat(Date.now());
        return result;
    }, [keyboard, isConnected]);

    const value: VialContextType = {
        keyboard,
        setKeyboard,
        isConnected,
        isWebHIDSupported,
        loadedFrom,
        connect,
        disconnect,
        loadKeyboard,
        loadFromFile,
        updateKey,
        updateTapDance,
        pollMatrix,
        lastHeartbeat,
    };

    return <VialContext.Provider value={value}>{children}</VialContext.Provider>;
};

export const useVial = (): VialContextType => {
    const context = useContext(VialContext);
    if (!context) {
        throw new Error("useVial must be used within a VialProvider");
    }
    return context;
};
