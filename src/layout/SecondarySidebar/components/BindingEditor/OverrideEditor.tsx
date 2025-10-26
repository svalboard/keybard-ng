import { usePanels } from "@/contexts/PanelsContext";
import { useVial } from "@/contexts/VialContext";
import { getKeyContents } from "@/utils/keys";
import { FC } from "react";
import EditorKey from "../EditorKey";
import HoldableButton from "../HoldableButton";
import Switch from "../Switch";

interface Props {}

const OverrideEditor: FC<Props> = () => {
    const { keyboard } = useVial();
    const { itemToEdit } = usePanels();
    const currCombo = (keyboard as any).combos?.[itemToEdit!];
    const keys = {
        0: getKeyContents(keyboard!, currCombo["0"]),
        1: getKeyContents(keyboard!, currCombo["1"]),
        2: getKeyContents(keyboard!, currCombo["2"]),
        3: getKeyContents(keyboard!, currCombo["3"]),
        4: getKeyContents(keyboard!, currCombo["4"]),
    };

    return (
        <div className="flex flex-col items-center px-13 gap-5 pt-5">
            <div className="flex flex-row items-center gap-4 justify-start w-full">
                <Switch label="active" />
            </div>
            <div className="flex flex-row gap-1">
                <EditorKey binding={keys["0"]} />
                <EditorKey binding={keys["1"]} />
            </div>
            <div className="grid grid-cols-3 gap-2 w-full mt-2 mb-2 grid">
                <HoldableButton label="Trigger" />
                <HoldableButton label="Negative" />
                <HoldableButton label="Suspended" />
            </div>
            <div className="grid grid-cols-4 gap-2 w-full mt-2 mb-2 grid">
                <HoldableButton label="None" />
                <HoldableButton label="Layer" />
                <HoldableButton label="Left" />
                <HoldableButton label="Right" />
                <HoldableButton label="Shift" />
                <HoldableButton label="Ctrl" />
                <HoldableButton label="GUI" />
                <HoldableButton label="Alt" />
            </div>
            <div className="grid grid-cols-4 gap-2 w-full mt-2 mb-2 grid px-10">
                <HoldableButton label="0" />
                <HoldableButton label="1" />
                <HoldableButton label="2" />
                <HoldableButton label="3" />
                <HoldableButton label="4" />
                <HoldableButton label="5" />
                <HoldableButton label="6" />
                <HoldableButton label="7" />
                <HoldableButton label="8" />
                <HoldableButton label="9" />
                <HoldableButton label="10" />
                <HoldableButton label="11" />
                <HoldableButton label="12" />
                <HoldableButton label="13" />
                <HoldableButton label="14" />
                <HoldableButton label="15" />
            </div>
            <div className="flex flex-col items-start gap-4 justify-start w-full">
                <Switch label="Active on trigger down" />
                <Switch label="Active on mod down" />
                <Switch label="Active on negative mod down" />
                <Switch label="Active trigger mod activates" />
                <Switch label="Active reregister trigger on deactivate" />
                <Switch label="No unregister on other key down" />
            </div>
        </div>
    );
};

export default OverrideEditor;
