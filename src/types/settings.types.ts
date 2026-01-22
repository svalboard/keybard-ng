import { LucideIcon } from "lucide-react";

export interface SettingSelectItem {
    label: string;
    value: string;
}

export interface SettingDefinition {
    name: string;
    label: string;
    description?: string;
    type: "boolean" | "select" | "slider" | "action";
    defaultValue?: string | number | boolean;
    min?: number;
    max?: number;
    step?: number;
    items?: SettingSelectItem[];
    action?: string;
    scope?: "app" | "hardware";
}

export interface SettingsCategory {
    name: string;
    label: string;
    icon: LucideIcon;
    settings: string[];
}

export interface SettingsState {
    [settingName: string]: string | number | boolean;
}

export interface SettingsContextType {
    settings: SettingsState;
    settingsDefinitions: SettingDefinition[];
    settingsCategories: SettingsCategory[];
    updateSetting: (name: string, value: string | number | boolean) => void;
    getSetting: (name: string, defaultValue?: string | number | boolean) => string | number | boolean;
    getSettingDefinition: (name: string) => SettingDefinition | undefined;
    resetSettings: () => void;
    resetSetting: (name: string) => void;
    refreshHardwareSettings: () => Promise<void>;
}
