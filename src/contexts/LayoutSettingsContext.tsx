import React, { createContext, useContext, useState, ReactNode } from "react";

export type KeyVariant = "default" | "medium" | "small";

interface LayoutSettingsContextType {
    internationalLayout: string;
    setInternationalLayout: (layout: string) => void;
    keyVariant: KeyVariant;
    setKeyVariant: (variant: KeyVariant) => void;
}

const LayoutSettingsContext = createContext<LayoutSettingsContextType | undefined>(undefined);

export const LayoutSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [internationalLayout, setInternationalLayout] = useState<string>("us");
    const [keyVariant, setKeyVariant] = useState<KeyVariant>("default");

    return (
        <LayoutSettingsContext.Provider value={{
            internationalLayout,
            setInternationalLayout,
            keyVariant,
            setKeyVariant
        }}>
            {children}
        </LayoutSettingsContext.Provider>
    );
};

export const useLayoutSettings = () => {
    const context = useContext(LayoutSettingsContext);
    if (!context) {
        throw new Error("useLayoutSettings must be used within a LayoutSettingsProvider");
    }
    return context;
};
