import Keyboard, { KeyboardOptions } from "react-simple-keyboard";

import { commonKeyboardOptions } from "@/shared/CommonKeyboardOptions";
import { useRef } from "react";

const MediaKeys = () => {
    const mediaKeysRef = useRef(null);
    const keyboardOptions: KeyboardOptions = {
        ...commonKeyboardOptions,
        /**
         * Layout by:
         * Sterling Butters (https://github.com/SterlingButters)
         */
        layout: {
            default: [
                // Row 1
                "{KC_PWR} {KC_SLEP} {KC_WAKE} {KC_EXEC} {KC_HELP} {KC_SLCT} {KC_STOP} {KC_AGIN}",
                // Row 2
                "{KC_UNDO} {KC_CUT} {KC_COPY} {KC_PSTE} {KC_FIND} {KC_CALC} {KC_MAIL} {KC_MSEL}",
                // Row 3
                "{KC_MYCM} {KC_WSCH} {KC_WHOM} {KC_WBAK} {KC_WFWD} {KC_WSTP} {KC_WREF}",
                // Row 4
                "{KC_WFAV} {KC_BRIU} {KC_BRID} {KC_MPRV} {KC_MNXT} {KC_MUTE} {KC_VOLD}",
                "{KC_VOLU} {KC_MSTP} {KC_MPLY} {KC_MRWD} {KC_MFFD}",
                "{KC_EJCT} {KC_LCAP} {KC_LNUM} {KC_LSCR}",
            ],
            shift: [
                // same layout for shift
                "{KC_PWR} {KC_SLEP} {KC_WAKE} {KC_EXEC} {KC_HELP} {KC_SLCT} {KC_STOP} {KC_AGIN} {KC_UNDO} {KC_CUT} {KC_COPY}",
                "{KC_PSTE} {KC_FIND} {KC_CALC} {KC_MAIL} {KC_MSEL} {KC_MYCM} {KC_WSCH} {KC_WHOM} {KC_WBAK} {KC_WFWD} {KC_WSTP}",
                "{KC_WREF} {KC_WFAV} {KC_BRIU} {KC_BRID} {KC_MPRV} {KC_MNXT} {KC_MUTE} {KC_VOLD} {KC_VOLU} {KC_MSTP} {KC_MPLY}",
                "{KC_MRWD} {KC_MFFD} {KC_EJCT} {KC_LCAP} {KC_LNUM} {KC_LSCR}",
            ],
        },
        display: {
            "{KC_PWR}": "Power",
            "{KC_SLEP}": "Sleep",
            "{KC_WAKE}": "Wake",
            "{KC_EXEC}": "Exec",
            "{KC_HELP}": "Help",
            "{KC_SLCT}": "Select",
            "{KC_STOP}": "Stop",
            "{KC_AGIN}": "Again",
            "{KC_UNDO}": "Undo",
            "{KC_CUT}": "Cut",
            "{KC_COPY}": "Copy",
            "{KC_PSTE}": "Paste",
            "{KC_FIND}": "Find",
            "{KC_CALC}": "Calc",
            "{KC_MAIL}": "Mail",
            "{KC_MSEL}": "Media Player",
            "{KC_MYCM}": "My PC",
            "{KC_WSCH}": "Browser Search",
            "{KC_WHOM}": "Browser Home",
            "{KC_WBAK}": "Browser Back",
            "{KC_WFWD}": "Browser Forward",
            "{KC_WSTP}": "Browser Stop",
            "{KC_WREF}": "Browser Refresh",
            "{KC_WFAV}": "Browser Fav.",
            "{KC_BRIU}": "Bright. Up",
            "{KC_BRID}": "Bright. Down",
            "{KC_MPRV}": "Media Prev",
            "{KC_MNXT}": "Media Next",
            "{KC_MUTE}": "Mute",
            "{KC_VOLD}": "Vol -",
            "{KC_VOLU}": "Vol +",
            "{KC_MSTP}": "Media Stop",
            "{KC_MPLY}": "Media Play",
            "{KC_MRWD}": "Prev Track (macOS)",
            "{KC_MFFD}": "Next Track (macOS)",
            "{KC_EJCT}": "Eject",
            "{KC_LCAP}": "Locking Caps",
            "{KC_LNUM}": "Locking Num",
            "{KC_LSCR}": "Locking Scroll",
        },
    };
    return (
        <div>
            <span className="font-semibold text-lg text-slate-700">Media keys</span>
            <Keyboard ref={(r: any) => (mediaKeysRef.current = r)} layoutName="default" {...keyboardOptions} />
        </div>
    );
};

export default MediaKeys;
