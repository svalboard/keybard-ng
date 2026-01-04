export interface LayoutDefinition {
    label: string;
    value: string;
    default: string[];
    shift: string[];
}

export const LAYOUTS: Record<string, LayoutDefinition> = {
    us: {
        label: "English (US)",
        value: "us",
        default: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "` 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
            "{tab} q w e r t y u i o p [ ] \\",
            "{capslock} a s d f g h j k l ; ' {enter}",
            "{shiftleft} z x c v b n m , . / {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ],
        shift: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "~ ! @ # $ % ^ & * ( ) _ + {backspace}",
            "{tab} Q W E R T Y U I O P { } |",
            '{capslock} A S D F G H J K L : " {enter}',
            "{shiftleft} Z X C V B N M < > ? {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ]
    },
    uk: {
        label: "English (UK)",
        value: "uk",
        default: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "` 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
            "{tab} q w e r t y u i o p [ ] #",
            "{capslock} a s d f g h j k l ; ' {enter}",
            "{shiftleft} \\ z x c v b n m , . / {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ],
        shift: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "¬ ! \" £ $ % ^ & * ( ) _ + {backspace}",
            "{tab} Q W E R T Y U I O P { } ~",
            '{capslock} A S D F G H J K L : @ {enter}',
            "{shiftleft} | Z X C V B N M < > ? {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ]
    },
    german: {
        label: "German",
        value: "german",
        default: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "^ 1 2 3 4 5 6 7 8 9 0 ß ´ {backspace}",
            "{tab} q w e r t z u i o p ü +",
            "{capslock} a s d f g h j k l ö ä # {enter}",
            "{shiftleft} < y x c v b n m , . - {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ],
        shift: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "° ! \" § $ % & / ( ) = ? ` {backspace}",
            "{tab} Q W E R T Z U I O P Ü *",
            "{capslock} A S D F G H J K L Ö Ä ' {enter}",
            "{shiftleft} > Y X C V B N M ; : _ {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ]
    },
    french: {
        label: "French",
        value: "french",
        default: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "² & é \" ' ( - è _ {cedilla} à ) = {backspace}",
            "{tab} a z e r t y u i o p ^ $",
            "{capslock} q s d f g h j k l m ù * {enter}",
            "{shiftleft} < w x c v b n , ; : ! {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ],
        shift: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "³ 1 2 3 4 5 6 7 8 9 0 ° + {backspace}",
            "{tab} A Z E R T Y U I O P ¨ £",
            "{capslock} Q S D F G H J K L M % µ {enter}",
            "{shiftleft} > W X C V B N ? . / § {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ]
    },
    spanish: {
        label: "Spanish",
        value: "spanish",
        default: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "º 1 2 3 4 5 6 7 8 9 0 ' ¡ {backspace}",
            "{tab} q w e r t y u i o p ` +",
            "{capslock} a s d f g h j k l ñ ´ ç {enter}",
            "{shiftleft} < z x c v b n m , . - {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ],
        shift: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "ª ! \" · $ % & / ( ) = ? ¿ {backspace}",
            "{tab} Q W E R T Y U I O P ^ *",
            "{capslock} A S D F G H J K L Ñ ¨ Ç {enter}",
            "{shiftleft} > Z X C V B N M ; : _ {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ]
    },
    italian: {
        label: "Italian",
        value: "italian",
        default: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "\\ 1 2 3 4 5 6 7 8 9 0 ' ì {backspace}",
            "{tab} q w e r t y u i o p è +",
            "{capslock} a s d f g h j k l ò à ù {enter}",
            "{shiftleft} < z x c v b n m , . - {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ],
        shift: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "| ! \" £ $ % & / ( ) = ? ^ {backspace}",
            "{tab} Q W E R T Y U I O P é *",
            "{capslock} A S D F G H J K L ç ° § {enter}",
            "{shiftleft} > Z X C V B N M ; : _ {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ]
    },
    br: {
        label: "Portuguese (Brazil)",
        value: "br",
        default: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "' 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
            "{tab} q w e r t y u i o p ´ [",
            "{capslock} a s d f g h j k l ç ~ ] {enter}",
            "{shiftleft} \\ z x c v b n m , . ; / {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ],
        shift: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "\" ! @ # $ % ¨ & * ( ) _ + {backspace}",
            "{tab} Q W E R T Y U I O P ` {",
            "{capslock} A S D F G H J K L Ç ^ } {enter}",
            "{shiftleft} | Z X C V B N M < > : ? {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ]
    },
    danish: {
        label: "Danish",
        value: "danish",
        default: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "½ 1 2 3 4 5 6 7 8 9 0 + ´ {backspace}",
            "{tab} q w e r t y u i o p å ¨",
            "{capslock} a s d f g h j k l æ ø ' {enter}",
            "{shiftleft} < z x c v b n m , . - {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ],
        shift: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "§ ! \" # ¤ % & / ( ) = ? ` {backspace}",
            "{tab} Q W E R T Y U I O P Å ^",
            "{capslock} A S D F G H J K L Æ Ø * {enter}",
            "{shiftleft} > Z X C V B N M ; : _ {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ]
    },
    swiss: {
        label: "Swiss",
        value: "swiss",
        default: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "§ 1 2 3 4 5 6 7 8 9 0 ' ^ {backspace}",
            "{tab} q w e r t z u i o p ü ¨",
            "{capslock} a s d f g h j k l ö ä $ {enter}",
            "{shiftleft} < y x c v b n m , . - {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ],
        shift: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "° + \" * ç % & / ( ) = ? ` {backspace}",
            "{tab} Q W E R T Z U I O P è !",
            "{capslock} A S D F G H J K L é à £ {enter}",
            "{shiftleft} > Y X C V B N M ; : _ {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ]
    },
    // Aliases / Placeholders for others to prevent empty rendering
    arabic: {
        label: "Arabic", value: "arabic",
        default: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "ذ 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
            "{tab} ض ص ث ق ف غ ع ه خ ح ج د \\",
            "{capslock} ش س ي ب ل ا ت ن م ك ط {enter}",
            "{shiftleft} ئ ء ؤ ر لا ى ة و ز ظ {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ],
        shift: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "ّ ! @ # $ % ^ & * ( ) _ + {backspace}",
            "{tab} Q W E R T Y U I O P { } |",
            '{capslock} A S D F G H J K L : " {enter}',
            "{shiftleft} Z X C V B N M < > ? {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ],
    },
    russian: {
        label: "Russian", value: "russian",
        default: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "ё 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
            "{tab} й ц у к е н г ш щ з х ъ \\",
            "{capslock} ф ы в а п р о л д ж э {enter}",
            "{shiftleft} я ч с м и т ь б ю . {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ],
        shift: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "Ё ! \" № ; % : ? * ( ) _ + {backspace}",
            "{tab} Й Ц У К Е Н Г Ш Щ З Х Ъ /",
            "{capslock} Ф Ы В А П Р О Л Д Ж Э {enter}",
            "{shiftleft} Я Ч С М И Т Ь Б Ю , {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright} {controlright}",
        ],
    },
    // Aliasing similar layouts to US or appropriate base for now to ensure functional keys
    zh_pinyin: { label: "Chinese (Pinyin)", value: "zh_pinyin", default: [], shift: [] },
    zh_zhuyin: { label: "Chinese (Zhuyin)", value: "zh_zhuyin", default: [], shift: [] },
    fr_ca: { label: "French (Canada)", value: "fr_ca", default: [], shift: [] },
    fr_mac: { label: "French (Mac)", value: "fr_mac", default: [], shift: [] },
    japanese: { label: "Japanese", value: "japanese", default: [], shift: [] },
    korean: { label: "Korean", value: "korean", default: [], shift: [] },
    pt: { label: "Portuguese", value: "pt", default: [], shift: [] },
    es_latam: { label: "Spanish (Latin America)", value: "es_latam", default: [], shift: [] },
    turkish: { label: "Turkish", value: "turkish", default: [], shift: [] },
    ukrainian: { label: "Ukrainian", value: "ukrainian", default: [], shift: [] },
};

// Aliasing logic
LAYOUTS.zh_pinyin.default = LAYOUTS.us.default;
LAYOUTS.zh_pinyin.shift = LAYOUTS.us.shift;
LAYOUTS.zh_zhuyin.default = LAYOUTS.us.default;
LAYOUTS.zh_zhuyin.shift = LAYOUTS.us.shift;
LAYOUTS.fr_ca.default = LAYOUTS.us.default; // Canadian French is QWERTY-based
LAYOUTS.fr_ca.shift = LAYOUTS.us.shift;
LAYOUTS.fr_mac.default = LAYOUTS.french.default;
LAYOUTS.fr_mac.shift = LAYOUTS.french.shift;
LAYOUTS.japanese.default = LAYOUTS.us.default; // Placeholder
LAYOUTS.japanese.shift = LAYOUTS.us.shift;
LAYOUTS.korean.default = LAYOUTS.us.default; // Placeholder
LAYOUTS.korean.shift = LAYOUTS.us.shift;
LAYOUTS.pt.default = LAYOUTS.br.default; // Placeholder
LAYOUTS.pt.shift = LAYOUTS.br.shift;
LAYOUTS.es_latam.default = LAYOUTS.spanish.default; // Placeholder
LAYOUTS.es_latam.shift = LAYOUTS.spanish.shift;
LAYOUTS.turkish.default = LAYOUTS.us.default; // Placeholder
LAYOUTS.turkish.shift = LAYOUTS.us.shift;
LAYOUTS.ukrainian.default = LAYOUTS.russian.default; // Approximation
LAYOUTS.ukrainian.shift = LAYOUTS.russian.shift;


export const BUTTON_TO_KEYCODE_MAP: Record<string, string> = {
    // Basic Alphanums (US Base)
    a: "KC_A", b: "KC_B", c: "KC_C", d: "KC_D", e: "KC_E", f: "KC_F", g: "KC_G", h: "KC_H", i: "KC_I",
    j: "KC_J", k: "KC_K", l: "KC_L", m: "KC_M", n: "KC_N", o: "KC_O", p: "KC_P", q: "KC_Q", r: "KC_R",
    s: "KC_S", t: "KC_T", u: "KC_U", v: "KC_V", w: "KC_W", x: "KC_X", y: "KC_Y", z: "KC_Z",
    "0": "KC_0", "1": "KC_1", "2": "KC_2", "3": "KC_3", "4": "KC_4", "5": "KC_5", "6": "KC_6", "7": "KC_7", "8": "KC_8", "9": "KC_9",

    // US Symbols
    "`": "KC_GRAVE", "-": "KC_MINUS", "=": "KC_EQUAL", "[": "KC_LBRACKET", "]": "KC_RBRACKET", "\\": "KC_BSLASH",
    ";": "KC_SCOLON", "'": "KC_QUOTE", ",": "KC_COMMA", ".": "KC_DOT", "/": "KC_SLASH",
    "~": "KC_TILD", "!": "KC_EXLM", "@": "KC_AT", "#": "KC_HASH", "$": "KC_DLR", "%": "KC_PERC", "^": "KC_CIRC", "&": "KC_AMPR", "*": "KC_ASTR", "(": "KC_LPRN", ")": "KC_RPRN", "_": "KC_UNDS", "+": "KC_PLUS", "{": "KC_LCBR", "}": "KC_RCBR", "|": "KC_PIPE", ":": "KC_COLN", '"': "KC_DQUO", "<": "KC_LT", ">": "KC_GT", "?": "KC_QUES",

    // German
    "ß": "KC_MINUS", "´": "KC_EQL", "ü": "KC_LBRACKET", "Ü": "KC_LBRACKET", "ö": "KC_SCOLON", "Ö": "KC_SCOLON", "ä": "KC_QUOTE", "Ä": "KC_QUOTE", "°": "KC_GRAVE", "§": "KC_3", "µ": "KC_M", "€": "KC_E",

    // French (AZERTY)
    "²": "KC_GRAVE", "é": "KC_2", "è": "KC_7", "{cedilla}": "KC_9", "à": "KC_0", "ù": "KC_QUOTE",
    "³": "KC_GRAVE", "¨": "KC_LBRACKET",

    // UK
    "¬": "KC_GRAVE", "£": "KC_3",

    // Spanish / Italian / Swiss
    "º": "KC_GRAVE", "¡": "KC_EQL", "ñ": "KC_SCOLON", "Ñ": "KC_SCOLON", "ç": "KC_NONUS_HASH", "Ç": "KC_NONUS_HASH", "¿": "KC_PLUS", "·": "KC_3", "ì": "KC_EQL", "ò": "KC_SCOLON",

    // Danish
    "½": "KC_GRAVE", "å": "KC_LBRACKET", "Å": "KC_LBRACKET", "æ": "KC_SCOLON", "Æ": "KC_SCOLON", "ø": "KC_QUOTE", "Ø": "KC_QUOTE",

    // Russian (Cyrillic to US QWERTY positions)
    "ё": "KC_GRAVE", "й": "KC_Q", "ц": "KC_W", "у": "KC_E", "к": "KC_R", "е": "KC_T", "н": "KC_Y", "г": "KC_U", "ш": "KC_I", "щ": "KC_O", "з": "KC_P", "х": "KC_LBRACKET", "ъ": "KC_RBRACKET",
    "ф": "KC_A", "ы": "KC_S", "в": "KC_D", "а": "KC_F", "п": "KC_G", "р": "KC_H", "о": "KC_J", "л": "KC_K", "д": "KC_L", "ж": "KC_SCOLON", "э": "KC_QUOTE",
    "я": "KC_Z", "ч": "KC_X", "с": "KC_C", "м": "KC_V", "и": "KC_B", "т": "KC_N", "ь": "KC_M", "б": "KC_COMMA", "ю": "KC_DOT",
    "Ё": "KC_GRAVE", "Й": "KC_Q", "Ц": "KC_W", "У": "KC_E", "К": "KC_R", "Е": "KC_T", "Н": "KC_Y", "Г": "KC_U", "Ш": "KC_I", "Щ": "KC_O", "З": "KC_P", "Х": "KC_LBRACKET", "Ъ": "KC_RBRACKET",
    "Ф": "KC_A", "Ы": "KC_S", "В": "KC_D", "А": "KC_F", "П": "KC_G", "Р": "KC_H", "О": "KC_J", "Л": "KC_K", "Д": "KC_L", "Ж": "KC_SCOLON", "Э": "KC_QUOTE",
    "Я": "KC_Z", "Ч": "KC_X", "С": "KC_C", "М": "KC_V", "И": "KC_B", "Т": "KC_N", "Ь": "KC_M", "Б": "KC_COMMA", "Ю": "KC_DOT",

    // Arabic (Approximate mapping to QWERTY positions)
    "ذ": "KC_GRAVE", "ض": "KC_Q", "ص": "KC_W", "ث": "KC_E", "ق": "KC_R", "ف": "KC_T", "غ": "KC_Y", "ع": "KC_U", "ه": "KC_I", "خ": "KC_O", "ح": "KC_P", "ج": "KC_LBRACKET", "د": "KC_RBRACKET",
    "ش": "KC_A", "س": "KC_S", "ي": "KC_D", "ب": "KC_F", "ل": "KC_G", "ا": "KC_H", "ت": "KC_J", "ن": "KC_K", "م": "KC_L", "ك": "KC_SCOLON", "ط": "KC_QUOTE",
    "ئ": "KC_Z", "ء": "KC_X", "ؤ": "KC_C", "ر": "KC_V", "لا": "KC_B", "ى": "KC_N", "ة": "KC_M", "و": "KC_COMMA", "ز": "KC_DOT", "ظ": "KC_SLASH",

    // Functional
    "{escape}": "KC_ESCAPE", "{tab}": "KC_TAB", "{backspace}": "KC_BSPACE", "{enter}": "KC_ENTER",
    "{capslock}": "KC_CAPSLOCK", "{shiftleft}": "KC_LSHIFT", "{shiftright}": "KC_RSHIFT",
    "{controlleft}": "KC_LCTRL", "{controlright}": "KC_RCTRL", "{altleft}": "KC_LALT", "{altright}": "KC_RALT",
    "{metaleft}": "KC_LGUI", "{metaright}": "KC_RGUI", "{space}": "KC_SPACE",
    "{f1}": "KC_F1", "{f2}": "KC_F2", "{f3}": "KC_F3", "{f4}": "KC_F4", "{f5}": "KC_F5", "{f6}": "KC_F6",
    "{f7}": "KC_F7", "{f8}": "KC_F8", "{f9}": "KC_F9", "{f10}": "KC_F10", "{f11}": "KC_F11", "{f12}": "KC_F12",
};

export const KEY_DISPLAY_OVERRIDES: Record<string, string> = {
    "{escape}": "esc",
    "{tab}": "tab",
    "{backspace}": "backsp",
    "{enter}": "enter",
    "{capslock}": "caps",
    "{shiftleft}": "shift",
    "{shiftright}": "shift",
    "{controlleft}": "ctrl",
    "{controlright}": "ctrl",
    "{altleft}": "alt",
    "{altright}": "alt",
    "{metaleft}": "gui",
    "{metaright}": "gui",
    "{space}": "[ SPACE ]",
    "KC_GUIL": "gui",
    "KC_GUIR": "gui",
    "{cedilla}": "ç", // Visual override for French layout collision
    "KC_GRAVE": "`", // Fallback
    "{": "{",
    "}": "}"
};

export const LAYOUT_KEY_MAPS: Record<string, Record<string, string>> = {
    german: {
        "z": "KC_Y", "Z": "KC_Y",
        "y": "KC_Z", "Y": "KC_Z",
        "&": "KC_6", "(": "KC_8", ")": "KC_9", "=": "KC_0",
        '"': "KC_2", "/": "KC_7", "!": "KC_1", "?": "KC_MINUS",
        "<": "KC_NONUS_BSLASH", ">": "KC_NONUS_BSLASH",
        "^": "KC_GRAVE",
        "ß": "KC_MINUS",
        "´": "KC_EQUAL",
        "ü": "KC_LBRACKET", "Ü": "KC_LBRACKET",
        "+": "KC_RBRACKET", "*": "KC_RBRACKET",
        "ö": "KC_SCOLON", "Ö": "KC_SCOLON",
        "ä": "KC_QUOTE", "Ä": "KC_QUOTE",
        "#": "KC_NUHS"
    },
    french: {
        "a": "KC_Q", "A": "KC_Q", "q": "KC_A", "Q": "KC_A",
        "z": "KC_W", "Z": "KC_W", "w": "KC_Z", "W": "KC_Z",
        "m": "KC_SCOLON", "M": "KC_SCOLON",
        "&": "KC_1", "é": "KC_2", "\"": "KC_3", "'": "KC_4", "(": "KC_5", "-": "KC_6", "è": "KC_7", "_": "KC_8", "{cedilla}": "KC_9", "à": "KC_0", ")": "KC_MINUS", "=": "KC_EQUAL",
        "^": "KC_LBRACKET", "$": "KC_RBRACKET", "ù": "KC_QUOTE", "*": "KC_NONUS_HASH", "!": "KC_SLASH", ":": "KC_DOT", ";": "KC_COMMA", ",": "KC_M",
        "<": "KC_NONUS_BSLASH", ">": "KC_NONUS_BSLASH"
    },
    uk: {
        "\"": "KC_2", "@": "KC_QUOTE", "£": "KC_3", "~": "KC_HASH", "\\": "KC_NONUS_BSLASH", "|": "KC_NONUS_BSLASH",
        "#": "KC_NUHS" // UK usually puts # near enter
    },
    spanish: {
        "'": "KC_MINUS", "?": "KC_MINUS", "¿": "KC_EQUAL", "¡": "KC_EQUAL",
        "ñ": "KC_SCOLON", "Ñ": "KC_SCOLON",
        "+": "KC_RBRACKET", "*": "KC_RBRACKET",
        "ç": "KC_NONUS_HASH", "Ç": "KC_NONUS_HASH",
        "-": "KC_SLASH", "_": "KC_SLASH",
        ".": "KC_DOT", ":": "KC_DOT",
        ",": "KC_COMMA", ";": "KC_COMMA",
        "<": "KC_NONUS_BSLASH", ">": "KC_NONUS_BSLASH"
    },
    danish: {
        "+": "KC_MINUS", "´": "KC_EQUAL",
        "¨": "KC_RBRACKET", "'": "KC_BSLASH",
        "<": "KC_NONUS_BSLASH", ">": "KC_NONUS_BSLASH",
        "-": "KC_SLASH",
        "½": "KC_GRAVE",
        "å": "KC_LBRACKET", "Å": "KC_LBRACKET",
        "æ": "KC_SCOLON", "Æ": "KC_SCOLON",
        "ø": "KC_QUOTE", "Ø": "KC_QUOTE"
    },
    russian: {
        ".": "KC_SLASH", ",": "KC_SLASH"
    },
    italian: {
        "\\": "KC_GRAVE", "|": "KC_GRAVE",
        "'": "KC_MINUS", "?": "KC_MINUS",
        "ì": "KC_EQUAL", "^": "KC_EQUAL",
        "è": "KC_LBRACKET", "é": "KC_LBRACKET",
        "+": "KC_RBRACKET", "*": "KC_RBRACKET",
        "ò": "KC_SCOLON", "ç": "KC_SCOLON",
        "à": "KC_QUOTE", "°": "KC_QUOTE",
        "ù": "KC_NONUS_HASH", "§": "KC_NONUS_HASH",
        "<": "KC_NONUS_BSLASH", ">": "KC_NONUS_BSLASH",
        "-": "KC_SLASH", "_": "KC_SLASH"
    },
    br: {
        "'": "KC_GRAVE", "\"": "KC_GRAVE",
        "ç": "KC_SCOLON", "Ç": "KC_SCOLON",
        "~": "KC_QUOTE", "^": "KC_QUOTE",
        "´": "KC_LBRACKET", "`": "KC_LBRACKET",
        "[": "KC_RBRACKET", "{": "KC_RBRACKET",
        "]": "KC_NONUS_HASH", "}": "KC_NONUS_HASH",
        "\\": "KC_NONUS_BSLASH", "|": "KC_NONUS_BSLASH",
        ";": "KC_SLASH", ":": "KC_SLASH",
        "/": "KC_RO", "?": "KC_RO"
    },
    swiss: {
        "z": "KC_Y", "Z": "KC_Y",
        "y": "KC_Z", "Y": "KC_Z",
        "§": "KC_GRAVE", "°": "KC_GRAVE",
        "'": "KC_MINUS", "?": "KC_MINUS",
        "^": "KC_EQUAL", "`": "KC_EQUAL",
        "ü": "KC_LBRACKET", "è": "KC_LBRACKET",
        "¨": "KC_RBRACKET", "!": "KC_RBRACKET",
        "ö": "KC_SCOLON", "é": "KC_SCOLON",
        "ä": "KC_QUOTE", "à": "KC_QUOTE",
        "$": "KC_NONUS_HASH", "£": "KC_NONUS_HASH",
        "<": "KC_NONUS_BSLASH", ">": "KC_NONUS_BSLASH",
        "-": "KC_SLASH", "_": "KC_SLASH"
    }
};

export const getLabelForKeycode = (keycode: string, layoutId: string): string | null => {
    // 1. Get the target layout
    const layout = LAYOUTS[layoutId] || LAYOUTS.us;
    if (!layout) return null;

    // 2. Normalize target keycode (ensure uppercase KC_ format)
    let targetKeycode = keycode.toUpperCase();
    let isShifted = false;

    // Check for LSFT wrapper
    if (targetKeycode.startsWith("LSFT(") && targetKeycode.endsWith(")")) {
        targetKeycode = targetKeycode.slice(5, -1);
        isShifted = true;
    } else if (targetKeycode.startsWith("S(") && targetKeycode.endsWith(")")) {
        targetKeycode = targetKeycode.slice(2, -1);
        isShifted = true;
    }

    // 3. Search in appropriate layer first
    // If shifted, look in shift layer first. If not found, look in default layer (edge case?)
    // If not shifted, look in default layer first.
    // Actually, we should prioritize the layer that matches the shift state.

    // We construct the search order based on isShifted
    const primaryRows = isShifted ? layout.shift : layout.default;
    const secondaryRows = isShifted ? layout.default : layout.shift;

    const searchInRows = (rows: string[]) => {
        const layoutMap = LAYOUT_KEY_MAPS[layoutId] || {};
        for (const row of rows) {
            const keys = row.split(" ");
            for (const key of keys) {
                // 4. Resolve keycode for this visual key
                let mappedKeycode = layoutMap[key] || layoutMap[key.toLowerCase()];
                if (!mappedKeycode) {
                    mappedKeycode = BUTTON_TO_KEYCODE_MAP[key] || BUTTON_TO_KEYCODE_MAP[key.toLowerCase()];
                }

                // 5. Compare
                if (mappedKeycode === targetKeycode) {
                    return KEY_DISPLAY_OVERRIDES[key] || key.replace("{", "").replace("}", "");
                }
            }
        }
        return null;
    };

    // Try primary rows matching shift state
    let label = searchInRows(primaryRows);
    if (label) return label;

    // Fallback to secondary rows (e.g. if user manually assigned a shifted keycode to a base key?)
    // But conceptually, `LSFT(KC_3)` maps to `£` (Shift layer). `KC_3` maps to `3` (Default layer).
    // If we search secondary, we might find `3` for `LSFT(KC_3)`? No.
    // Because `3` maps to `KC_3`.
    // If baseKeycode is `KC_3`.
    // If isShifted (LSFT), we look in Shift rows. Find `£`. Map `£` -> `KC_3`. Match. Return `£`. Correct.
    // If !isShifted, we look in Default rows. Find `3`. Map `3` -> `KC_3`. Match. Return `3`. Correct.

    // What if we assign `LSFT(KC_A)`?
    // Shift row `A`. Map `A` -> `KC_A`. Match. Return `A`.
    // What if we assign `KC_A`?
    // Default row `a`. Map `a` -> `KC_A`. Match. Return `a`.

    // So strictly sticking to the corresponding layer seems correct for "Dynamic Shift" logic.
    // However, if a key only exists in one layer?
    // In our layouts, default/shift arrays mirror each other.

    // Let's safe fallback just in case.
    return searchInRows(secondaryRows);
};
