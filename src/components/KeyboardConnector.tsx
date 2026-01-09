import "./KeyboardConnector.css";

import React, { useEffect, useRef, useState } from "react";

import { useVial } from "../contexts/VialContext";
import { Keyboard } from "./Keyboard";
import { QMKSettings } from "./QMKSettings";
import { Button } from "./ui/button";

const KeyboardConnector: React.FC = () => {
    const { keyboard, isConnected, isWebHIDSupported, loadedFrom, connect, disconnect, loadKeyboard, loadFromFile } = useVial();
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
        <div className="keyboard-connector">
            {!isWebHIDSupported ? (
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
                    <div className="connection-status">
                        <h2>Connection Status</h2>
                        <p className={`status ${isConnected ? "connected" : "disconnected"}`}>{isConnected ? "🟢 Connected" : "🔴 Disconnected"}</p>
                    </div>

                    <div className="connection-actions">
                        {!isConnected ? (
                            <Button onClick={handleConnect} disabled={loading}>
                                {loading ? "Connecting..." : "Connect Keyboard"}
                            </Button>
                        ) : (
                            <Button onClick={handleDisconnect} disabled={loading}>
                                {loading ? "Disconnecting..." : "Disconnect"}
                            </Button>
                        )}
                        <Button onClick={() => fileInputRef.current?.click()} disabled={loading}>
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

            {keyboard && (
                <div className="keyboard-info">
                    <h3>Keyboard Information</h3>
                    <dl>
                        {loadedFrom && (
                            <>
                                <dt>Loaded From:</dt>
                                <dd>{loadedFrom}</dd>
                            </>
                        )}
                        <dt>Keyboard ID:</dt>
                        <dd>{keyboard.kbid}</dd>
                        <dt>VIA Protocol:</dt>
                        <dd>{keyboard.via_proto}</dd>
                        <dt>Vial Protocol:</dt>
                        <dd>{keyboard.vial_proto}</dd>
                        {keyboard.sval_proto !== undefined && keyboard.sval_proto > 0 && (
                            <>
                                <dt>Svalboard Protocol:</dt>
                                <dd>{keyboard.sval_proto}</dd>
                                <dt>Svalboard Firmware:</dt>
                                <dd>{keyboard.sval_firmware || "Unknown"}</dd>
                            </>
                        )}
                        <dt>Matrix Size:</dt>
                        <dd>
                            {keyboard.rows} rows × {keyboard.cols} cols
                        </dd>
                        {keyboard.layers && (
                            <>
                                <dt>Layers:</dt>
                                <dd>{keyboard.layers}</dd>
                            </>
                        )}
                    </dl>

                    {keyboard.keymap && (
                        <Keyboard
                            keyboard={keyboard}
                            selectedLayer={0}
                            setSelectedLayer={() => { }}
                            onKeyClick={(layer, row, col) => {
                                console.log(`Clicked key at layer ${layer}, row ${row}, col ${col}`);
                            }}
                        />
                    )}

                    {keyboard.settings && <QMKSettings keyboard={keyboard} />}
                </div>
            )}
        </div>
    );
};

export default KeyboardConnector;
