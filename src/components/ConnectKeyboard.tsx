import { useEffect, useRef, useState } from "react";

import { Button } from "./ui/button";
import { useVial } from "@/contexts/VialContext";

const ConnectKeyboard = () => {
    const { isConnected, connect, disconnect, loadKeyboard, loadFromFile } = useVial();
    const [loading, setLoading] = useState(false);
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
        setError(null);
        try {
            await disconnect();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error occurred");
        } finally {
            setLoading(false);
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
            <h2 className="mb-4 text-center text-2xl font-semibold">Welcome to Keybard!</h2>
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
                            {!isConnected ? (
                                <Button onClick={handleConnect} disabled={loading} variant={"kb-primary"}>
                                    {loading ? "Connecting..." : "Connect Keyboard"}
                                </Button>
                            ) : (
                                <Button onClick={handleDisconnect} disabled={loading}>
                                    {loading ? "Disconnecting..." : "Disconnect"}
                                </Button>
                            )}
                            <p className="text-sm font-bold text-center text-gray-700">or</p>
                            <Button onClick={() => fileInputRef.current?.click()} disabled={loading} variant={"outline"}>
                                {loading ? "Loading..." : "Load File"}
                            </Button>
                            <input ref={fileInputRef} type="file" accept=".kbi,application/json" style={{ display: "none" }} onChange={handleLoadFile} />
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
