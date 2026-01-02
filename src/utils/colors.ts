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
