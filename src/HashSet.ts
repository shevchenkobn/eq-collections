import { primitive, HashResolver, EqualityComparer, isPrimitive } from "./utils";

export class HashSet<V> {
    protected readonly _map: Map<primitive | V, V | Array<V>>;

    valueHash?: HashResolver<V>;
    valuesEqual?: EqualityComparer<V>;

    constructor(valueHash?: HashResolver<V>, valuesEqual?: EqualityComparer<V>, values?: IterableIterator<V> | Array<V>) {
        this._map = new Map();

        this.valueHash = valueHash;
        this.valuesEqual = valuesEqual;

        if (values) {
            for (const value of values) {
                this.add(value);
            }
        }
    }

    get size() {
        let size = this._map.size;
        for (const [key, value] of this._map) {
            if (isPrimitive(key)) {
                size += (value as Array<V>).length - 1;
            }
        }
        return size;
    }

    add(value: V) {
        const valueIsPrimitive = isPrimitive(value);
        if (!this.valueHash && !valueIsPrimitive) {
            this._map.set(value, value);
        } else {
            const hash = valueIsPrimitive ? value : this.valueHash(value);
            const values = this._map.get(hash) as Array<V>;
            if (!values) {
                this._map.set(hash, [value]);
            } else {
                if (!valueIsPrimitive) {
                    if (this.valuesEqual) {
                        for (let i = 0; i < values.length; i++) {
                            if (this.valuesEqual(values[i], value)) {
                                values[i] = value;
                                return this;
                            }
                        }
                    }
                    values.push(value);
                } else {
                    for (let i = 0; i < values.length; i++) {
                        if (values[i] === value) {
                            values[i] = value;
                        }
                    }
                }
            }
        }
        return this;
    }
}