const { HashOnlyMap } = require('../dist');

const primitiveKeyPairs = [undefined, null, 0, 1, 2, 3, NaN, true, false, Symbol.iterator, Symbol('test'), '', '0', 'str1', 'test'].reduce((pairs, key, i) => {
    pairs.push([key, 'value' + i]);
    return pairs;
}, []);

/**
 * primitives and basic operations
 **/

test('primitives are added and iterated properly', () => {
    const map = new HashOnlyMap();

    for (const [key, value] of primitiveKeyPairs) {
        map.set(key, value);
    }
    expect(map.size).toStrictEqual(primitiveKeyPairs.length);
    for (const [key, value] of primitiveKeyPairs) {
        map.set(key, value);
    }
    expect(map.size).toStrictEqual(primitiveKeyPairs.length);

    const iter = map[Symbol.iterator]();
    for (let i = 0, v = iter.next(); i < primitiveKeyPairs.length; i++ , v = iter.next()) {
        expect(v.value[0]).toStrictEqual(primitiveKeyPairs[i][0]);
        expect(v.value[1]).toStrictEqual(primitiveKeyPairs[i][1]);
    }
    expect(iter.next().done).toStrictEqual(true);
});

const nonExistentKeys = [[10e7], ['-1'], [42]];

test('constructed with iterable, `has()` worked for primitives', () => {
    const map = new HashOnlyMap(null, primitiveKeyPairs);
    expect(map.size).toStrictEqual(primitiveKeyPairs.length);

    for (const [key,] of primitiveKeyPairs) {
        expect(map.has(key)).toStrictEqual(true);
    }
    for (const key of nonExistentKeys) {
        expect(map.has(key)).toStrictEqual(false);
    }
});

const defaultValue = ['really', 'default :)'];

test('getter worked properly with primitive keys and the default value', () => {
    let map = new HashOnlyMap(null, primitiveKeyPairs);

    for (const [key, value] of primitiveKeyPairs) {
        expect(map.get(key)).toStrictEqual(value);
    }

    const anotherDefault = { num: 88 };
    for (const key of nonExistentKeys) {
        expect(map.get(key)).toStrictEqual(undefined);
    }
    map.defaultValue = defaultValue;
    for (const [key, value] of primitiveKeyPairs) {
        expect(map.get(key)).toStrictEqual(value);
    }
    for (const key of nonExistentKeys) {
        expect(map.get(key)).toStrictEqual(defaultValue);
    }
    for (const key of nonExistentKeys) {
        expect(map.get(key, anotherDefault)).toStrictEqual(anotherDefault);
    }

    map = new HashOnlyMap(null, primitiveKeyPairs, defaultValue);
    for (const [key, value] of primitiveKeyPairs) {
        expect(map.get(key)).toStrictEqual(value);
    }
    for (const key of nonExistentKeys) {
        expect(map.get(key)).toStrictEqual(defaultValue);
    }
    for (const key of nonExistentKeys) {
        expect(map.get(key, anotherDefault)).toStrictEqual(anotherDefault);
    }

    for (const [key] of primitiveKeyPairs) {
        map.set(key, undefined);
    }
    {
        const iter = map.entries(true);
        let v;
        for (const pair of primitiveKeyPairs) {
            v = iter.next();
            expect(v.value[1]).toStrictEqual(defaultValue);
        }
        expect(iter.next().done).toStrictEqual(true);
    }
    {
        const iter = map[Symbol.iterator](true, anotherDefault);
        let v;
        for (const pair of primitiveKeyPairs) {
            v = iter.next();
            expect(v.value[1]).toStrictEqual(anotherDefault);
        }
        expect(iter.next().done).toStrictEqual(true);
    }
});

let primitivesIndexesToDelete = [1, 4, 5, 8];
let map;

test('values are deleted and map is cleared', () => {
    map = new HashOnlyMap(null, primitiveKeyPairs);

    for (const i of primitivesIndexesToDelete) {
        expect(map.delete(primitiveKeyPairs[i][0])).toStrictEqual(true);
    }
    expect(map.size).toStrictEqual(primitiveKeyPairs.length - primitivesIndexesToDelete.length);
    for (const key of nonExistentKeys) {
        expect(map.delete(key)).toStrictEqual(false);
    }
    expect(map.size).toStrictEqual(primitiveKeyPairs.length - primitivesIndexesToDelete.length);

    for (let i = 0; i < primitiveKeyPairs.length; i++) {
        expect(map.has(primitiveKeyPairs[i][0])).toStrictEqual(!primitivesIndexesToDelete.includes(i));
    }

    // iterating
    {
        const leftPairs = primitiveKeyPairs.filter((_, i) => !primitivesIndexesToDelete.includes(i));
        const iter = map[Symbol.iterator]();
        let v;
        for (const pair of leftPairs) {
            v = iter.next();
            expect(v.value[0]).toStrictEqual(pair[0]);
            expect(v.value[1]).toStrictEqual(pair[1]);
        }
        expect(iter.next().done).toStrictEqual(true);
    }

    // clearing map
    map.clear();
    expect(map.size).toStrictEqual(0);
    expect(map[Symbol.iterator]().next().done).toStrictEqual(true);
});

/**
 * objects tests
 **/

const datePairs = [new Date(), new Date(0), new Date(100000), new Date('bad')].reduce((pairs, key, i) => {
    pairs.push([key, 'strObj' + i]);
    return pairs;
}, []);
const objectsIndexesToDelete = [1, 3];

test('non-hashed objects map ready', () => {
    for (const [key, value] of datePairs) {
        map.set(key, value);
    }

    expect(map.size).toStrictEqual(datePairs.length);

    for (const [key] of datePairs) {
        expect(map.has(key)).toStrictEqual(true);
        expect(map.has(new Date(key))).toStrictEqual(false);
    }

    for (const i of objectsIndexesToDelete) {
        expect(map.delete(new Date(datePairs[i][0]))).toStrictEqual(false);
        expect(map.delete(datePairs[i][0])).toStrictEqual(true);
        expect(map.delete(datePairs[i][0])).toStrictEqual(false);
    }

    const newSize = map.size;
    expect(newSize).toStrictEqual(datePairs.length - objectsIndexesToDelete.length);

    {
        const leftPairs = datePairs.filter((_, i) => !objectsIndexesToDelete.includes(i));
        const iter = map[Symbol.iterator]();
        let v;
        for (const pair of leftPairs) {
            v = iter.next();
            expect(v.value[0]).toStrictEqual(pair[0]);
            expect(v.value[1]).toStrictEqual(pair[1]);
        }
        expect(iter.next().done).toStrictEqual(true);
    }

    const newPairs = datePairs.map(([key, value]) => [new Date(key), value + '-2']);
    for (const [key, value] of newPairs) {
        map.set(key, value);
    }
    expect(map.size).toStrictEqual(newSize + datePairs.length);

    // clear map
    map.clear();
    expect(map.size).toStrictEqual(0);
    expect(map[Symbol.iterator]().next().done).toStrictEqual(true);
});

const keyHash = (date) => +date;

test('hashed objects map ready', () => {
    const map = new HashOnlyMap(keyHash, datePairs);

    expect(map.size).toStrictEqual(datePairs.length);

    for (const [key] of datePairs) {
        expect(map.has(key)).toStrictEqual(true);
        expect(map.has(new Date(key))).toStrictEqual(true);
    }

    for (const i of objectsIndexesToDelete) {
        expect(map.delete(new Date(datePairs[i][0]))).toStrictEqual(true);
        expect(map.delete(datePairs[i][0])).toStrictEqual(false);
    }

    expect(map.size).toStrictEqual(datePairs.length - objectsIndexesToDelete.length);

    {
        const leftPairs = datePairs.filter((_, i) => !objectsIndexesToDelete.includes(i));
        const iter = map[Symbol.iterator]();
        let v;
        for (const pair of leftPairs) {
            v = iter.next();
            expect(v.value[0]).toStrictEqual(pair[0]);
            expect(v.value[1]).toStrictEqual(pair[1]);
        }
        expect(iter.next().done).toStrictEqual(true);
    }

    const newPairs = datePairs.map(([key, value]) => [new Date(key), value + '-2']);
    for (const [key, value] of newPairs) {
        map.set(key, value);
    }
    expect(map.size).toStrictEqual(datePairs.length);

    // clear map
    map.clear();
    expect(map.size).toStrictEqual(0);
    expect(map[Symbol.iterator]().next().done).toStrictEqual(true);
});

test('getter worked properly with object keys and the default value', () => {
    let map = new HashOnlyMap(keyHash, datePairs);

    for (const [key, value] of datePairs) {
        expect(map.get(key)).toStrictEqual(value);
    }

    const anotherDefault = { num: 88 };
    for (const key of nonExistentKeys) {
        expect(map.get(key)).toStrictEqual(undefined);
    }
    map.defaultValue = defaultValue;
    for (const key of nonExistentKeys) {
        expect(map.get(key)).toStrictEqual(defaultValue);
    }
    for (const [key, value] of datePairs) {
        expect(map.get(key)).toStrictEqual(value);
    }
    for (const key of nonExistentKeys) {
        expect(map.get(key, anotherDefault)).toStrictEqual(anotherDefault);
    }

    map = new HashOnlyMap(null, datePairs, defaultValue);
    for (const [key, value] of datePairs) {
        expect(map.get(key)).toStrictEqual(value);
    }
    for (const key of nonExistentKeys) {
        expect(map.get(key)).toStrictEqual(defaultValue);
    }
    for (const key of nonExistentKeys) {
        expect(map.get(key, anotherDefault)).toStrictEqual(anotherDefault);
    }

    for (const [key] of datePairs) {
        map.set(key, undefined);
    }
    {
        const iter = map.entries(true);
        let v;
        for (const pair of datePairs) {
            v = iter.next();
            expect(v.value[1]).toStrictEqual(defaultValue);
        }
        expect(iter.next().done).toStrictEqual(true);
    }
    {
        const iter = map[Symbol.iterator](true, anotherDefault);
        let v;
        for (const pair of datePairs) {
            v = iter.next();
            expect(v.value[1]).toStrictEqual(anotherDefault);
        }
        expect(iter.next().done).toStrictEqual(true);
    }
});

/**
 * Mixed map (primitives and objects as keys);
 */

const indexesToDelete = primitivesIndexesToDelete.concat(
    objectsIndexesToDelete.map(i => primitiveKeyPairs.length + i)
);

test('non-hashed objects and primitives ready', () => {
    const jointArray = primitiveKeyPairs.concat(datePairs);
    const map = new HashOnlyMap(null, jointArray);

    expect(map.size).toStrictEqual(jointArray.length);

    for (const i of indexesToDelete) {
        expect(map.has(jointArray[i][0])).toStrictEqual(true);
        expect(map.delete(jointArray[i][0])).toStrictEqual(true);
        expect(map.has(jointArray[i][0])).toStrictEqual(false);
        expect(map.delete(jointArray[i][0])).toStrictEqual(false);
    }

    const leftArray = jointArray.filter((_, i) => !indexesToDelete.includes(i));
    expect(map.size).toStrictEqual(leftArray.length);

    {
        const iter = map[Symbol.iterator]();
        let v;
        for (const pair of leftArray) {
            v = iter.next();
            expect(v.value[0]).toStrictEqual(pair[0]);
            expect(v.value[1]).toStrictEqual(pair[1]);
        }
        expect(iter.next().done).toStrictEqual(true);
    }

    map.clear();
    expect(map.size).toStrictEqual(0);
    expect(map[Symbol.iterator]().next().done).toStrictEqual(true);
});

test('hashed objects and primitives ready', () => {
    const jointArray = primitiveKeyPairs.concat(datePairs);
    const map = new HashOnlyMap(keyHash, jointArray);

    const hashMap = jointArray.reduce(
        (map, pair) => map.set(
            primitiveKeyPairs.includes(pair)
            ? pair[0]
            : keyHash(pair[0]),
            pair),
        new Map()
    );

    for (const [hash, [key, value]] of hashMap) {
        expect(map.has(hash)).toStrictEqual(true);
        expect(map.has(key)).toStrictEqual(true);
        expect(map.get(key)).toStrictEqual(value);
    }
    expect(map.size).toStrictEqual(hashMap.size);

    const hashedPairs = [...hashMap].filter(([hash, [key]]) => hash !== key);
    const deleteCount = parseInt(hashedPairs.length / 2);
    for (let i = 0; i < deleteCount; i++) {
        const [hash, [key]] = hashedPairs[i];
        expect(map.has(key)).toStrictEqual(true);
        expect(map.has(hash)).toStrictEqual(true);
        expect(map.delete(key)).toStrictEqual(true);
        expect(map.delete(hash)).toStrictEqual(false);
        expect(map.has(key)).toStrictEqual(false);
        expect(map.has(hash)).toStrictEqual(false);
        hashMap.delete(hash);
    }
    
    const leftPairs = [...hashMap].map(([, pair]) => pair);
    expect(map.size).toStrictEqual(leftPairs.length);

    {
        const iter = map[Symbol.iterator]();
        let v;
        for (const [key, value] of leftPairs) {
            v = iter.next();
            expect(v.value[0]).toStrictEqual(key);
            expect(v.value[1]).toStrictEqual(value);
        }
        expect(iter.next().done).toStrictEqual(true);
    }

    map.clear();
    expect(map.size).toStrictEqual(0);
    expect(map[Symbol.iterator]().next().done).toStrictEqual(true);
});

test('`entries()` and `iterator` work similarly', () => {
    const map = new HashOnlyMap(keyHash, primitiveKeyPairs.concat(datePairs));

    const iter = map[Symbol.iterator]();
    const entries = map.entries();

    for (let i = 0; i < map.size; i++) {
        const first = iter.next();
        const second = entries.next();
        expect(second.value[0]).toStrictEqual(first.value[0]);
        expect(second.value[1]).toStrictEqual(first.value[1]);
        expect(first.done).toStrictEqual(false);
        expect(second.done).toStrictEqual(false);
    }
    expect(iter.next().done).toStrictEqual(true);
    expect(entries.next().done).toStrictEqual(true);
});

test('`values()` and `keys()` work properly', () => {
    const map = new HashOnlyMap(keyHash, primitiveKeyPairs.concat(datePairs));

    const entries = map.entries();
    const values = map.values();
    const keys = map.keys();

    for (let i = 0; i < map.size; i++) {
        const entry = entries.next();
        const key = keys.next();
        const value = values.next();
        expect(entry.value[0]).toStrictEqual(key.value);
        expect(entry.value[1]).toStrictEqual(value.value);
        expect(entry.done).toStrictEqual(false);
        expect(key.done).toStrictEqual(false);
        expect(value.done).toStrictEqual(false);
    }
    expect(values.next().done).toStrictEqual(true);
    expect(keys.next().done).toStrictEqual(true);
    expect(entries.next().done).toStrictEqual(true);
});

const stringHash = (date) => date.toString();

test('`keyHash()` monkey patching', () => {
    const map = new HashOnlyMap(keyHash, datePairs);

    map.keyHash = null;
    for (const [key, value] of datePairs) {
        expect(map.has(key)).toStrictEqual(false);
        expect(map.has(keyHash(key))).toStrictEqual(true);
        map.set(key, value + '-num');
        expect(map.has(key)).toStrictEqual(true);
    }

    map.keyHash = stringHash;
    for (const [key, value] of datePairs) {
        expect(map.has(key)).toStrictEqual(false);
        map.set(key, value + '-str');
        expect(map.has(key)).toStrictEqual(true);
    }

    expect(map.size).toStrictEqual(datePairs.length * 3);
});