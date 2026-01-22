import MainScreen from "./components/MainScreen";
import { ChangesProvider } from "./contexts/ChangesContext";
import { KeyBindingProvider } from "./contexts/KeyBindingContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { VialProvider } from "./contexts/VialContext";



function App() {
    return (
        <VialProvider>
            <SettingsProvider>
                <ChangesProvider>
                    <KeyBindingProvider>
                        <MainScreen />
                    </KeyBindingProvider>
                </ChangesProvider>
            </SettingsProvider>
        </VialProvider>
    );
}

export default App;
