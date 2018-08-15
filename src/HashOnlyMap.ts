import { primitive, HashResolver, isPrimitive } from "./utils";

export class HashOnlyMap<K, V> {
    protected readonly _map: Map<K | primitive, V | [K, V]>;

    keyHash?: HashResolver<K>;
    defaultValue?: V | null;

    constructor(keyHash?: HashResolver<K>, entries?: IterableIterator<[K, V]> | Array<[K, V]>, defaultValue?: V | null) {
        this._map = new Map();

        this.keyHash = keyHash;
        this.defaultValue = defaultValue;

        if (entries) {
            for (const [key, value] of entries) {
                this.set(key, value);
            }
        }
    }

    get size() {
        return this._map.size;
    }
    
    set(key: K, value: V) {
        const pair: [K, V] = [key, value];
        if (!this.keyHash || isPrimitive(key)) {
            this._map.set(key, pair);
        } else {
            this._map.set(this.keyHash(key), pair);
        }
        return this;
    }

    get(key: K, defaultValue = this.defaultValue): V | typeof defaultValue {
        const value = this.getValue(key);
        return typeof value !== "undefined" ? value : defaultValue;
    }

    has(key: K): boolean {
        const value = this.getValue(key);
        return value !== undefined;
    }

    'delete'(key: K) {
        return this._map.delete(
            !this.keyHash || isPrimitive(key)
                ? key
                : this.keyHash(key)
        );
    }

    clear() {
        return this._map.clear();
    }

    *entries(): IterableIterator<[K, V]> {
        for (const [key, value] of this._map.entries()) {
            if (isPrimitive(key)) {
                yield value as [K, V];
            } else {
                yield [key, value as V];
            }
        }
    }

    forEach(callback: (key: K, value: V, map: this) => void): void;
    forEach<T>(callback: (this: T, key: K, value: V, map: this) => void, thisArg: T): void;
    forEach<T>(callback: (this: T, key: K, value: V, map: this) => void, thisArg?: T) {
        const hasThis = typeof thisArg !== "undefined";
        for (const [key, value] of this.entries()) {
            if (hasThis) {
                callback.call(thisArg, key, value, this);
            } else {
                (callback as any)(key, value, this);
            }
        }
    }

    *keys(): IterableIterator<K> {
        for (const [key] of this.entries()) {
            yield key;
        }
    }

    *values(): IterableIterator<V> {
        for (const [, value] of this.entries()) {
            yield value;
        }
    }

    private getValue(key: K): V | null | undefined {
        return !this.keyHash
            ? this._map.get(key) as V
            : (this._map.get(isPrimitive(key) ? key : this.keyHash(key)) as [K, V])[1];
    }
}

export interface HashOnlyMap<K, V> {
    [Symbol.iterator]: typeof HashOnlyMap.prototype.entries;
}
HashOnlyMap.prototype[Symbol.iterator] = HashOnlyMap.prototype.entries;