import { FC, useState } from "react";

import { cn } from "@/lib/utils";

interface Props {
    label: string;
}

const HoldableButton: FC<Props> = ({ label }) => {
    const [value, setValue] = useState(false);
    return (
        <div
            className={cn(
                "px-5 text-center py-1 bg-transparent hover:bg-black hover:text-white rounded-full cursor-pointer text-center",
                value && "bg-black text-white hover:bg-slate-600"
            )}
            onClick={() => setValue((val) => !val)}
        >
            {label}
        </div>
    );
};

export default HoldableButton;
