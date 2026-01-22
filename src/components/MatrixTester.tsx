import type { FC } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Key } from "@/components/Key";
import { BrushCleaningIcon } from "@/components/icons/BrushCleaning";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MATRIX_COLS, SVALBOARD_LAYOUT, UNIT_SIZE } from "@/constants/svalboard-layout";
import { useLayoutSettings } from "@/contexts/LayoutSettingsContext";
import { useVial } from "@/contexts/VialContext";

// Constants
const POLL_INTERVAL_MS = 50;
const BUTTON_STYLES = "w-12 h-12 rounded-2xl cursor-pointer hover:bg-gray-50 bg-white shadow-lg flex items-center justify-center text-black focus:outline-none transition-colors border border-gray-200" as const;

/**
 * Creates a unique key identifier from row and column indices
 */
const createKeyId = (row: number, col: number): string => `${row}-${col}`;

/**
 * MatrixTester component for testing keyboard matrix functionality
 * Displays a visual representation of key presses and provides history tracking
 */
export const MatrixTester: FC = () => {
    const { pollMatrix, keyboard, isConnected } = useVial();
    const { keyVariant } = useLayoutSettings();

    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
    const [detectedKeys, setDetectedKeys] = useState<Set<string>>(new Set());
    const pollingRef = useRef<boolean>(true);

    // Calculate current unit size based on key variant
    const currentUnitSize = useMemo(() => {
        switch (keyVariant) {
            case 'small':
                return 30;
            case 'medium':
                return 45;
            default:
                return UNIT_SIZE;
        }
    }, [keyVariant]);

    // Calculate keyboard dimensions
    const keyboardDimensions = useMemo(() => {
        let maxX = 0;
        let maxY = 0;

        Object.values(SVALBOARD_LAYOUT).forEach((key) => {
            maxX = Math.max(maxX, key.x + key.w);
            maxY = Math.max(maxY, key.y + key.h);
        });

        return {
            width: maxX * currentUnitSize,
            height: maxY * currentUnitSize,
        };
    }, [currentUnitSize]);

    // Clear matrix history handler
    const handleClearMatrix = useCallback(() => {
        setDetectedKeys(new Set());
    }, []);

    // Matrix polling effect
    useEffect(() => {
        pollingRef.current = true;
        let timeoutId: number | undefined;

        const poll = async (): Promise<void> => {
            if (!pollingRef.current) return;

            if (isConnected && keyboard) {
                try {
                    const matrix = await pollMatrix();
                    const newlyPressed = new Set<string>();

                    if (matrix?.length) {
                        matrix.forEach((row, rowIndex) => {
                            row.forEach((isPressed, colIndex) => {
                                if (isPressed) {
                                    newlyPressed.add(createKeyId(rowIndex, colIndex));
                                }
                            });
                        });

                        setPressedKeys(newlyPressed);

                        // Update detected keys with any newly pressed keys
                        if (newlyPressed.size > 0) {
                            setDetectedKeys((prev) => {
                                const next = new Set(prev);
                                let hasChanged = false;

                                newlyPressed.forEach((key) => {
                                    if (!next.has(key)) {
                                        next.add(key);
                                        hasChanged = true;
                                    }
                                });

                                return hasChanged ? next : prev;
                            });
                        }
                    }
                } catch (error) {
                    console.error("Matrix polling error:", error);
                }
            }

            if (pollingRef.current) {
                timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
            }
        };

        poll();

        return () => {
            pollingRef.current = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [pollMatrix, isConnected, keyboard]);

    // Reset state on disconnect
    useEffect(() => {
        if (!isConnected) {
            setPressedKeys(new Set());
            setDetectedKeys(new Set());
        }
    }, [isConnected]);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            {/* Keyboard Layout */}
            <div
                className="keyboard-layout relative"
                style={{
                    width: `${keyboardDimensions.width}px`,
                    height: `${keyboardDimensions.height}px`
                }}
            >
                {Object.entries(SVALBOARD_LAYOUT).map(([matrixPos, layout]) => {
                    const pos = Number(matrixPos);
                    const row = Math.floor(pos / MATRIX_COLS);
                    const col = pos % MATRIX_COLS;
                    const keyId = createKeyId(row, col);
                    const isPressed = pressedKeys.has(keyId);
                    const wasPressed = detectedKeys.has(keyId);

                    return (
                        <Key
                            key={keyId}
                            x={layout.x}
                            y={layout.y}
                            w={layout.w}
                            h={layout.h}
                            keycode=""
                            label=""
                            row={row}
                            col={col}
                            selected={isPressed}
                            layerColor={wasPressed ? "black" : "white"}
                            variant={keyVariant}
                            disableHover
                            keyContents={{ type: "text", str: "" }}
                        />
                    );
                })}
            </div>

            {/* Clear Matrix Button */}
            <div className="absolute bottom-5 right-5 z-50">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={handleClearMatrix}
                            className={BUTTON_STYLES}
                            aria-label="Clear Matrix"
                        >
                            <BrushCleaningIcon className="h-5 w-5" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Clear Matrix</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
};
