import Keyboard, { KeyboardOptions } from "react-simple-keyboard";

import { commonKeyboardOptions } from "@/shared/CommonKeyboardOptions";
import { useRef } from "react";

const BacklightsKeys = () => {
    const backlightsRef = useRef(null);
    const keyboardOptions: KeyboardOptions = {
        ...commonKeyboardOptions,
        /**
         * Backlight / RGB layout following provided HTML. 3 rows of 9 keys.
         */
        layout: {
            default: [
                // Row 1 (9)
                "{BL_TOGG} {BL_STEP} {BL_BRTG} {BL_ON} {BL_OFF} {BL_INC} {BL_DEC}",
                // Row 2 (9)
                "{RGB_TOG} {RGB_MOD} {RGB_RMOD} {RGB_HUI} {RGB_HUD} {RGB_SAI}",
                "{RGB_SAD} {RGB_VAI} {RGB_VAD} {RGB_SPI} {RGB_SPD} {RGB_M_P} {RGB_M_B}",
                // Row 3 (9)
                "{RGB_M_R} {RGB_M_SW} {RGB_M_SN} {RGB_M_K} {RGB_M_X} {RGB_M_G} {RGB_M_T}",
            ],
            shift: [
                "{BL_TOGG} {BL_STEP} {BL_BRTG} {BL_ON} {BL_OFF} {BL_INC} {BL_DEC} {RGB_TOG} {RGB_MOD}",
                "{RGB_RMOD} {RGB_HUI} {RGB_HUD} {RGB_SAI} {RGB_SAD} {RGB_VAI} {RGB_VAD} {RGB_SPI} {RGB_SPD}",
                "{RGB_M_P} {RGB_M_B} {RGB_M_R} {RGB_M_SW} {RGB_M_SN} {RGB_M_K} {RGB_M_X} {RGB_M_G} {RGB_M_T}",
            ],
        },
        display: {
            "{BL_TOGG}": "BL Toggle",
            "{BL_STEP}": "BL Cycle",
            "{BL_BRTG}": "BL Breath",
            "{BL_ON}": "BL On",
            "{BL_OFF}": "BL Off",
            "{BL_INC}": "BL +",
            "{BL_DEC}": "BL -",
            "{RGB_TOG}": "RGB Toggle",
            "{RGB_MOD}": "RGB Mode +",
            "{RGB_RMOD}": "RGB Mode -",
            "{RGB_HUI}": "Hue +",
            "{RGB_HUD}": "Hue -",
            "{RGB_SAI}": "Sat +",
            "{RGB_SAD}": "Sat -",
            "{RGB_VAI}": "Bright +",
            "{RGB_VAD}": "Bright -",
            "{RGB_SPI}": "Effect +",
            "{RGB_SPD}": "Effect -",
            "{RGB_M_P}": "RGB Mode P",
            "{RGB_M_B}": "RGB Mode B",
            "{RGB_M_R}": "RGB Mode R",
            "{RGB_M_SW}": "RGB Mode SW",
            "{RGB_M_SN}": "RGB Mode SN",
            "{RGB_M_K}": "RGB Mode K",
            "{RGB_M_X}": "RGB Mode X",
            "{RGB_M_G}": "RGB Mode G",
            "{RGB_M_T}": "RGB Mode T",
        },
    };
    return (
        <div>
            <span className="font-semibold text-lg text-slate-700">Backlight & RGB keys</span>
            <Keyboard ref={(r: any) => (backlightsRef.current = r)} layoutName="default" {...keyboardOptions} />
        </div>
    );
};

export default BacklightsKeys;
