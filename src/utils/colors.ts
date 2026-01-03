export const layerColors = [
    { name: "green", hex: "#099e7c" },
    { name: "blue", hex: "#379cd7" },
    { name: "purple", hex: "#8672b5" },
    { name: "orange", hex: "#f89804" },
    { name: "yellow", hex: "#ffc222" },
    { name: "grey", hex: "#85929b" },
    { name: "red", hex: "#d8304a" },
    { name: "brown", hex: "#b39369" },
];

// function to get color by name
export function getColorByName(name: string) {
    return layerColors.find((color) => color.name === name);
}

export function getClassNameByColor(name: string) {
    return `bg-kb-${name}`;
}

export const colorClasses: { [key: string]: string } = {
    primary: "bg-kb-primary text-white",
    black: "bg-black text-white",
    sidebar: "bg-kb-sidebar-base text-white",
    red: "bg-kb-red text-white",
    green: "bg-kb-green text-white",
    blue: "bg-kb-blue text-white",
    yellow: "bg-kb-yellow text-orange-800",
    orange: "bg-kb-orange text-white",
    purple: "bg-kb-purple text-white",
    grey: "bg-kb-grey text-gray-200",
    brown: "bg-kb-brown text-white",
};

export const hoverBorderClasses: { [key: string]: string } = {
    primary: "hover:border-kb-primary",
    black: "hover:border-black",
    sidebar: "hover:border-kb-sidebar-base",
    red: "hover:border-kb-red",
    green: "hover:border-kb-green",
    blue: "hover:border-kb-blue",
    yellow: "hover:border-kb-yellow",
    orange: "hover:border-kb-orange",
    purple: "hover:border-kb-purple",
    grey: "hover:border-kb-grey",
    brown: "hover:border-kb-brown",
};

export const hoverBackgroundClasses: { [key: string]: string } = {
    primary: "hover:bg-kb-primary",
    black: "hover:bg-black",
    sidebar: "hover:bg-kb-sidebar-base",
    red: "hover:bg-kb-red",
    green: "hover:bg-kb-green",
    blue: "hover:bg-kb-blue",
    yellow: "hover:bg-kb-yellow",
    orange: "hover:bg-kb-orange",
    purple: "hover:bg-kb-purple",
    grey: "hover:bg-kb-grey",
    brown: "hover:bg-kb-brown",
};


