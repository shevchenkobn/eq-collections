import { primitive, HashResolver, isPrimitive } from "./utils";

export class HashOnlySet<V> {
    protected readonly _map: Map<primitive | V, V>

    valueHash?: HashResolver<V>;

    constructor(valueHash?: HashResolver<V>, values?: IterableIterator<V> | Array<V>) {
        this._map = new Map();

        this.valueHash = valueHash;
        
        if (values) {
            for (const value of values) {
                this.add(value);
            }
        }
    }

    get size() {
        return this._map.size;
    }

    add(value: V) {
        if (!this.valueHash || isPrimitive(value)) {
            this._map.set(value, value);
        } else {
            this._map.set(this.valueHash(value), value);
        }
        return this;
    }

    has(value: V) {
        return this._map.has(
            !this.valueHash || isPrimitive(value)
                ? value
                : this.valueHash(value)
        );
    }

    'delete'(value: V) {
        return this._map.delete(
            !this.valueHash || isPrimitive(value)
                ? value
                : this.valueHash(value)
        );
    }

    clear() {
        return this._map.clear();
    }

    values() {
        return this._map.values();
    }

    forEach(callback: (value1: V, value2: V, map: this) => void): void;
    forEach<T>(callback: (this: T, value1: V, value2: V, map: this) => void, thisArg: T): void;
    forEach<T>(callback: (this: T, value1: V, value2: V, map: this) => void, thisArg?: T) {
        const hasThis = typeof thisArg !== "undefined";
        for (const value of this.values()) {
            if (hasThis) {
                callback.call(thisArg, value, value, this);
            } else {
                (callback as any)(value, value, this);
            }
        }
    }
}
export interface HashOnlySet<V> {
    [Symbol.iterator]: typeof HashOnlySet.prototype.values;
    entries: typeof HashOnlySet.prototype.values;
    keys: typeof HashOnlySet.prototype.values;
}
HashOnlySet.prototype[Symbol.iterator]
    = HashOnlySet.prototype.entries
    = HashOnlySet.prototype.keys
    = HashOnlySet.prototype.values;