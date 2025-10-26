import Keyboard, { KeyboardOptions } from "react-simple-keyboard";

import { commonKeyboardOptions } from "@/shared/CommonKeyboardOptions";
import { useRef } from "react";

const AudioKeys = () => {
    const functionKeysRef = useRef(null);
    const keyboardOptions: KeyboardOptions = {
        ...commonKeyboardOptions,
        /**
         * Layout by:
         * Sterling Butters (https://github.com/SterlingButters)
         *
         * Layout rows follow the provided HTML data-key order, max 9 keys per row.
         */
        layout: {
            default: [
                // Row 1 (9)
                "{AU_ON} {AU_OFF} {AU_TOG} {CLICKY_TOGGLE} {CLICKY_UP}",
                "{CLICKY_DOWN} {CLICKY_RESET} {MU_ON} {MU_OFF} {MU_TOG}",
                // Row 2 (9)
                "{MU_MOD} {HPT_ON} {HPT_OFF} {HPT_TOG} {HPT_RST}",
                "{HPT_FBK} {HPT_BUZ} {HPT_MODI} {HPT_MODD} {HPT_CONT} {HPT_CONI}",
                // Row 3 (9)
                "{HPT_COND} {HPT_DWLI} {HPT_DWLD} {KC_ASDN} {KC_ASUP} {KC_ASRP}",
                // Row 4 (remaining 6)
                "{KC_ASON} {KC_ASOFF} {KC_ASTG} {CMB_ON} {CMB_OFF} {CMB_TOG}",
            ],
            shift: [
                // same as default
                "{AU_ON} {AU_OFF} {AU_TOG} {CLICKY_TOGGLE} {CLICKY_UP} {CLICKY_DOWN} {CLICKY_RESET} {MU_ON} {MU_OFF}",
                "{MU_TOG} {MU_MOD} {HPT_ON} {HPT_OFF} {HPT_TOG} {HPT_RST} {HPT_FBK} {HPT_BUZ} {HPT_MODI}",
                "{HPT_MODD} {HPT_CONT} {HPT_CONI} {HPT_COND} {HPT_DWLI} {HPT_DWLD} {KC_ASDN} {KC_ASUP} {KC_ASRP}",
                "{KC_ASON} {KC_ASOFF} {KC_ASTG} {CMB_ON} {CMB_OFF} {CMB_TOG}",
            ],
        },
        display: {
            "{AU_ON}": "Audio ON",
            "{AU_OFF}": "Audio OFF",
            "{AU_TOG}": "Audio Toggle",
            "{CLICKY_TOGGLE}": "Clicky Toggle",
            "{CLICKY_UP}": "Clicky Up",
            "{CLICKY_DOWN}": "Clicky Down",
            "{CLICKY_RESET}": "Clicky Reset",
            "{MU_ON}": "Music On",
            "{MU_OFF}": "Music Off",
            "{MU_TOG}": "Music Toggle",
            "{MU_MOD}": "Music Cycle",
            "{HPT_ON}": "Haptic On",
            "{HPT_OFF}": "Haptic Off",
            "{HPT_TOG}": "Haptic Toggle",
            "{HPT_RST}": "Haptic Reset",
            "{HPT_FBK}": "Haptic Feed back",
            "{HPT_BUZ}": "Haptic Buzz",
            "{HPT_MODI}": "Haptic Next",
            "{HPT_MODD}": "Haptic Prev",
            "{HPT_CONT}": "Haptic Cont.",
            "{HPT_CONI}": "Haptic +",
            "{HPT_COND}": "Haptic -",
            "{HPT_DWLI}": "Haptic Dwell+",
            "{HPT_DWLD}": "Haptic Dwell-",
            "{KC_ASDN}": "Auto- shift Down",
            "{KC_ASUP}": "Auto- shift Up",
            "{KC_ASRP}": "Auto- shift Report",
            "{KC_ASON}": "Auto- shift On",
            "{KC_ASOFF}": "Auto- shift Off",
            "{KC_ASTG}": "Auto- shift Toggle",
            "{CMB_ON}": "Combo On",
            "{CMB_OFF}": "Combo Off",
            "{CMB_TOG}": "Combo Toggle",
        },
    };
    return (
        <div>
            <span className="font-semibold text-lg text-slate-700">Audio & haptic keys</span>
            <Keyboard ref={(r: any) => (functionKeysRef.current = r)} layoutName="default" {...keyboardOptions} />
        </div>
    );
};

export default AudioKeys;
