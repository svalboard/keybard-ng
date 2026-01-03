import MainScreen from "./components/MainScreen";
import { ChangesProvider } from "./contexts/ChangesContext";
import { KeyBindingProvider } from "./contexts/KeyBindingContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { VialProvider } from "./contexts/VialContext";

import { LayoutSettingsProvider } from "./contexts/LayoutSettingsContext";

function App() {
    return (
        <VialProvider>
            <SettingsProvider>
                <ChangesProvider>
                    <KeyBindingProvider>
                        <LayoutSettingsProvider>
                            <MainScreen />
                        </LayoutSettingsProvider>
                    </KeyBindingProvider>
                </ChangesProvider>
            </SettingsProvider>
        </VialProvider>
    );
}

export default App;
