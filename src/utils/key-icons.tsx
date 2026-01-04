import React from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Clock, Crosshair } from "lucide-react";
import MouseIcon from "@/components/icons/Mouse";
import LayersIcon from "@/components/icons/Layers";
import MacrosIcon from "@/components/icons/MacrosIcon";
import TapdanceIcon from "@/components/icons/Tapdance";
import ComboIcon from "@/components/ComboIcon";
import OverridesIcon from "@/components/icons/Overrides";

export const getHeaderIcons = (keycode: string, label: string) => {
    const lowerLabel = String(label).toLowerCase();
    const mouseWords = ["mouse", "ms"];
    const sniperWords = ["sniper"];
    const timerWords = ["timer"];

    const isMouse = mouseWords.some((w) => lowerLabel.includes(w));
    const isSniper = sniperWords.some((w) => lowerLabel.includes(w)) || keycode.includes("SNIPER");
    const isTimer = timerWords.some((w) => lowerLabel.includes(w)) || keycode.includes("TIMEOUTS");

    const icons: React.ReactNode[] = [];
    if (isMouse) icons.push(<MouseIcon key="mouse" className="w-3.5 h-3.5" />);
    if (isSniper) icons.push(<Crosshair key="sniper" className="w-3.5 h-3.5" />);
    if (isTimer) icons.push(<Clock key="timer" className="w-3.5 h-3.5" />);

    return {
        icons,
        isMouse,
        isSniper,
        isTimer
    };
};

export const getCenterContent = (
    label: string,
    keycode: string,
    isMouse: boolean,
    showArrowsOnly: boolean = false
) => {
    const lowerLabel = String(label).toLowerCase();
    const upWords = ["up"];
    const downWords = ["down"];
    const leftWords = ["left"];
    const rightWords = ["right"];

    const isUp = upWords.some((w) => lowerLabel.includes(w)) || keycode.endsWith("_U");
    const isDown = downWords.some((w) => lowerLabel.includes(w)) || keycode.endsWith("_D");
    const isLeft = leftWords.some((w) => lowerLabel.includes(w)) || keycode.endsWith("_L");
    const isRight = rightWords.some((w) => lowerLabel.includes(w)) || keycode.endsWith("_R");

    const showArrows = (isMouse && (isUp || isDown || isLeft || isRight)) || ["up", "down", "left", "right"].includes(lowerLabel);

    if (showArrows) {
        if (isUp) return <ArrowUp className="w-5 h-5" />;
        if (isDown) return <ArrowDown className="w-5 h-5" />;
        if (isLeft) return <ArrowLeft className="w-5 h-5" />;
        if (isRight) return <ArrowRight className="w-5 h-5" />;
    }

    if (showArrowsOnly) return null;

    let clean = label;
    const wordsToRemove = ["mouse", "ms", "sniper", "timer"];
    wordsToRemove.forEach((w) => {
        clean = clean.replace(new RegExp(`\\b${w}\\b`, "i"), "").trim();
    });

    return clean;
};

export const getTypeIcon = (type: string, variant: "default" | "small") => {
    const iconClass = variant === "small" ? "mt-1 h-4" : "mt-2 h-8";
    switch (type) {
        case "tapdance":
            return <TapdanceIcon className={iconClass} />;
        case "macro":
            return <MacrosIcon className={iconClass} />;
        case "combo":
            return <ComboIcon className={iconClass} />;
        case "override":
            return <OverridesIcon className={iconClass} />;
        case "layer":
            return <LayersIcon className={variant === "small" ? "w-3 h-3" : ""} />;
        default:
            return null;
    }
};
