export const layerColors = [
    { name: "green", hex: "#099e7c" },
    { name: "blue", hex: "#379cd7" },
    { name: "purple", hex: "#8672b5" },
    { name: "orange", hex: "#f89804" },
    { name: "yellow", hex: "#ffc222" },
    { name: "grey", hex: "#85929b" },
    { name: "red", hex: "#d8304a" },
    { name: "brown", hex: "#b39369" },
    { name: "white", hex: "#ffffff" },
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
    white: "bg-white text-black",
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
    white: "hover:border-gray-300",
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
    white: "hover:bg-white",
};

/**
 * Darker header/footer classes for each color (used in key headers)
 * These match the bg-black/30 overlay effect on the base colors
 */
export const headerClasses: { [key: string]: string } = {
    primary: "bg-black/30",
    black: "bg-black/50",
    sidebar: "bg-kb-sidebar-dark",
    red: "bg-black/30",
    green: "bg-black/30",
    blue: "bg-black/30",
    yellow: "bg-black/30",
    orange: "bg-black/30",
    purple: "bg-black/30",
    grey: "bg-black/30",
    brown: "bg-black/30",
    white: "bg-black",
};

/**
 * Hover header/footer classes for each color
 */
export const hoverHeaderClasses: { [key: string]: string } = {
    primary: "group-hover:bg-black/30",
    black: "group-hover:bg-black/50",
    sidebar: "group-hover:bg-kb-sidebar-dark",
    red: "group-hover:bg-black/30",
    green: "group-hover:bg-black/30",
    blue: "group-hover:bg-black/30",
    yellow: "group-hover:bg-black/30",
    orange: "group-hover:bg-black/30",
    purple: "group-hover:bg-black/30",
    grey: "group-hover:bg-black/30",
    brown: "group-hover:bg-black/30",
    white: "group-hover:bg-black",
};

/**
 * Hover text color classes for each color
 * These are used to ensure text color matches the layer color on hover
 */
export const hoverTextClasses: { [key: string]: string } = {
    primary: "group-hover:text-white",
    black: "group-hover:text-white",
    sidebar: "group-hover:text-white",
    red: "group-hover:text-white",
    green: "group-hover:text-white",
    blue: "group-hover:text-white",
    yellow: "group-hover:text-orange-800",
    orange: "group-hover:text-white",
    purple: "group-hover:text-white",
    grey: "group-hover:text-gray-200",
    brown: "group-hover:text-white",
    white: "group-hover:text-black",
};

/**
 * Container Hover text color classes for each color
 * These use hover: instead of group-hover: to target the element itself rather than a parent group
 */
export const hoverContainerTextClasses: { [key: string]: string } = {
    primary: "hover:text-white",
    black: "hover:text-white",
    sidebar: "hover:text-white",
    red: "hover:text-white",
    green: "hover:text-white",
    blue: "hover:text-white",
    yellow: "hover:text-orange-800",
    orange: "hover:text-white",
    purple: "hover:text-white",
    grey: "hover:text-gray-200",
    brown: "hover:text-white",
    white: "hover:text-black",
};
