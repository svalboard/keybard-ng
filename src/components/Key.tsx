import "./Key.css";

import { Layers2Icon } from "lucide-react";
import React from "react";
import { UNIT_SIZE } from "../constants/svalboard-layout";
import { showModMask } from "@/utils/keys";

interface KeyProps {
    x: number; // X position in key units
    y: number; // Y position in key units
    w: number; // Width in key units
    h: number; // Height in key units
    keycode: string; // The keycode (e.g., "KC_A", "MO(2)")
    label: string; // Display label for the key
    row: number; // Matrix row
    col: number; // Matrix column
    selected?: boolean;
    onClick?: (row: number, col: number) => void;
    keyContents?: any; // Additional key contents info
}

export const Key: React.FC<KeyProps> = ({ x, y, w, h, keycode, label, row, col, selected = false, onClick, keyContents }) => {
    let bottomStr = "";
    let topStr = "";

    const hasModifiers = keyContents && ["modmask"].includes(keyContents.type);
    const handleClick = () => {
        if (onClick) {
            onClick(row, col);
        }
    };

    // Convert key units to pixels
    const style: React.CSSProperties = {
        left: `${x * UNIT_SIZE}px`,
        top: `${y * UNIT_SIZE}px`,
        width: `${w * UNIT_SIZE}px`,
        height: `${h * UNIT_SIZE}px`,
    };
    let l = label;

    if (hasModifiers) {
        const show = showModMask(keyContents.modids);
        const keys = keyContents.str.split("\n");
        l = keys[0];
        bottomStr = show;
    }
    if (keyContents?.type === "layer") {
        console.log("Layer key:", keyContents);
        l = keyContents.str;
        topStr = keyContents.top;
    }
    if (l === "KC_NO") {
        l = "";
    }

    return (
        <div className="absolute top-0 left-0">
            <div
                className={`
                    absolute bg-kb-primary flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out rounded-md uppercase flex flex-col items-center justify-between
                    ${selected ? "border-2 border-kb-gray bg-red-500" : "border-2 border-kb-gray hover:border-red-500"}
                  `}
                style={style}
                onClick={handleClick}
                data-keycode={keycode}
                data-row={row}
                data-col={col}
                title={keycode}
            >
                {topStr !== "" && <span className=" text-xs text-white whitespace-nowrap bg-green-800 w-full rounded-t-sm text-center py-0">{topStr}</span>}
                {keyContents?.type === "layer" && <Layers2Icon className="text-white mt-1 h-12" />}
                <div className="text-white text-xs text-center w-full h-full justify-center items-center flex">{l}</div>
                {bottomStr !== "" && <span className=" text-xs text-white whitespace-nowrap bg-green-800 w-full rounded-b-sm text-center py-0">{bottomStr}</span>}
            </div>
        </div>
    );
};
