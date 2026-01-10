import React, { useEffect, useState, useRef } from "react";
import { useVial } from "@/contexts/VialContext";
import { SVALBOARD_LAYOUT, MATRIX_COLS, UNIT_SIZE } from "@/constants/svalboard-layout";
import { Key } from "./Key";
import { useLayoutSettings } from "@/contexts/LayoutSettingsContext";
import { BrushCleaningIcon } from "./icons/BrushCleaning";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const MatrixTester: React.FC = () => {
    const { pollMatrix, keyboard, isConnected } = useVial();
    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
    const [detectedKeys, setDetectedKeys] = useState<Set<string>>(new Set());
    const { keyVariant } = useLayoutSettings();
    const currentUnitSize = keyVariant === 'small' ? 30 : keyVariant === 'medium' ? 45 : UNIT_SIZE;

    // Use a ref to control polling loop to avoid stale closures if using setInterval
    const pollingRef = useRef<boolean>(true);

    useEffect(() => {
        pollingRef.current = true;
        let timeoutId: any;

        const poll = async () => {
            if (!pollingRef.current) return;

            if (isConnected && keyboard) {
                try {
                    const matrix = await pollMatrix();
                    // matrix is boolean[][]
                    const newlyPressed = new Set<string>();

                    if (matrix && matrix.length) {
                        matrix.forEach((row, rowIndex) => {
                            row.forEach((isPressed, colIndex) => {
                                if (isPressed) {
                                    newlyPressed.add(`${rowIndex}-${colIndex}`);
                                }
                            });
                        });
                        setPressedKeys(newlyPressed);

                        if (newlyPressed.size > 0) {
                            setDetectedKeys(prev => {
                                const next = new Set(prev);
                                let changed = false;
                                newlyPressed.forEach(k => {
                                    if (!next.has(k)) {
                                        next.add(k);
                                        changed = true;
                                    }
                                });
                                return changed ? next : prev;
                            });
                        }
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }

            if (pollingRef.current) {
                timeoutId = setTimeout(poll, 50); // Poll every 50ms
            }
        };

        poll();

        return () => {
            pollingRef.current = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [pollMatrix, isConnected, keyboard]);

    useEffect(() => {
        if (!isConnected) {
            setPressedKeys(new Set());
            setDetectedKeys(new Set());
        }
    }, [isConnected]);

    // Calculate keyboard dimensions
    const calculateKeyboardSize = () => {
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
    };

    const { width, height } = calculateKeyboardSize();

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="keyboard-layout relative" style={{ width: `${width}px`, height: `${height}px` }}>
                {Object.entries(SVALBOARD_LAYOUT).map(([matrixPos, layout]) => {
                    const pos = Number(matrixPos);
                    const row = Math.floor(pos / MATRIX_COLS);
                    const col = pos % MATRIX_COLS;
                    const keyId = `${row}-${col}`;
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
                            disableHover={true}
                            // Make it blank
                            keyContents={{ type: "text", str: "" }}
                        />
                    );
                })}
            </div>

            <div className="absolute bottom-5 right-5 z-50">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setDetectedKeys(new Set())}
                            className="w-12 h-12 rounded-2xl cursor-pointer hover:bg-gray-50 bg-white shadow-lg flex items-center justify-center text-black focus:outline-none transition-colors border border-gray-200"
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
