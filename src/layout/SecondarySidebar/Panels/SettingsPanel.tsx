import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useChanges } from "@/contexts/ChangesContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useVial } from "@/contexts/VialContext";
import { cn } from "@/lib/utils";
import { fileService } from "@/services/file.service";
import { useRef, useState } from "react";

const SettingsPanel = () => {
    const { getSetting, updateSetting, settingsDefinitions, settingsCategories } = useSettings();
    const [activeCategory, setActiveCategory] = useState<string>("general");
    const { keyboard, setKeyboard, isConnected } = useVial();

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Export Dialog State
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<"vil" | "kbi">("vil");
    const [includeMacros, setIncludeMacros] = useState(true);

    const { queue } = useChanges();

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const newKbInfo = await fileService.uploadFile(file);
                    if (newKbInfo) {
                        // Start sync if connected
                        if (keyboard && isConnected) { 
                             const { importService } = await import('@/services/import.service');
                             const { vialService } = await import('@/services/vial.service');
                             
                             await importService.syncWithKeyboard(
                                 newKbInfo, 
                                 keyboard, 
                                 queue, 
                                 { vialService }
                             );
                        }

                     setKeyboard(newKbInfo);
                     // Optional: Show success toast
                     console.log("Import successful", newKbInfo);
                }
            } catch (err) {
                console.error("Upload failed", err);
                // Optional: Show error toast
            }
        }
        // Reset input so same file can be selected again
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleExport = async () => {
        if (!keyboard) {
            console.error("No keyboard loaded");
            return;
        }

        try {
            if (exportFormat === "vil") {
                await fileService.downloadVIL(keyboard, includeMacros);
            } else {
                await fileService.downloadKBI(keyboard, includeMacros);
            }
            setIsExportOpen(false);
        } catch (err) {
             console.error("Export failed", err);
        }
    };

    return (
        <section className="space-y-3 h-full max-h-full flex flex-col w-full mx-auto py-4">
             {/* Hidden file input for import */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".vil,.kbi,.json"
                onChange={handleFileImport}
            />

            {/* Export Dialog */}
             <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Export Configuration</DialogTitle>
                        <DialogDescription>
                            Choose the format to save your keyboard configuration.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="flex flex-col gap-2">
                             <Label>Format</Label>
                             <Select value={exportFormat} onValueChange={(v: "vil" | "kbi") => setExportFormat(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vil">Vial (.vil) - Universal</SelectItem>
                                    <SelectItem value="kbi">Keybard (.kbi) - Full Backup</SelectItem>
                                </SelectContent>
                             </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="include-macros" checked={includeMacros} onCheckedChange={(c: boolean) => setIncludeMacros(c)} />
                            <label
                                htmlFor="include-macros"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Include Macros
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setIsExportOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleExport}>
                            Export
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex flex-row gap-2 justify-stretch align-stretch mb-3 w-full">
                {settingsCategories.map((category) => (
                    <div
                        key={category.name}
                        onClick={() => setActiveCategory(category.name)}
                        className={cn(
                            "w-0 min-w-0 flex-1 flex items-center gap-2 flex-col cursor-pointer py-3 rounded-lg transition-all",
                            activeCategory === category.name ? "bg-black text-white hover:bg-black/80 hover:text-white" : "text-muted-foreground hover:bg-muted bg-muted/60"
                        )}
                    >
                        {category.icon && <category.icon className="h-4 w-4" />}
                        <span className="text-xs font-medium text-center break-words">{category.label}</span>
                    </div>
                ))}
            </div>
            <div className=" flex flex-col overflow-auto flex-grow gap-2">
                {settingsCategories
                    .find((cat) => cat.name === activeCategory)
                    ?.settings.map((se) => {
                        const setting = settingsDefinitions.find((s) => s.name === se);
                        if (!setting) return null;

                        if (setting.type === "boolean") {
                            return (
                                <div className="flex flex-row items-center justify-between p-3 gap-3 panel-layer-item group/item" key={setting.name}>
                                    <div className="flex flex-col items-start gap-3">
                                        <span className="text-md text-left">{setting.label}</span>
                                        <span className="text-xs text-muted-foreground">{setting.description}</span>
                                    </div>
                                    <Switch
                                        checked={getSetting(setting.name, setting.defaultValue) as boolean}
                                        onCheckedChange={(checked) => {
                                            updateSetting(setting.name, checked);
                                        }}
                                    />
                                </div>
                            );
                        }
                        if (setting.type === "select") {
                            return (
                                <div className="flex flex-row items-center justify-between p-3 gap-3 panel-layer-item group/item" key={setting.name}>
                                    <div className="flex flex-col items-start gap-3">
                                        <div className="text-md text-left">{setting.label}</div>
                                        {setting.description && setting.description !== "" && <span className="text-xs text-muted-foreground">{setting.description}</span>}
                                    </div>
                                    <select
                                        value={getSetting(setting.name, setting.defaultValue) as string}
                                        onChange={(e) => {
                                            updateSetting(setting.name, e.target.value);
                                        }}
                                        className=" h-8 px-3 font-bold rounded-md pr-3 cursor-pointer active:border-none focus:border-none"
                                    >
                                        {setting.items?.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            );
                        }
                        if (setting.type === "action") {
                            return (
                                <div
                                    className="flex flex-row items-center justify-between p-3 gap-3 panel-layer-item group/item cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md"
                                    key={setting.name}
                                    onClick={() => {
                                        console.log(`Action ${setting.action} triggered`);
                                        if (setting.action === "import-settings") {
                                            fileInputRef.current?.click();
                                        } else if (setting.action === "export-settings") {
                                            setIsExportOpen(true);
                                        }
                                    }}
                                >
                                    <div className="flex flex-col gap-2">
                                        <span className="text-md text-left">{setting.label}</span>
                                        {setting.description ? <span className="text-xs text-muted-foreground">{setting.description}</span> : undefined}
                                    </div>
                                    <span className="text-xs text-muted-foreground">›</span>
                                </div>
                            );
                        }
                        if (setting.type === "slider") {
                            return (
                                <div className="flex flex-col gap-2 p-3 panel-layer-item group/item w-full" key={setting.name}>
                                    <span className="text-md text-left">{setting.label}</span>
                                    <span className="text-xs text-muted-foreground">{setting.description}</span>
                                    <div className="flex flex-row items-center justify-between">
                                        <Slider
                                            value={[getSetting(setting.name, setting.defaultValue) as number]}
                                            onValueChange={(values) => updateSetting(setting.name, values[0])}
                                            min={setting.min}
                                            max={setting.max}
                                            step={setting.step}
                                            key={setting.name}
                                            className="flex-grow"
                                        />
                                        <Input
                                            type="number"
                                            value={getSetting(setting.name, setting.defaultValue) as number}
                                            onChange={(e) => updateSetting(setting.name, parseInt(e.target.value) || 0)}
                                            className="w-22 ml-4 text-right"
                                        />
                                    </div>
                                </div>
                            );
                        }

                        return null;
                    })}
            </div>
        </section>
    );
};

export default SettingsPanel;
