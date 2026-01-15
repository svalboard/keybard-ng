import { DialogClose, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { FC, useEffect, useState } from "react";

import { useVial } from "@/contexts/VialContext";
import { useChanges } from "@/hooks/useChanges";
import { svalService } from "@/services/sval.service";
import { layerColors } from "@/utils/colors";
import { updateLayerColor } from "@/utils/layers";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface Props {
    layer: number;
}

const EditLayer: FC<Props> = ({ layer }) => {
    const { keyboard, setKeyboard } = useVial();
    const { queue } = useChanges();
    const currentName = keyboard ? svalService.getLayerName(keyboard, layer) : "";
    const currentColor = keyboard?.cosmetic?.layer_colors?.[layer.toString()] || "green";

    const [selectedColor, setSelectedColor] = useState<string | null>(currentColor);
    const [name, setName] = useState<string>(currentName);

    // Sync state when currentName or currentColor changes (if the modal stays mounted)
    useEffect(() => {
        setName(currentName);
    }, [currentName]);

    useEffect(() => {
        setSelectedColor(currentColor);
    }, [currentColor]);
    const handleSubmit = async () => {
        if (keyboard) {
            // Deep clone cosmetic to avoid shared reference issues
            const cosmetic = JSON.parse(JSON.stringify(keyboard.cosmetic || { layer: {}, layer_colors: {} }));

            if (!cosmetic.layer) cosmetic.layer = {};
            if (!cosmetic.layer_colors) cosmetic.layer_colors = {};

            if (name !== undefined) {
                cosmetic.layer[layer.toString()] = name;
            }

            if (selectedColor) {
                cosmetic.layer_colors[layer.toString()] = selectedColor;
                await updateLayerColor(keyboard, layer, selectedColor, queue);
            }

            setKeyboard({
                ...keyboard,
                cosmetic
            });
        }
    };
    return (
        <DialogContent>
            <DialogHeader></DialogHeader>
            <div className="grid gap-4">
                <Label htmlFor="name-1">Layer {layer} Name</Label>
                <Input id="name-1" name="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-3 mt-4">
                <Label htmlFor="color-1">Layer Color</Label>
                <div className="flex flex-row gap-2">
                    {layerColors.map((color) => (
                        <div
                            key={color.name}
                            className={`w-10 h-10 rounded-full cursor-pointer hover:opacity-90 ${selectedColor === color.name ? "border-black border-2 shadow-md" : "border-transparent"
                                }`}
                            style={{ backgroundColor: color.hex }}
                            onClick={() => setSelectedColor(color.name)}
                        ></div>
                    ))}
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button onClick={() => handleSubmit()}>Save</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
};

export default EditLayer;
