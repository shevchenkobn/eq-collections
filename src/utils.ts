export type primitive = number | boolean | undefined | null | string | symbol;
export function isPrimitive(value: any): value is primitive {
    const type = typeof value;
    return (type !== 'object' && type !== 'function') || value === null;
}

export type HashResolver<T> = (obj: T) => primitive;
export type EqualityComparer<T> = (first: T, other: T) => boolean;