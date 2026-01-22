import * as React from "react";
import { cn } from "@/lib/utils";
import {
    LAYOUT_TRANSITION_CURVE,
    LAYOUT_TRANSITION_DURATION
} from "../layout.constants";

interface SidebarShieldProps {
    isVisible: boolean;
    primaryOffset: string | undefined;
}

/**
 * A static background shield that covers the track behind the primary sidebar icons.
 * This prevents workspace content from bleeding through during lateral transitions.
 */
export const SidebarShield: React.FC<SidebarShieldProps> = ({ isVisible, primaryOffset }) => {
    return (
        <div
            className={cn(
                "fixed inset-y-0 left-0 bg-white z-10 transition-all ease-in-out",
                isVisible ? "translate-x-0" : "-translate-x-full"
            )}
            style={{
                width: `calc(${primaryOffset} + 8px)`,
                transitionDuration: LAYOUT_TRANSITION_DURATION,
                transitionTimingFunction: LAYOUT_TRANSITION_CURVE
            }}
        />
    );
};
