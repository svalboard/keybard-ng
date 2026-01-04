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
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Clock, Crosshair } from "lucide-react";
import MouseIcon from "./icons/Mouse";
import { KeyContent } from "@/types/vial.types";

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
    keyContents?: KeyContent; // Additional key contents info
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

    if (hasModifiers && keyContents) {
        const show = showModMask(keyContents.modids);
        const keys = keyContents.str.split("\n");
        l = keys[0];
        bottomStr = show;
    }
    if (keyContents?.type === "tapdance") {
        l = keyContents.tdid?.toString() || "";
    }
    if (keyContents?.type === "macro") {
        l = keyContents.top?.replace("M", "") || "";
    }
    if (keyContents?.type === "user") {
        l = keyContents.str;
    }
    if (l === "KC_NO") {
        l = "";
    }

    let topLabel: React.ReactNode = topStr;

    // --- Icon replacement logic ---
    const mouseWords = ["Mouse", "Ms"];
    const sniperWords = ["Sniper"];
    const timerWords = ["Timer"];
    const upWords = ["Up"];
    const downWords = ["Down"];
    const leftWords = ["Left"];
    const rightWords = ["Right"];

    // Detect key types from label or keycode
    const lowerLabel = String(l).toLowerCase();
    const hasMouseWord = mouseWords.some(w => lowerLabel.includes(w.toLowerCase()));
    // const isMouseCode = keycode.startsWith("KC_MS") || keycode.startsWith("KC_BTN") || keycode.startsWith("KC_WH") || keycode.startsWith("SV_");
    const isMouse = hasMouseWord;

    const isSniper = sniperWords.some(w => lowerLabel.includes(w.toLowerCase())) || keycode.includes("SNIPER");
    const isTimer = timerWords.some(w => lowerLabel.includes(w.toLowerCase())) || keycode.includes("TIMEOUTS");
    const isUp = upWords.some(w => lowerLabel.includes(w.toLowerCase())) || keycode.endsWith("_U");
    const isDown = downWords.some(w => lowerLabel.includes(w.toLowerCase())) || keycode.endsWith("_D");
    const isLeft = leftWords.some(w => lowerLabel.includes(w.toLowerCase())) || keycode.endsWith("_L");
    const isRight = rightWords.some(w => lowerLabel.includes(w.toLowerCase())) || keycode.endsWith("_R");

    // Arrows are only for mouse keys that have directional labels OR if the label is exactly a direction word
    const showArrows = (hasMouseWord && (isUp || isDown || isLeft || isRight)) || ["up", "down", "left", "right"].includes(lowerLabel);

    const headerIcons: React.ReactNode[] = [];
    if (isMouse) headerIcons.push(<MouseIcon key="mouse" className="w-3.5 h-3.5" />);
    if (isSniper) headerIcons.push(<Crosshair key="sniper" className="w-3.5 h-3.5" />);
    if (isTimer) headerIcons.push(<Clock key="timer" className="w-3.5 h-3.5" />);

    if (headerIcons.length > 0) {
        topLabel = <div className="flex items-center justify-center gap-1">{headerIcons}</div>;
    }

    // Determine what to show in the center
    let centerLabel: React.ReactNode = l;

    // Clean up label if it contains the words we moved to icons
    if (typeof centerLabel === "string") {
        let clean = centerLabel;
        [...mouseWords, ...sniperWords, ...timerWords].forEach(w => {
            clean = clean.replace(new RegExp(`\\b${w}\\b`, "i"), "").trim();
        });

        if (showArrows) {
            if (isUp) centerLabel = <ArrowUp className="w-5 h-5" />;
            else if (isDown) centerLabel = <ArrowDown className="w-5 h-5" />;
            else if (isLeft) centerLabel = <ArrowLeft className="w-5 h-5" />;
            else if (isRight) centerLabel = <ArrowRight className="w-5 h-5" />;
        } else {
            centerLabel = clean;
        }
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
                    <div className={cn(variant === "small" ? "text-[13px]" : "text-md", "text-center justify-center items-center flex font-semibold")}>{keyContents?.top?.split("(")[1]?.replace(")", "")}</div>
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
        topLabel = "OSM";
        centerLabel = keyContents.str;
    }

    // Helper to determine styling for long text
    const shouldShrinkText = ["user", "OSM"].includes(keyContents?.type || "") ||
        (typeof centerLabel === 'string' && (centerLabel.length > 5 || (centerLabel.length === 5 && centerLabel.toUpperCase().includes("W"))));

    const textStyle: React.CSSProperties = shouldShrinkText ? { whiteSpace: "pre-line", fontSize: "0.6rem", wordWrap: "break-word" } : {};
    const bottomTextStyle: React.CSSProperties = bottomStr.length > 4 ? { whiteSpace: "pre-line", fontSize: "0.6rem", wordWrap: "break-word" } : {};

    const content = (
        <div
            className={cn(
                colorClasses[layerColor],
                "flex items-center overflow-hidden justify-center cursor-pointer transition-all duration-200 ease-in-out rounded-md uppercase flex flex-col items-center justify-between group",
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
            {topLabel && <span className={cn("text-sm whitespace-nowrap w-full rounded-t-sm text-center text-white font-semibold py-0 min-h-[1.2rem] flex items-center justify-center", headerClassName)}>{topLabel}</span>}
            {keyContents?.type === "tapdance" && <TapdanceIcon className=" mt-2 h-8" />}
            {keyContents?.type === "macro" && <MacrosIcon className=" mt-2 h-8" />}
            {keyContents?.type === "combo" && <ComboIcon className=" mt-2 h-8" />}
            {keyContents?.type === "override" && <OverridesIcon className=" mt-2 h-8" />}
            <div
                className="text-center w-full h-full justify-center items-center flex font-semibold"
                style={textStyle}
            >
                {centerLabel}
            </div>
            {bottomStr !== "" && (
                <span
                    className={cn("font-semibold min-h-5 items-center flex justify-center text-sm whitespace-nowrap text-white w-full rounded-b-sm text-center py-0", headerClassName)}
                    style={bottomTextStyle}
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
