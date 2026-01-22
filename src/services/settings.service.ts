import { HARDWARE_SETTINGS_REGISTRY } from "@/services/hardware-settings.registry";
import { SettingsState } from "@/types/settings.types";

export class SettingsService {
    private readonly storageKey = "keyboard-settings";

    load(): SettingsState {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn("Failed to load settings from localStorage:", error);
        }
        return {};
    }

    save(settings: SettingsState): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(settings));
        } catch (error) {
            console.error("Failed to save settings to localStorage:", error);
        }
    }

    clear(): void {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error("Failed to clear settings from localStorage:", error);
        }
    }

    async setHardwareSetting(name: string, value: string | number | boolean): Promise<void> {
        const handler = HARDWARE_SETTINGS_REGISTRY[name];
        if (handler) {
            try {
                // Ensure value is appropriate type if needed, but registry handles any
                await handler.set(value as number | boolean); 
            } catch (error) {
                console.error(`Failed to set hardware setting ${name}:`, error);
            }
        } else {
            console.warn(`No hardware handler found for setting: ${name}`);
        }
    }

    async getHardwareSetting(name: string): Promise<string | number | boolean | undefined> {
        const handler = HARDWARE_SETTINGS_REGISTRY[name];
        if (handler) {
            try {
                return await handler.get();
            } catch (error) {
                console.error(`Failed to get hardware setting ${name}:`, error);
            }
        }
        return undefined;
    }
}
