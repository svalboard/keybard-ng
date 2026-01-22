import { Label } from "@/components/ui/label";
import { Switch as CnSwitch } from "@/components/ui/switch";
import { FC } from "react";

interface Props {
    label: string;
    value?: string | number | readonly string[] | undefined;
}

const Switch: FC<Props> = ({ label, value }) => {
    return (
        <div className="flex items-center space-x-4 w-full">
            <CnSwitch id="airplane-mode" value={value} />
            <Label htmlFor="airplane-mode" className="font-normal">
                {label}
            </Label>
        </div>
    );
};

export default Switch;
