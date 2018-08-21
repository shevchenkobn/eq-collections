# This package is under development and will be republished soon
It provides convetional `Map` and `Set` collections that **use** `hashCode` and `equals` functions (like in Java, C#, Kotlin, etc). They are based on on es6 `Map`

# Hash-based sets and maps package
## Description
Built-in `es6 Map` doesn't allow using objects as keys with **hash functions** _(e.g. use `Date` as a key based on UNIX timestamp as hash)_.

This package is an UMD module. It includes 4 collections:
- `HashOnlyMap` - map that uses specified `hash(key)` function on every non-primitive key and **doesn't resolve collisions** (ideal for `Date` keys)
- `HashMap` - map that uses specified `hash(key)` function on every non-primitive key and **resolves collisions** with `equals(key1, key2)` function
- `HashOnlySet` - set that uses specified `hash(key)` function on every non-primitive key and **doesn't resolve collisions**
- `HashSet` - set that uses specified `hash(value)` function on every non-primitive key and **resolves collisions** with `equals(value1, value2)` function

All collections are based on **es6 Map**.

The package is TypeScript ready (actually, written in TS), **type definitions included**.
## Installation
The package is distributed **only via npm**. To install run:
```sh
npm i eq-collections --save
```
## Documentation
All the APIs almost identical to es6 Map and Set APIs.

Every collection fallbacks to the corresponding es6 collection if no `hash` or `equal` functions provided.

Every collection can be extended to provide additional functionality

Both functions can be changed at a runtime (although you can lose access to already stored values within collection because of changed algorithm).

Map collections can use default default value when `get()` is going to return `undefined`. Default values can be also used with value iterators.

Also, this package exports `isPrimitive` function

Common types to be used in docs:
```ts
type primitive = number | boolean | undefined | null | string | symbol;
type HashResolver<T> = (obj: T) => primitive;
type EqualityComparer<T> = (first: T, other: T) => boolean;

declare function isPrimitive(value: any): value is primitive;
```
Every type has both a class and an iterface. They are merged and all interface methods are valid instance methods.

### HashOnlyMap
```ts
declare class HashOnlyMap<K, V> {
  protected readonly _map: Map<K | primitive, V | [K, V]>;
  keyHash?: HashResolver<K>;
  defaultValue?: V | null;
  constructor(keyHash?: HashResolver<K>, entries?: IterableIterator<[K, V]> | Array<[K, V]>, defaultValue?: V | null);
  readonly size: number;
  set(key: K, value: V): this;
  get(key: K, defaultValue?: V | null | undefined): V | [K, V] | null | undefined;
  has(key: K): boolean;
  'delete'(key: K): boolean;
  clear(): void;
  entries(useDefault?: boolean, defaultValue?: V | null | undefined): IterableIterator<[K, V]>;
  forEach(callback: (key: K, value: V, map: this) => void): void;
  forEach<T>(callback: (key: K, value: V, map: this) => void, thisArg: T): void;
  keys(): IterableIterator<K>;
  values(useDefault?: boolean, defaultValue?: V | null | undefined): IterableIterator<V>;
  private getValue;
}
interface HashOnlyMap<K, V> {
  [Symbol.iterator]: typeof HashOnlyMap.prototype.entries;
}
```
### HashMap
**If `keyHash` isn't set, then `keysEqual` will not be called**
```ts
declare class HashMap<K, V> {
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
interface HashMap<K, V> {
  [Symbol.iterator]: typeof HashMap.prototype.entries;
}
```
### HashOnlySet
```ts
declare class HashOnlySet<V> {
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
interface HashOnlySet<V> {
  [Symbol.iterator]: typeof HashOnlySet.prototype.values;
  entries: typeof HashOnlySet.prototype.values;
  keys: typeof HashOnlySet.prototype.values;
}
```
### HashSet
**If `valueHash` isn't set, then `valuesEqual` will not be called**
```ts
declare class HashSet<V> {
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
  forEach<T>(callback: (value1: V, value2: V, map: this) => void, thisArg: T): void;
}
interface HashSet<V> {
  [Symbol.iterator]: typeof HashSet.prototype.values;
  entries: typeof HashSet.prototype.values;
  keys: typeof HashSet.prototype.values;
}
```


## Testing
The package is tested using [jest](https://jestjs.io/). This framework is mentioned as `devDependency` in `package.json`.

Code coverage is stored under `./test/coverage` _(not included in npm package)_. It is 100%.

Run tests:
```sh
npm t
```
Run tests with coverage:
```sh
npm t -- --coverage
```
## Further development and contributing
The source code is hosted on (https://github.com/shevchenkobn/eq-collections)[GitHub].

### Bugs and issues
If you have any issues while using the package, check out already opened issues (especially marked with _implementing_ label). If it is not what you are looking for, feel free to open a new issue or fix it and create pull request.
### Feature requests
This package is supposed to be minimalistic and lightweight. You can certainly create a feature request, but if you need some advanced functionality you can create a separate package by inheriting collection classes. Only feature requests with _approved_ label will be implemented.

Additionally, you can fork the repo and implement what do you want and it is not necessary to create pull request to this repo.

However, probable improvements include:
- `Map`: add boolean argument for `set()` methods indicating should we replace current stored key by the new one.
- Add to not hash-only collections to retrieve arrays of objects (that have collisions) for a particular hash.
- Add `SortedCollection` implemented similar to [this](https://gist.github.com/shevchenkobn/e3119088465c9022a080c8241e410f60).

