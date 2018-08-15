export type primitive = number | boolean | undefined | null | string | symbol;
export function isPrimitive(val: any): val is primitive {
    const type = typeof val;
    return (type !== 'object' && type !== 'function') || val === null;
}

export type HashResolver<T> = (obj: T) => primitive;
export type EqualityComparer<T> = (first: T, other: T) => boolean;