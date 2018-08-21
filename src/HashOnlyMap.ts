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
    const keyIsPrimitive = isPrimitive(key);
    if (this.keyHash || keyIsPrimitive) {
      this._map.set(keyIsPrimitive ? key : (this.keyHash as HashResolver<K>)(key), pair);
    } else {
      this._map.set(key, pair[1]);
    }
    return this;
  }

  get(key: K, defaultValue = this.defaultValue) {
    const value = this.getValue(key);
    return value !== undefined ? value : defaultValue;
  }

  has(key: K) {
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

  *entries(useDefault = false, defaultValue = this.defaultValue): IterableIterator<[K, V]> {
    for (const [key, value] of this._map.entries()) {
      let pair: [K, V];
      if (isPrimitive(key)) {
        pair = [...value as [K, V]] as [K, V];
      } else {
        pair = [key, value as V];
      }
      if (useDefault && pair[1] === undefined) {
        pair[1] = defaultValue as V;
      }
      yield pair;
    }
  }

  forEach(callback: (key: K, value: V, map: this) => void): void;
  forEach<T>(callback: (this: T, key: K, value: V, map: this) => void, thisArg: T): void;
  forEach<T>(callback: (this: T, key: K, value: V, map: this) => void, thisArg?: T) {
    const hasThis = thisArg !== undefined;
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

  *values(useDefault = false, defaultValue = this.defaultValue): IterableIterator<V> {
    for (const [, value] of this.entries(useDefault, defaultValue)) {
      yield value;
    }
  }

  private getValue(key: K) {
    const keyIsPrimitive = isPrimitive(key);
    const valueIsPair = this.keyHash || keyIsPrimitive;
    const value = valueIsPair
      ? this._map.get(keyIsPrimitive ? key : (this.keyHash as HashResolver<K>)(key))
      : this._map.get(key) as V;
    return value !== undefined && valueIsPair ? (value as [K, V])[1] : value;
  }
}

export interface HashOnlyMap<K, V> {
  [Symbol.iterator]: typeof HashOnlyMap.prototype.entries;
}
HashOnlyMap.prototype[Symbol.iterator] = HashOnlyMap.prototype.entries;