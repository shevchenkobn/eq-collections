import { primitive, HashResolver } from "./utils";
export declare class HashOnlySet<V> {
    protected readonly _map: Map<primitive | V, V>;
    valueHash?: HashResolver<V>;
    constructor(valueHash?: HashResolver<V>, values?: IterableIterator<V> | Array<V>);
    readonly size: number;
    add(value: V): this;
    has(value: V): boolean;
    'delete'(value: V): boolean;
    clear(): void;
    values(): IterableIterator<V>;
    forEach(callback: (value1: V, value2: V, map: this) => void): void;
    forEach<T>(callback: (value1: V, value2: V, map: this) => void, thisArg: T): void;
}
export interface HashOnlySet<V> {
    [Symbol.iterator]: typeof HashOnlySet.prototype.values;
    entries: typeof HashOnlySet.prototype.values;
    keys: typeof HashOnlySet.prototype.values;
}
//# sourceMappingURL=HashOnlySet.d.ts.map