export declare type primitive = number | boolean | undefined | null | string | symbol;
export declare function isPrimitive(value: any): value is primitive;
export declare type HashResolver<T> = (obj: T) => primitive;
export declare type EqualityComparer<T> = (first: T, other: T) => boolean;
//# sourceMappingURL=utils.d.ts.map