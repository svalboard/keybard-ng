import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { useSidebar } from "@/components/ui/sidebar";

interface PanelsContextType {
    activePanel: string | undefined | null;
    panelToGoBack: string | undefined | null;
    setPanelToGoBack: React.Dispatch<React.SetStateAction<string | null>>;
    setActivePanel: React.Dispatch<React.SetStateAction<string | null>>;
    handleCloseDetails: () => void;
    openDetails: () => void;
    alternativeHeader: boolean;
    setAlternativeHeader: React.Dispatch<React.SetStateAction<boolean>>;
    handleCloseEditor: () => void;
    itemToEdit: number | null;
    setItemToEdit: React.Dispatch<React.SetStateAction<number | null>>;
    bindingTypeToEdit: string | null;
    setBindingTypeToEdit: React.Dispatch<React.SetStateAction<string | null>>;

    name: string;
    state: "expanded" | "collapsed";
    open: boolean;
    setOpen: (value: boolean | ((value: boolean) => boolean)) => void;
    openMobile: boolean;
    setOpenMobile: (value: boolean | ((value: boolean) => boolean)) => void;
    isMobile: boolean;
    toggleSidebar: () => void;
}

const PanelsContext = createContext<PanelsContextType | undefined>(undefined);

export const PanelsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const [alternativeHeader, setAlternativeHeader] = useState<boolean>(false);
    const [panelToGoBack, setPanelToGoBack] = useState<string | null>(null);
    const [itemToEdit, setItemToEdit] = useState<number | null>(null);
    const [bindingTypeToEdit, setBindingTypeToEdit] = useState<string | null>(null);

    const sidebar = useSidebar("details-panel", { defaultOpen: false });
    const { isMobile, open: detailsOpen, setOpen, setOpenMobile } = sidebar;

    const openDetails = useCallback(() => {
        if (isMobile) {
            setOpenMobile(true);
        } else {
            setOpen(true);
        }
    }, [isMobile, setOpen, setOpenMobile]);

    const closeDetails = useCallback(() => {
        if (isMobile) {
            setOpenMobile(false);
        } else {
            setOpen(false);
        }
    }, [isMobile, setOpen, setOpenMobile]);

    useEffect(() => {
        if (activePanel && activePanel !== "matrixtester" && !detailsOpen) {
            openDetails();
        }

        if (!activePanel && detailsOpen) {
            closeDetails();
        }
    }, [activePanel, detailsOpen, openDetails, closeDetails]);

    const handleCloseDetails = useCallback(() => {
        closeDetails();
        setActivePanel(null);
    }, [closeDetails]);

    const handleCloseEditor = useCallback(() => {
        setItemToEdit(null);
        setActivePanel(panelToGoBack);
        setAlternativeHeader(false);
        setPanelToGoBack(null);
    }, [panelToGoBack]);

    return (
        <PanelsContext.Provider
            value={{
                activePanel,
                setActivePanel,
                handleCloseDetails,
                openDetails,
                alternativeHeader,
                setAlternativeHeader,
                panelToGoBack,
                setPanelToGoBack,
                handleCloseEditor,
                itemToEdit,
                setItemToEdit,
                bindingTypeToEdit,
                setBindingTypeToEdit,
                ...sidebar,
            }}
        >
            {children}
        </PanelsContext.Provider>
    );
};

export const usePanels = (): PanelsContextType => {
    const context = useContext(PanelsContext);
    if (!context) {
        throw new Error("useVial must be used within a VialProvider");
    }
    return context;
};
