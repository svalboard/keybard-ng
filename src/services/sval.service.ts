import { VialUSB, usbInstance } from "./usb.service";

// Svalboard-specific protocol service

import { hsvToRgb, shouldSyncColor, findClosestFrontendColor, calculateHsvDistance, colorsToHsv } from "@/utils/layers";
import type { KeyboardInfo } from "../types/vial.types";

export class SvalService {
    private static readonly SVAL_IDENTIFIER = 0xee;
    private static readonly GET_PROTO_VERSION = 0x01;
    private static readonly GET_FIRMWARE_VERSION = 0x02;
    private static readonly LAYER_COLOR_GET = 0x10;
    private static readonly LAYER_COLOR_SET = 0x11;

    private usb: VialUSB;

    constructor(usb: VialUSB) {
        this.usb = usb;
    }

    private async send(param: number, args: number[], options?: any): Promise<any> {
        return this.usb.send(SvalService.SVAL_IDENTIFIER, [param, ...args], options);
    }

    async check(kbinfo: KeyboardInfo): Promise<boolean> {
        try {
            const check = (await this.send(SvalService.GET_PROTO_VERSION, [], {
                unpack: "BBBB<I",
            })) as (number | bigint)[];

            // Check for "sval" identifier
            const code = "sval";
            if (check[0] === code.charCodeAt(0) && check[1] === code.charCodeAt(1) && check[2] === code.charCodeAt(2) && check[3] === code.charCodeAt(3)) {
                kbinfo.sval_proto = check[4] as number;

                // Get firmware version
                const version = (await this.send(SvalService.GET_FIRMWARE_VERSION, [], {
                    uint8: true,
                })) as Uint8Array;

                const decoder = new TextDecoder();
                kbinfo.sval_firmware = decoder.decode(version).replace(/\x00/g, "");

                return true;
            }
        } catch (error) {
            console.log("Sval protocol not supported:", error);
        }

        kbinfo.sval_proto = 0;
        return false;
    }

    async pull(kbinfo: KeyboardInfo): Promise<void> {
        if (!kbinfo.sval_proto || kbinfo.sval_proto < 1) {
            return;
        }

        const layer_colors: Array<{ hue: number; sat: number; val: number }> = [];

        for (let i = 0; i < (kbinfo.layers || 16); i++) {
            try {
                const hsv = (await this.send(SvalService.LAYER_COLOR_GET, [i], {
                    unpack: "BBB",
                })) as number[];

                layer_colors[i] = {
                    hue: hsv[0],
                    sat: hsv[1],
                    val: hsv[2],
                };
                console.log("rgb", hsvToRgb(hsv[0], hsv[1], hsv[2]));
            } catch (error) {
                // Layer might not exist, continue
                layer_colors[i] = { hue: 0, sat: 0, val: 0 };
            }
        }
        console.log(layer_colors);

        kbinfo.layer_colors = layer_colors;
    }

    async setLayerColor(layer: number, hue: number, sat: number, val: number): Promise<void> {
        await this.send(SvalService.LAYER_COLOR_SET, [layer, hue, sat, val]);
    }

    /**
     * Set default cosmetic layer names if not present
     */
    setupCosmeticLayerNames(kbinfo: KeyboardInfo): void {
        if (!kbinfo.cosmetic) {
            kbinfo.cosmetic = {
                layer: {
                    "0": "default",
                    "4": "NAS",
                    "5": "Fn Keys",
                    "15": "Mouse",
                },
            };
        } else if (!kbinfo.cosmetic.layer) {
            kbinfo.cosmetic.layer = {
                "0": "default",
                "4": "NAS",
                "5": "Fn Keys",
                "15": "Mouse",
            };
        }
    }

    /**
     * Get the display name for a layer
     */
    getLayerName(kbinfo: KeyboardInfo, layerIndex: number): string {
        if (kbinfo.cosmetic?.layer?.[layerIndex.toString()]) {
            return kbinfo.cosmetic.layer[layerIndex.toString()];
        }
        return `Layer ${layerIndex}`;
    }

    getLayerCosmetic(kbinfo: KeyboardInfo, layerIndex: number): string | undefined {
        return kbinfo.cosmetic?.layer?.[layerIndex.toString()];
    }

    getLayerNameNoLabel(kbinfo: KeyboardInfo, layerIndex: number): string {
        if (kbinfo.cosmetic?.layer?.[layerIndex.toString()]) {
            return kbinfo.cosmetic.layer[layerIndex.toString()];
        }
        return `${layerIndex}`;
    }

    /**
     * Synchronize physical keyboard colors to frontend cosmetic colors
     * Only syncs when colors are sufficiently different (threshold-based)
     * Overrides custom cosmetics when threshold is met
     */
    syncPhysicalColorsToCosmetic(keyboard: KeyboardInfo): void {
        if (!keyboard.layer_colors || !keyboard.sval_proto) {
            console.log("Skipping color sync - no layer colors or Svalboard protocol");
            return;
        }
        
        // Initialize cosmetic if not present
        if (!keyboard.cosmetic) keyboard.cosmetic = { layer: {}, layer_colors: {} };
        if (!keyboard.cosmetic.layer_colors) keyboard.cosmetic.layer_colors = {};
        
        console.log("Starting layer color synchronization...");
        
        for (let layerIndex = 0; layerIndex < keyboard.layer_colors.length; layerIndex++) {
            const physicalHsvRaw = keyboard.layer_colors[layerIndex];
            const physicalHsv = {
                h: physicalHsvRaw.hue,
                s: physicalHsvRaw.sat,
                v: physicalHsvRaw.val
            };
            const currentColor = keyboard.cosmetic.layer_colors[layerIndex.toString()] || "green";
            
            // Only sync if colors are sufficiently different
            if (shouldSyncColor(physicalHsv, currentColor)) {
                const closestColor = findClosestFrontendColor(physicalHsv);
                keyboard.cosmetic.layer_colors[layerIndex.toString()] = closestColor;
                
                const closestHsv = colorsToHsv[closestColor as keyof typeof colorsToHsv];
                const distance = calculateHsvDistance(physicalHsv, {
                    h: closestHsv.hue,
                    s: closestHsv.sat,
                    v: closestHsv.val
                });
                console.log(`Layer ${layerIndex}: Synced ${currentColor} → ${closestColor} (distance: ${distance.toFixed(1)})`);
            } else {
                const currentHsv = colorsToHsv[currentColor as keyof typeof colorsToHsv];
                const distance = calculateHsvDistance(physicalHsv, {
                    h: currentHsv.hue,
                    s: currentHsv.sat,
                    v: currentHsv.val
                });
                console.log(`Layer ${layerIndex}: No sync needed (${currentColor} already close, distance: ${distance.toFixed(1)})`);
            }
        }
        
        console.log("Layer color synchronization completed");
    }
}

export const svalService = new SvalService(usbInstance);
