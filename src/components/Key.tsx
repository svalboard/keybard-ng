import "./Key.css";
import { cn } from "@/lib/utils";

import { showModMask } from "@/utils/keys";

import { colorClasses } from "@/utils/colors";
import React from "react";
import { UNIT_SIZE } from "../constants/svalboard-layout";
import LayersIcon from "./icons/Layers";
import MacrosIcon from "./icons/MacrosIcon";
import TapdanceIcon from "./icons/Tapdance";
import ComboIcon from "./ComboIcon";
import OverridesIcon from "./icons/Overrides";

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
    isRelative?: boolean;
    className?: string;
    headerClassName?: string;
    variant?: "default" | "small";
    hoverBorderColor?: string;
    hoverBackgroundColor?: string;
}

export const Key: React.FC<KeyProps> = ({
    x,
    y,
    w,
    h,
    keycode,
    label,
    row,
    col,
    layerColor = "primary",
    selected = false,
    onClick,
    keyContents,
    isRelative = false,
    className = "",
    headerClassName = "bg-black/30",
    variant = "default",
    hoverBorderColor,
    hoverBackgroundColor,
}) => {
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
        const content = (
            <div
                className={cn(
                    colorClasses[layerColor],
                    "flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ease-in-out uppercase flex flex-col items-center justify-between group",
                    variant === "small" ? "rounded-[5px] border" : "rounded-md border-2",
                    !isRelative && "absolute",
                    selected ? "border-kb-gray bg-red-500 text-white" : `border-kb-gray ${hoverBorderColor ? hoverBorderColor : "hover:border-red-500"}`,
                    hoverBackgroundColor && hoverBackgroundColor,
                    className
                )}
                style={!isRelative ? style : {}}
                onClick={handleClick}
                data-keycode={keycode}
                data-row={row}
                data-col={col}
                title={keycode}
            >
                <span className={cn(variant === "small" ? "text-[10px] rounded-t-[4px]" : "text-sm rounded-t-sm", "whitespace-nowrap w-full text-center text-white font-semibold py-0", headerClassName)}>{keyContents?.layertext}</span>
                <div className={cn("flex flex-row h-full w-full items-center justify-center", variant === "small" ? "gap-1" : "gap-2")}>
                    <div className={cn(variant === "small" ? "text-[13px]" : "text-md", "text-center justify-center items-center flex font-semibold")}>{keyContents?.top.split("(")[1].replace(")", "")}</div>
                    <LayersIcon className={variant === "small" ? "w-3 h-3" : ""} />
                </div>
            </div>
        );

        if (isRelative) return content;

        return (
            <div className="absolute top-0 left-0">
                {content}
            </div>
        );
    }

    if (keyContents?.type === "OSM") {
        topStr = "OSM";
        l = keyContents.str;
    }

    const content = (
        <div
            className={cn(
                colorClasses[layerColor],
                "flex items-center overflow-hidden justify-center cursor-pointer transition-all duration-200 ease-in-out rounded-md uppercase flex flex-col items-center justify-between",
                !isRelative && "absolute",
                selected ? "border-2 border-kb-gray bg-red-500 text-white" : `border-2 border-kb-gray ${hoverBorderColor ? hoverBorderColor : "hover:border-red-500"}`,
                hoverBackgroundColor && hoverBackgroundColor,
                className
            )}
            style={!isRelative ? style : {}}
            onClick={handleClick}
            data-keycode={keycode}
            data-row={row}
            data-col={col}
            title={keycode}
        >
            {topStr !== "" && <span className={cn("text-sm whitespace-nowrap w-full rounded-t-sm text-center text-white font-semibold py-0", headerClassName)}>{topStr}</span>}
            {keyContents?.type === "tapdance" && <TapdanceIcon className=" mt-2 h-8" />}
            {keyContents?.type === "macro" && <MacrosIcon className=" mt-2 h-8" />}
            {keyContents?.type === "combo" && <ComboIcon className=" mt-2 h-8" />}
            {keyContents?.type === "override" && <OverridesIcon className=" mt-2 h-8" />}
            <div
                className="text-center w-full h-full justify-center items-center flex font-semibold"
                // @ts-ignore
                style={["user", "OSM"].includes(keyContents?.type) || l.length > 5 || (l.length === 5 && l.toUpperCase().includes("W")) ? { whiteSpace: "pre-line", fontSize: "0.6rem", textWrap: "break" } : {}}
            >
                {l}
            </div>
            {bottomStr !== "" && (
                <span
                    className={cn("font-semibold min-h-5 items-center flex justify-center text-sm whitespace-nowrap text-white w-full rounded-b-sm text-center py-0", headerClassName)}
                    // @ts-ignore
                    style={bottomStr.length > 4 ? { whiteSpace: "pre-line", fontSize: "0.6rem", textWrap: "break" } : {}}
                >
                    {bottomStr}
                </span>
            )}
        </div>
    );

    if (isRelative) return content;

    return (
        <div className="absolute top-0 left-0">
            {content}
        </div>
    );
};
