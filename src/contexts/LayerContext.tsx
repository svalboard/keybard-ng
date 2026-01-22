
import React, { createContext, useContext, useState } from "react";

interface LayerContextType {
    selectedLayer: number;
    setSelectedLayer: (layer: number) => void;
}

const LayerContext = createContext<LayerContextType | undefined>(undefined);

export const LayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedLayer, setSelectedLayer] = useState(0);

    return (
        <LayerContext.Provider
            value={{
                selectedLayer,
                setSelectedLayer,
            }}
        >
            {children}
        </LayerContext.Provider>
    );
};

export const useLayer = (): LayerContextType => {
    const context = useContext(LayerContext);
    if (!context) {
        throw new Error("useLayer must be used within a LayerProvider");
    }
    return context;
};
