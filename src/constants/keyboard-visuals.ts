export interface ClusterBackground {
    x: number;
    y: number;
    w: number;
    h: number;
    label?: string;
    continuous?: boolean;
}

/**
 * Standard unit-based offset for the thumb cluster.
 * 12px at 40px/unit was originally 0.3u.
 * With UNIT_SIZE=60, 12px is 0.2u.
 * However, the user liked the look of 0.3u (18px at UNIT_SIZE=60).
 * Wait, the code says: // 12px at 40px/unit = 0.3u.
 * If UNIT_SIZE is 60, 12px is 0.2u.
 * But THUMB_OFFSET_U is set to 0.3, which is 18px.
 */
export const THUMB_OFFSET_U = 0.3;

export const CLUSTER_BACKGROUNDS_DATA: ClusterBackground[] = [
    // Left Cluster
    { x: 7.1, y: 4.9, w: 2.2, h: 1.2, label: "Outer Top" }, // Enter
    { x: 7.1, y: 6.2, w: 2.2, h: 1.2, label: "Outer Bottom" }, // MO 14
    { x: 9.4, y: 4.9, w: 1.2, h: 2.5, continuous: true, label: "Middle" }, // Caps/Shift
    { x: 10.7, y: 4.9, w: 1.2, h: 1.2, label: "Inner Top" }, // Tab
    { x: 10.7, y: 6.2, w: 1.2, h: 1.2, label: "Inner Bottom" }, // Ctrl

    // Right Cluster
    { x: 13.1, y: 4.9, w: 1.2, h: 1.2, label: "Inner Top" }, // Backsp
    { x: 13.1, y: 6.2, w: 1.2, h: 1.2, label: "Inner Bottom" }, // Alt
    { x: 14.4, y: 4.9, w: 1.2, h: 2.5, continuous: true, label: "Middle" }, // MO 5/MO 4
    { x: 15.7, y: 4.9, w: 2.2, h: 1.2, label: "Outer Top" }, // Space
    { x: 15.7, y: 6.2, w: 2.2, h: 1.2, label: "Outer Bottom" }, // MO 2
];
