import { primitive, HashResolver, EqualityComparer } from "./utils";
export declare class HashMap<K, V> {
    protected readonly _map: Map<K | primitive, V | Map<K, V>>;
    keyHash?: HashResolver<K>;
    keysEqual?: EqualityComparer<K>;
    defaultValue?: V | null;
    constructor(keyHash?: HashResolver<K>, keysEqual?: EqualityComparer<K>, entries?: IterableIterator<[K, V]> | Array<[K, V]>, defaultValue?: V | null);
    readonly size: number;
    set(key: K, value: V): this;
    get(key: K, defaultValue?: V | null | undefined): V | null | undefined;
    has(key: K): boolean;
    'delete'(key: K): boolean;
    clear(): void;
    entries(useDefault?: boolean, defaultValue?: V | null | undefined): IterableIterator<[K, V]>;
    forEach(callback: (key: K, value: V, map: this) => void): void;
    forEach<T>(callback: (key: K, value: V, map: this) => void, thisArg: T): void;
    keys(): IterableIterator<K>;
    values(useDefault?: boolean, defaultValue?: V | null | undefined): IterableIterator<V>;
}
export interface HashMap<K, V> {
    [Symbol.iterator]: typeof HashMap.prototype.entries;
}
//# sourceMappingURL=HashMap.d.ts.map