import React, { createContext, useContext, useState, ReactNode } from "react";

interface LayoutSettingsContextType {
    internationalLayout: string;
    setInternationalLayout: (layout: string) => void;
}

const LayoutSettingsContext = createContext<LayoutSettingsContextType | undefined>(undefined);

export const LayoutSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [internationalLayout, setInternationalLayout] = useState<string>("us");

    return (
        <LayoutSettingsContext.Provider value={{ internationalLayout, setInternationalLayout }}>
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
