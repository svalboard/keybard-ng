import type { KeyboardInfo } from "../types/vial.types";
import { keyService } from "./key.service";
import { KleService } from "./kle.service";

// Default template for KBINFO if needed (simplified from SVALBOARD)
const DEFAULT_KB_INFO: any = {
    cols: 6,
    combo_count: 50,
    combos: [],
    key_override_count: 30,
    key_overrides: [],
    macro_count: 16,
    macros: [],
    tapdance_count: 10,
    tapdances: [],
    layers: 4,
    rows: 4,
    keymap: [],
    filters: [],
    // Add other default fields as necessary based on SVALBOARD
    settings: {} as any,
    uid: "0",
    name: "Unknown",
    layout_options: -1
};

export class FileService {
    private static readonly MAX_FILE_SIZE = 1048576; // 1MB
    private kleService: KleService;

    constructor() {
        this.kleService = new KleService();
    }

    async loadFile(file: File): Promise<KeyboardInfo> {
        await this.validateFile(file);
        const content = await this.readFile(file);
        return this.parseKbiFile(content);
    }

    private async validateFile(file: File): Promise<void> {
        if (file.size > FileService.MAX_FILE_SIZE) {
            throw new Error("File too large");
        }
    }

    private async readFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                if (event.target?.result) {
                    resolve(event.target.result as string);
                } else {
                    reject(new Error("Failed to read file"));
                }
            };

            reader.onerror = () => {
                reject(new Error("Failed to read file"));
            };

            reader.readAsText(file);
        });
    }

    private parseKbiFile(content: string): KeyboardInfo {
        let parsed: unknown;

        try {
            parsed = JSON.parse(content);
        } catch {
            throw new Error("Invalid JSON");
        }

        // Type guard to check if parsed object has required fields
        if (!this.isValidKeyboardInfo(parsed)) {
            throw new Error("Invalid file");
        }

        // Convert string keycodes to numbers if present
        this.normalizeKeymap(parsed);

        return parsed;
    }

    private normalizeKeymap(kbinfo: KeyboardInfo): void {
        // If keymap exists and has string values, convert them to numbers
        if (kbinfo.keymap && Array.isArray(kbinfo.keymap)) {
            kbinfo.keymap = kbinfo.keymap.map((layer) => {
                if (Array.isArray(layer)) {
                    return layer.map((keycode) => {
                        // If it's a string, parse it to a number
                        if (typeof keycode === "string") {
                            return keyService.parse(keycode);
                        }
                        // If it's already a number, keep it
                        return keycode;
                    });
                }
                return layer;
            });
        }
    }

    private isValidKeyboardInfo(obj: unknown): obj is KeyboardInfo {
        if (typeof obj !== "object" || obj === null) {
            return false;
        }

        const candidate = obj as Record<string, unknown>;

        // Check required fields
        if (typeof candidate.rows !== "number" || typeof candidate.cols !== "number") {
            return false;
        }

        return true;
    }

    async downloadVIL(kbinfo: KeyboardInfo, includeMacros: boolean = true): Promise<void> {
        const vil = this.kbinfoToVIL(structuredClone(kbinfo), includeMacros);
        await this.downloadTEXT(vil, {
            suggestedName: includeMacros ? 'keyboard.vil' : 'keyboard-nomacro.vil',
            types: [{
                description: 'Vial .vil files',
                accept: {
                    'text/vial': ['.vil'],
                },
            }],
        });
    }

    async downloadKBI(kbinfo: KeyboardInfo, includeMacros: boolean = true): Promise<void> {
        const copy = structuredClone(kbinfo);

        // Ensure keylayout exists
        if (!(copy as any).keylayout && copy.payload?.layouts?.keymap) {
            try {
                (copy as any).keylayout = this.kleService.deserializeToKeylayout(copy, copy.payload.layouts.keymap as unknown as any[]);
            } catch (e) {
                console.warn("Could not generate keylayout for export", e);
            }
        }
        if (!includeMacros && copy.macros) {
            // Clear macros
            copy.macros = copy.macros.map((_m, mid: number) => ({ mid: mid, actions: [] }));
        }

        if (copy.keymap) {
            (copy as any).keymap = copy.keymap.map(layer =>
                layer.map(keycode => keyService.stringify(keycode))
            );
        }

        const kbi = JSON.stringify(copy, undefined, 2);
        await this.downloadTEXT(kbi, {
            suggestedName: includeMacros ? 'keyboard.kbi' : 'keyboard-nomacro.kbi',
            types: [{
                description: 'Keybard .kbi files',
                accept: {
                    'text/vial': ['.kbi'],
                },
            }],
        });
    }

    async downloadKeymapH(_kbinfo: KeyboardInfo): Promise<void> {
        // TODO: Implement kbinfoToCKeymap logic here or import it if available
        // For now, leaving as placeholder or assuming global exists (which we should avoid)
        // const content = kbinfoToCKeymap(kbinfo);
        // await this.downloadTEXT(content, { ... });
        console.warn("downloadKeymapH not fully migrated yet");
    }

    private async downloadTEXT(content: string, opts: any) {
        try {
            if ((window as any).showSaveFilePicker) {
                const handle = await (window as any).showSaveFilePicker(opts);
                const writable = await handle.createWritable();
                const blob = new Blob([content], { type: 'text/plain' });
                await writable.write(blob);
                await writable.close();
            } else {
                // Fallback
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', opts.suggestedName || 'download.txt');
                link.setAttribute('target', '_blank');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (err) {
            console.error("Error saving file", err);
        }
    }

    // --- Upload Logic ---

    async uploadFile(file: File): Promise<KeyboardInfo> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const content = evt.target?.result as string;
                    if (!content) return reject("Empty file");
                    const parsed = this.parseContent(content);
                    resolve(parsed);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject("Error reading file");
            reader.readAsText(file);
        });
    }

    parseContent(content: string): KeyboardInfo {
        const js = JSON.parse(content);
        let kbinfo: KeyboardInfo | null = null;

        if (js.kbid) {
            // It's a .kbi (raw KBINFO)
            kbinfo = js as KeyboardInfo;
        } else if (js.uid) {
            // It's a .vil
            kbinfo = this.vilToKBINFO(js);
        } else {
            throw new Error('Unknown json type');
        }

        // Deserialize layout using KLE logic
        // We assume convertVIL layout to keymap handled key codes, 
        // but we might need to populate 'keylayout' for UI.
        // In the original code: kbinfo.keylayout = KLE.deserializeToKeylayout(kbinfo, kbinfo.payload.layouts.keymap);
        // We need to implement deserializeToKeylayout.

        // This part depends on where 'payload.layouts.keymap' comes from. 
        // In .vil upload, standard .vil doesn't have QMK payload. 
        // .kbi usually does.

        if (kbinfo.payload?.layouts?.keymap) {
            kbinfo.keylayout = this.deserializeToKeylayout(kbinfo, kbinfo.payload.layouts.keymap as any);
        }

        // Normalize keycodes (string -> number) if necessary
        this.normalizeKeymap(kbinfo);

        return kbinfo;
    }

    // --- Conversion Logic ---

    kbinfoToVIL(kbinfo: KeyboardInfo, includeMacros: boolean): string {
        let macros: any[];
        if (includeMacros && kbinfo.macros) {
            macros = (kbinfo.macros as any).map((macro: any) => macro.actions);
        } else {
            macros = new Array(kbinfo.macro_count).fill([]);
        }

        const kbidrepl = "BiGKBidGoesHere";
        const vil: any = {
            combo: kbinfo.combos,
            encoder_layout: new Array(16).fill([]), // TODO: check encoder count
            key_override: (kbinfo.key_overrides as any)?.map((ko: any) => {
                const { ...rest } = ko;
                // @ts-ignore
                delete rest.koid;
                return rest;
            }) || [],
            layout_options: -1,
            macro: macros,
            settings: kbinfo.settings,
            tap_dance: (kbinfo.tapdances as any)?.map((td: any) => [td.tap, td.hold, td.doubletap, td.taphold, td.tapms]) || [],
            uid: kbidrepl,
            version: 1,
            via_protocol: 9,
            vial_protocol: 6,
        };

        // Layout conversion
        vil.layout = [];
        if (kbinfo.keymap && kbinfo.rows && kbinfo.cols) {
            for (let l = 0; l < (kbinfo.layers || 0); l++) {
                const km = kbinfo.keymap[l];
                const layer = [];
                for (let r = 0; r < kbinfo.rows; r++) {
                    const row = [];
                    for (let c = 0; c < kbinfo.cols; c++) {
                        // Use keyService to convert keycode to string (vilify logic)
                        // Assuming keyService.stringify is compatible or we need custom logic
                        row.push(keyService.stringify(km[(r * kbinfo.cols) + c]));
                    }
                    layer.push(row);
                }
                vil.layout.push(layer);
            }
        }

        let jsvil = JSON.stringify(vil, undefined, 2);
        jsvil = jsvil.replace('"' + kbidrepl + '"', kbinfo.kbid || '"0"');
        return jsvil;
    }

    vilToKBINFO(vil: any): KeyboardInfo {
        // Start with default structure
        const kbinfo: KeyboardInfo = structuredClone(DEFAULT_KB_INFO) as KeyboardInfo;

        // Update counts
        kbinfo.key_override_count = vil.key_override?.length || 0;
        kbinfo.combo_count = vil.combo?.length || 0;
        kbinfo.macro_count = vil.macro?.length || 0;
        kbinfo.tapdance_count = vil.tap_dance?.length || 0;

        // Update values
        kbinfo.combos = vil.combo;
        kbinfo.key_overrides = vil.key_override;
        kbinfo.macros = vil.macro.map((macro: any[], mid: number) => {
            const actions: any[] = [];
            for (const act of macro) {
                // Format: [type, param1, param2...] - varies by macro type
                // In simple text macros often structure is [[type, val], ...]
                // We need to match what files.js expects: { actions: [[type, val]...], mid }
                // The incoming VIL macro is array of actions.
                // Actually, original code says:
                /*
                   for (const act of macro) {
                       for (let i = 1; i < act.length; i++) {
                       actions.push([act[0], act[i]]);
                       }
                   }
                */
                // Wait, this looks like it flattens [type, val1, val2] into [type, val1], [type, val2]?
                // This seems specific to how VIL stores macros. I'll copy the logic.
                if (Array.isArray(act)) {
                    for (let i = 1; i < act.length; i++) {
                        actions.push([act[0], act[i]]);
                    }
                }
            }
            return { actions: actions, mid: mid };
        });

        kbinfo.settings = vil.settings;
        kbinfo.tapdances = vil.tap_dance.map((td: any[], tdid: number) => {
            return {
                idx: tdid,
                tap: td[0],
                hold: td[1],
                doubletap: td[2],
                taphold: td[3],
                tapms: td[4]
            };
        });

        // Convert layout to keymap
        // vil.layout is [layer][row][col] -> string
        const km: number[][] = [];
        const keylayout: any[] = [];
        if (vil.layout) {
            // Determine rows/cols from layout if not set
            const layers = vil.layout.length;
            const rows = vil.layout[0]?.length || 0;
            const cols = vil.layout[0]?.[0]?.length || 0;

            kbinfo.layers = layers;
            kbinfo.rows = kbinfo.rows || rows;
            kbinfo.cols = kbinfo.cols || cols;

            for (let l = 0; l < layers; l++) {
                km.push([]);
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const keyStr = vil.layout[l][r][c];
                        // Parse string to keycode
                        km[l][(r * cols) + c] = keyService.parse(keyStr);

                        // Generate default keylayout (only need once, e.g. for layer 0)
                        if (l === 0) {
                            keylayout.push({
                                x: c,
                                y: r,
                                w: 1,
                                h: 1,
                                label: "",
                                matrix: [(r * cols) + c] // simplified matrix mapping
                            });
                        }
                    }
                }
            }
        }
        kbinfo.keymap = km;
        (kbinfo as any).keylayout = keylayout;
        kbinfo.kbid = '' + vil.uid;

        return kbinfo;
    }

    // Minimal implementation of KLE deserializeToKeylayout
    // For full support, we might need the full KLE library logic.
    // This is a simplified version based on `kle.js` snippet logic.
    // Simplified KLE Deserializer to KeyLayout
    private deserializeToKeylayout(kbinfo: KeyboardInfo, rows: any[]): any {
        return this.kleService.deserializeToKeylayout(kbinfo, rows);
    }
}

export const fileService = new FileService();
