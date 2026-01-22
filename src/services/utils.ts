// Utility functions for byte manipulation and data handling

export const MSG_LEN = 32;

export function endianFrom(num: number, bytes: number, little: boolean): number[] {
    const ab = new ArrayBuffer(bytes);
    const dv = new DataView(ab);

    switch (bytes) {
        case 2:
            dv.setInt16(0, num, little);
            break;
        case 4:
            dv.setInt32(0, num, little);
            break;
    }
    return Array.from(new Uint8Array(ab));
}

export function LE32(num: number): number[] {
    return endianFrom(num, 4, true);
}

export function LE16(num: number): number[] {
    return endianFrom(num, 2, true);
}

export function BE32(num: number): number[] {
    return endianFrom(num, 4, false);
}

export function BE16(num: number): number[] {
    return endianFrom(num, 2, false);
}

export function convArrayEndian(ary: number[], size: number): number[] {
    if (size === 2) {
        return ary.map((num) => ((num >> 8) & 0xff) | ((num << 8) & 0xff00));
    } else {
        return ary.map((num) => ((num << 24) & 0xff000000) | ((num << 8) & 0xff0000) | ((num >> 8) & 0xff00) | ((num >> 24) & 0xff));
    }
}

export function range(num: number): number[] {
    return Array.from({ length: num }, (_, i) => i);
}

export function repeat<T>(what: T, count: number): T[] {
    return Array.from({ length: count }, () => what);
}
