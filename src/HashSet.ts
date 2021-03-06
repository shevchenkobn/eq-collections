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
    if (this.valueHash || valueIsPrimitive) {
      const hash = valueIsPrimitive ? value : (this.valueHash as HashResolver<V>)(value);
      const values = this._map.get(hash) as Array<V>;
      if (!values) {
        this._map.set(hash, [value]);
      } else {
        if (!valueIsPrimitive && this.valuesEqual) {
          for (let i = 0; i < values.length; i++) {
            if (this.valuesEqual(values[i], value)) {
              values[i] = value;
              return this;
            }
          }
        } else {
          for (let i = 0; i < values.length; i++) {
            if (
              values[i] === value
              || values[i] !== values[i]
              && value !== value
            ) {
              values[i] = value;
              return this;
            }
          }
        }
        values.push(value);
      }
    } else {
      this._map.set(value, value);
    }
    return this;
  }

  has(value: V) {
    const valueIsPrimitive = isPrimitive(value);
    if (this.valueHash || valueIsPrimitive) {
      const hash = valueIsPrimitive ? value : (this.valueHash as HashResolver<V>)(value);
      const values = this._map.get(hash) as Array<V>;
      if (!values) {
        return false;
      } else {
        if (!valueIsPrimitive && this.valuesEqual) {
          for (let i = 0; i < values.length; i++) {
            if (this.valuesEqual(values[i], value)) {
              return true;
            }
          }
        } else {
          for (let i = 0; i < values.length; i++) {
            if (
              values[i] === value
              || values[i] !== values[i]
              && value !== value
            ) {
              return true;
            }
          }
        }
      }
    } else {
      return this._map.has(value);
    }
    return false;
  }

  'delete'(value: V) {
    const valueIsPrimitive = isPrimitive(value);
    if (this.valueHash || valueIsPrimitive) {
      const hash = valueIsPrimitive ? value : (this.valueHash as HashResolver<V>)(value);
      const values = this._map.get(hash) as Array<V>;
      if (!values) {
        return false;
      } else {
        if (!valueIsPrimitive && this.valuesEqual) {
          for (let i = 0; i < values.length; i++) {
            if (this.valuesEqual(values[i], value)) {
              values.splice(i, 1);
              if (!values.length) {
                this._map.delete(hash);
              }
              return true;
            }
          }
        } else {
          for (let i = 0; i < values.length; i++) {
            if (
              values[i] === value
              || values[i] !== values[i]
              && value !== value
            ) {
              values.splice(i, 1);
              if (!values.length) {
                this._map.delete(hash);
              }
              return true;
            }
          }
        }
      }
    } else {
      return this._map.delete(value);
    }
    return false;
  }

  clear() {
    return this._map.clear();
  }

  *values() {
    for (const [key, value] of this._map) {
      if (isPrimitive(key)) {
        const values = value as Array<V>;
        for (let i = 0; i < values.length; i++) {
          yield values[i];
        }
      } else {
        yield value as V;
      }
    }
  }

  forEach(callback: (value1: V, value2: V, map: this) => void): void;
  forEach<T>(callback: (value1: V, value2: V, map: this) => void, thisArg: T): void;
  forEach<T>(callback: (value1: V, value2: V, map: this) => void, thisArg?: T) {
    for (const value of this.values()) {
      if (thisArg !== undefined) {
        callback.call(thisArg, value, value, this);
      } else {
        (callback as any)(value, value, this);
      }
    }
  }
}

export interface HashSet<V> {
  [Symbol.iterator]: typeof HashSet.prototype.values;
  entries: typeof HashSet.prototype.values;
  keys: typeof HashSet.prototype.values;
}
HashSet.prototype[Symbol.iterator]
  = HashSet.prototype.entries
  = HashSet.prototype.keys
  = HashSet.prototype.values;