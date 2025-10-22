import type { KeyboardInfo } from "../types/vial.types";
import { keyService } from "./key.service";

export class FileService {
    private static readonly MAX_FILE_SIZE = 1048576; // 1MB

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
}

export const fileService = new FileService();
