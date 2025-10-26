import ComboIcon from "@/components/ComboIcon";
import { useVial } from "@/contexts/VialContext";
import BindingsList from "../components/BindingsList";

const CombosPanel = () => {
    const { keyboard } = useVial();
    const combos = (keyboard as any)?.combos || [];
    return <BindingsList icon={<ComboIcon className="h-4 w-4 text-white" />} items={combos} bindingType="combos" notBindable />;
};

export default CombosPanel;
