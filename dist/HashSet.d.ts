import { primitive, HashResolver, EqualityComparer } from "./utils";
export declare class HashSet<V> {
    protected readonly _map: Map<primitive | V, V | Array<V>>;
    valueHash?: HashResolver<V>;
    valuesEqual?: EqualityComparer<V>;
    constructor(valueHash?: HashResolver<V>, valuesEqual?: EqualityComparer<V>, values?: IterableIterator<V> | Array<V>);
    readonly size: number;
    add(value: V): this;
    has(value: V): boolean;
    'delete'(value: V): boolean;
    clear(): void;
    values(): IterableIterator<V>;
    forEach(callback: (value1: V, value2: V, map: this) => void): void;
    forEach<T>(callback: (this: T, value1: V, value2: V, map: this) => void, thisArg: T): void;
}
export interface HashSet<V> {
    [Symbol.iterator]: typeof HashSet.prototype.values;
    entries: typeof HashSet.prototype.values;
    keys: typeof HashSet.prototype.values;
}
//# sourceMappingURL=HashSet.d.ts.map