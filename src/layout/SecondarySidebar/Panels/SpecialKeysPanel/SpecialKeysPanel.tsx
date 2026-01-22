import AudioKeys from "./AudioKeys";
import BacklightsKeys from "./BacklightsKeys";
import MediaKeys from "./MediaKeys";
import StenoKeys from "./StenoKeys";

interface Props {
    isPicker?: boolean;
}

const SpecialKeysPanel = ({ isPicker }: Props) => {
    return (
        <div className="flex flex-col gap-4">
            {isPicker && (
                <div className="pb-2">
                    <span className="font-semibold text-xl text-slate-700">Special Keys</span>
                </div>
            )}
            <MediaKeys />
            <AudioKeys />
            <StenoKeys />
            <BacklightsKeys />
        </div>
    );
};

export default SpecialKeysPanel;
