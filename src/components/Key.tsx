import "./Key.css";

import { getModMasks, showModMask } from "@/utils/keys";

import React from "react";
import { UNIT_SIZE } from "../constants/svalboard-layout";
import LayersIcon from "./icons/Layers";
import MacrosIcon from "./icons/MacrosIcon";
import TapdanceIcon from "./icons/Tapdance";

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
        console.log("modids", getModMasks(keyContents.modids));
        const show = showModMask(keyContents.modids);
        const keys = keyContents.str.split("\n");
        l = keys[0];
        bottomStr = show;
    }
    if (keyContents?.type === "tapdance") {
        l = keyContents.tdid;
    }
    if (keyContents?.type === "macro") {
        l = keyContents.str.replace("M", "");
    }
    if (l === "KC_NO") {
        l = "";
    }

    if (keyContents?.type === "layer") {
        console.log("rendering layer key", keyContents);
        return (
            <div className="absolute top-0 left-0">
                <div
                    className={`
                    absolute bg-kb-primary flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ease-in-out rounded-md uppercase flex flex-col items-center justify-between
                    ${selected ? "border-2 border-kb-gray bg-red-500" : "border-2 border-kb-gray hover:border-red-500"}
                  `}
                    style={style}
                    onClick={handleClick}
                    data-keycode={keycode}
                    data-row={row}
                    data-col={col}
                    title={keycode}
                >
                    <span className="text-sm text-white whitespace-nowrap bg-black/30 w-full rounded-t-sm text-center font-semibold py-0">{keyContents?.layertext}</span>
                    <div className="flex flex-row h-full w-full items-center justify-center gap-2">
                        <div className="text-white text-md text-center justify-center items-center flex font-semibold">{keyContents?.top.split("(")[1].replace(")", "")}</div>
                        <LayersIcon className="text-white" />
                    </div>
                </div>
            </div>
        );
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
                {keyContents?.type === "tapdance" && <TapdanceIcon className="text-white mt-2 h-8" />}
                {keyContents?.type === "macro" && <MacrosIcon className="text-white mt-2 h-8" />}
                <div className="text-white text-md text-center w-full h-full justify-center items-center flex font-semibold">{l}</div>
                {bottomStr !== "" && <span className="font-medium text-xs text-white whitespace-nowrap bg-black/30 w-full rounded-b-sm text-center py-0 fitty">{bottomStr}</span>}
            </div>
        </div>
    );
};
