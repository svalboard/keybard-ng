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
    { x: 8.1, y: 4.9, w: 1.2, h: 1.2, label: "Outer Top" }, // "1" - Narrowed
    { x: 7.1, y: 6.2, w: 2.2, h: 1.2, label: "Outer Bottom" }, // "4" - Wide
    { x: 9.4, y: 4.9, w: 1.2, h: 2.5, continuous: true, label: "Middle" }, // "2" & "5"
    { x: 10.7, y: 4.9, w: 1.2, h: 1.2, label: "Inner Top" }, // "3"
    { x: 10.7, y: 6.2, w: 1.2, h: 1.2, label: "Inner Bottom" }, // "6"

    // Right Cluster
    { x: 12.4, y: 4.9, w: 1.2, h: 1.2, label: "Inner Top" }, // "7"
    { x: 12.4, y: 6.2, w: 1.2, h: 1.2, label: "Inner Bottom" }, // "0"
    { x: 13.7, y: 4.9, w: 1.2, h: 2.5, continuous: true, label: "Middle" }, // "8" & "."
    { x: 15.0, y: 4.9, w: 1.2, h: 1.2, label: "Outer Top" }, // "9" - Narrowed
    { x: 15.0, y: 6.2, w: 2.2, h: 1.2, label: "Outer Bottom" }, // "HOME" - Wide
];
