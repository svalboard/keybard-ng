import { useEffect, useRef, useState } from "react";

import { Button } from "./ui/button";
import { useVial } from "@/contexts/VialContext";

const ConnectKeyboard = () => {
    const { isConnected, connect, disconnect, loadKeyboard, loadFromFile } = useVial();
    const [loading, setLoading] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isConnected) {
            return;
        }
        setLoading(true);
        (async () => {
            await loadKeyboard();
            setLoading(false);
        })();
        return () => {
            if (loading) {
                setLoading(false);
            }
        };
    }, [isConnected]);

    const handleConnect = async () => {
        setLoading(true);
        setError(null);
        try {
            const success = await connect();
            if (!success) {
                setError("Failed to connect to keyboard");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setLoading(true);
        setIsDisconnecting(true);
        setError(null);
        try {
            await disconnect();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error occurred");
        } finally {
            setLoading(false);
            setIsDisconnecting(false);
        }
    };

    const handleLoadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        try {
            await loadFromFile(file);
        } catch (err) {
            if (err instanceof Error) {
                if (err.message === "Invalid JSON") {
                    setError("Invalid JSON");
                } else if (err.message === "Invalid file") {
                    setError("Invalid file");
                } else if (err.message === "File too large") {
                    setError("File too large (max 1MB)");
                } else {
                    setError(err.message);
                }
            }
        } finally {
            setLoading(false);
            // Reset input so same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
    return (
        <div className="h-full flex flex-col justify-center">
            <div className="flex flex-col items-center mb-2">
                <div className="flex flex-row items-center gap-4">
                    <svg width="38" height="38" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M5.7998 0.884241V3.46595C5.7998 3.95425 6.1146 4.3501 6.50293 4.3501L22.4967 4.3501C22.885 4.3501 23.1998 3.95425 23.1998 3.46595V0.884241C23.1998 0.395941 22.885 9.58443e-05 22.4967 9.58443e-05L6.50293 9.58443e-05C6.1146 9.58443e-05 5.7998 0.395941 5.7998 0.884241Z"
                            fill="black"
                        ></path>
                        <path
                            d="M28.1162 5.7998H25.5345C25.0462 5.7998 24.6504 6.1146 24.6504 6.50293V22.4967C24.6504 22.885 25.0462 23.1998 25.5345 23.1998H28.1162C28.6045 23.1998 29.0004 22.885 29.0004 22.4967V6.50293C29.0004 6.1146 28.6045 5.7998 28.1162 5.7998Z"
                            fill="black"
                        ></path>
                        <path
                            d="M3.46585 5.7998H0.884147C0.395846 5.7998 0 6.1146 0 6.50293V22.4967C0 22.885 0.395846 23.1998 0.884147 23.1998H3.46585C3.95416 23.1998 4.35 22.885 4.35 22.4967V6.50293C4.35 6.1146 3.95416 5.7998 3.46585 5.7998Z"
                            fill="black"
                        ></path>
                        <path
                            d="M5.7998 25.5341V28.1159C5.7998 28.6042 6.1146 29 6.50293 29H22.4967C22.885 29 23.1998 28.6042 23.1998 28.1159V25.5341C23.1998 25.0458 22.885 24.65 22.4967 24.65H6.50293C6.1146 24.65 5.7998 25.0458 5.7998 25.5341Z"
                            fill="black"
                        ></path>
                        <path
                            d="M14.5 21.75C18.5041 21.75 21.75 18.5041 21.75 14.5C21.75 10.4959 18.5041 7.25 14.5 7.25C10.4959 7.25 7.25 10.4959 7.25 14.5C7.25 18.5041 10.4959 21.75 14.5 21.75Z"
                            fill="black"
                        ></path>
                    </svg>
                    <span className="text-[33px] font-semibold tracking-tight">keybard</span>
                </div>
            </div>
            <div className="p-10 max-w-xl mx-auto rounded-md border-dashed border-1 border-gray-300">
                {false ? (
                    <div className="browser-not-supported">
                        <h2>Browser Not Supported</h2>
                        <p className="error-message">⚠️ Your browser does not support WebHID API, which is required for connecting to your keyboard.</p>
                        <p>Please use one of the following browsers:</p>
                        <ul>
                            <li>Google Chrome (version 89+)</li>
                            <li>Microsoft Edge (version 89+)</li>
                            <li>Opera (version 75+)</li>
                            <li>Brave</li>
                        </ul>
                        <p>Note: Firefox and Safari do not currently support WebHID.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-1 w-50 mx-auto">
                            {!isConnected || (loading && !isDisconnecting) ? (
                                <Button onClick={handleConnect} disabled={loading} variant={"kb-primary"}>
                                    {loading ? "Connecting..." : "Connect Keyboard"}
                                </Button>
                            ) : (
                                <Button onClick={handleDisconnect} disabled={loading}>
                                    {loading ? "Disconnecting..." : "Disconnect"}
                                </Button>
                            )}
                            {!(loading && !isDisconnecting) && (
                                <>
                                    <p className="text-sm font-bold text-center text-gray-700">or</p>
                                    <Button onClick={() => fileInputRef.current?.click()} disabled={loading} variant={"outline"}>
                                        {loading ? "Loading..." : "Load File"}
                                    </Button>
                                    <input ref={fileInputRef} type="file" accept=".kbi,application/json" style={{ display: "none" }} onChange={handleLoadFile} />
                                </>
                            )}
                        </div>
                    </>
                )}

                {error && (
                    <div className="error-message">
                        <p>❌ {error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConnectKeyboard;
