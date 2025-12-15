import MainScreen from "./components/MainScreen";
import { ChangesProvider } from "./contexts/ChangesContext";
import { KeyBindingProvider } from "./contexts/KeyBindingContext";
import { VialProvider } from "./contexts/VialContext";

function App() {
    return (
        <VialProvider>
            <ChangesProvider>
                <KeyBindingProvider>
                    <MainScreen />
                </KeyBindingProvider>
            </ChangesProvider>
        </VialProvider>
    );
}

export default App;
