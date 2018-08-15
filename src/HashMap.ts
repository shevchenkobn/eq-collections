import { primitive, HashResolver, EqualityComparer, isPrimitive } from "./utils";

export class HashMap<K, V> {
    protected readonly _map: Map<K | primitive, V | Map<K, V>>;

    keyHash?: HashResolver<K>;
    keysEqual?: EqualityComparer<K>;
    defaultValue?: V | null;

    constructor(keyHash?: HashResolver<K>, keysEqual?: EqualityComparer<K>, entries?: IterableIterator<[K, V]> | Array<[K, V]>, defaultValue?: V | null) {
        this._map = new Map();

        this.keyHash = keyHash;
        this.keysEqual = keysEqual;
        this.defaultValue = defaultValue;

        if (entries) {
            for (const [key, value] of entries) {
                this.set(key, value);
            }
        }
    }

    get size() {
        let size = this._map.size;
        for (const [key, value] of this._map) {
            if (isPrimitive(key)) {
                size += (value as Map<K, V>).size - 1;
            }
        }
        return size;
    }

    set(key: K, value: V) {
        const keyIsPrimitive = isPrimitive(key);
        if (!this.keyHash && !keyIsPrimitive) {
            this._map.set(key, value);
        } else {
            const hash = keyIsPrimitive ? key : this.keyHash(key);
            const values = this._map.get(hash) as Map<K, V>;
            if (!values) {
                this._map.set(hash, new Map([[key, value]]));
            } else {
                if (!keyIsPrimitive && this.keysEqual) {
                    for (const [mapKey,] of values) {
                        if (this.keysEqual(mapKey as K, key)) {
                            values.set(mapKey, value);
                            return this;
                        }
                    }
                }
                values.set(key, value);
            }
        }
        return this;
    }

    get(key: K, defaultValue = this.defaultValue) {
        let value: V | null | undefined;

        const keyIsPrimitive = isPrimitive(key);
        if (!this.keyHash && !keyIsPrimitive) {
            value = this._map.get(key) as V;
        } else {
            const hash = keyIsPrimitive ? key : this.keyHash(key);
            const values = this._map.get(hash) as Map<K, V>;
            if (values) {
                if (!keyIsPrimitive && this.keysEqual) {
                    for (const [mapKey,] of values) {
                        if (this.keysEqual(mapKey as K, key)) {
                            value = values.get(mapKey);
                        }
                    }
                } else {
                    value = values.get(key);
                }
            }
        }

        return typeof value !== 'undefined' ? value : defaultValue;
    }

    has(key: K) {
        const keyIsPrimitive = isPrimitive(key);
        if (!this.keyHash && !keyIsPrimitive) {
            return this._map.has(key);
        } else {
            const hash = keyIsPrimitive ? key : this.keyHash(key);
            const values = this._map.get(hash) as Map<K, V>;
            if (values) {
                if (!keyIsPrimitive && this.keysEqual) {
                    for (const [mapKey,] of values) {
                        if (this.keysEqual(mapKey as K, key)) {
                            return true;
                        }
                    }
                } else {
                    return values.has(key);
                }
            }
            return false;
        }
    }

    'delete'(key: K) {
        const keyIsPrimitive = isPrimitive(key);
        if (!this.keyHash && !keyIsPrimitive) {
            return this._map.delete(key);
        } else {
            const hash = keyIsPrimitive ? key : this.keyHash(key);
            const values = this._map.get(hash) as Map<K, V>;
            if (values) {
                if (!keyIsPrimitive && this.keysEqual) {
                    for (const [mapKey,] of values) {
                        if (this.keysEqual(mapKey as K, key)) {
                            return values.delete(mapKey);
                        }
                    }
                } else {
                    return values.delete(key);
                }
            }
            return false;
        }
    }

    clear() {
        return this._map.clear();
    }

    *entries(): IterableIterator<[K, V]> {
        for (const [key, value] of this._map.entries()) {
            if (isPrimitive(key)) {
                const values = value as Map<K, V>;
                for (const pair of values) {
                    yield pair;
                }
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
}

export interface HashOnlyMap<K, V> {
    [Symbol.iterator]: typeof HashMap.prototype.entries;
}
HashMap.prototype[Symbol.iterator] = HashMap.prototype.entries;