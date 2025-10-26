import OverridesIcon from "@/components/icons/Overrides";
import { useVial } from "@/contexts/VialContext";
import BindingsList from "../components/BindingsList";

const OverridesPanel = () => {
    const { keyboard } = useVial();
    const overrides = (keyboard as any)?.key_overrides || [];
    return <BindingsList icon={<OverridesIcon className="h-4 w-4 text-white" />} items={overrides} bindingType="overrides" notBindable />;
};

export default OverridesPanel;
