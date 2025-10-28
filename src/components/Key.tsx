import "./Key.css";

import { getModMasks, showModMask } from "@/utils/keys";

import { colorClasses } from "@/utils/colors";
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
    layerColor?: string;
}

export const Key: React.FC<KeyProps> = ({ x, y, w, h, keycode, label, row, col, layerColor = "primary", selected = false, onClick, keyContents }) => {
    let bottomStr = "";
    let topStr = "";

    const hasModifiers = keyContents && ["modmask"].includes(keyContents.type);
    const handleClick = () => {
        console.log("content clicked", keyContents);
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
        l = keyContents.top.replace("M", "");
    }
    if (keyContents?.type === "user") {
        l = keyContents.str;
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
                    absolute ${
                        colorClasses[layerColor]
                    } flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ease-in-out rounded-md uppercase flex flex-col items-center justify-between
                    ${selected ? "border-2 border-kb-gray bg-red-500 text-white" : "border-2 border-kb-gray hover:border-red-500"}
                  `}
                    style={style}
                    onClick={handleClick}
                    data-keycode={keycode}
                    data-row={row}
                    data-col={col}
                    title={keycode}
                >
                    <span className="text-sm whitespace-nowrap bg-black/30 w-full rounded-t-sm text-center text-white font-semibold py-0">{keyContents?.layertext}</span>
                    <div className="flex flex-row h-full w-full items-center justify-center gap-2">
                        <div className="text-md text-center justify-center items-center flex font-semibold">{keyContents?.top.split("(")[1].replace(")", "")}</div>
                        <LayersIcon className="" />
                    </div>
                </div>
            </div>
        );
    }

    if (keyContents?.type === "OSM") {
        topStr = "OSM";
        l = keyContents.str;
    }

    return (
        <div className="absolute top-0 left-0">
            <div
                className={`
                    absolute ${
                        colorClasses[layerColor]
                    } flex items-center overflow-hidden justify-center cursor-pointer transition-all duration-200 ease-in-out rounded-md uppercase flex flex-col items-center justify-between
                    ${selected ? "border-2 border-kb-gray bg-red-500 text-white" : "border-2 border-kb-gray hover:border-red-500"}
                  `}
                style={style}
                onClick={handleClick}
                data-keycode={keycode}
                data-row={row}
                data-col={col}
                title={keycode}
            >
                {topStr !== "" && <span className="text-sm whitespace-nowrap bg-black/30 w-full rounded-t-sm text-center text-white font-semibold py-0">{topStr}</span>}
                {keyContents?.type === "tapdance" && <TapdanceIcon className=" mt-2 h-8" />}
                {keyContents?.type === "macro" && <MacrosIcon className=" mt-2 h-8" />}
                <div
                    className="text-center w-full h-full justify-center items-center flex font-semibold"
                    // @ts-ignore
                    style={["user", "OSM"].includes(keyContents?.type) || l.length > 5 ? { whiteSpace: "pre-line", fontSize: "0.6rem", textWrap: "break" } : {}}
                >
                    {l}
                </div>
                {bottomStr !== "" && (
                    <span
                        className="font-semibold min-h-5 items-center flex justify-center text-sm whitespace-nowrap text-white bg-black/30 w-full rounded-b-sm text-center py-0"
                        // @ts-ignore
                        style={bottomStr.length > 4 ? { whiteSpace: "pre-line", fontSize: "0.6rem", textWrap: "break" } : {}}
                    >
                        {bottomStr}
                    </span>
                )}
            </div>
        </div>
    );
};
