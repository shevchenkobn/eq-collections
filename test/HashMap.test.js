const { HashMap } = require('../dist');

const primitiveKeyPairs = [undefined, null, 0, 1, 2, 3, NaN, true, false, Symbol.iterator, Symbol('test'), '', '0', 'str1', 'test'].reduce((pairs, key, i) => {
    pairs.push([key, 'value' + i]);
    return pairs;
}, []);

/**
 * primitives and basic operations
 **/

test('primitives are added and iterated properly', () => {
    const map = new HashMap();

    for (const [key, value] of primitiveKeyPairs) {
        expect(map.set(key, value)).toStrictEqual(map);
    }
    expect(map.size).toStrictEqual(primitiveKeyPairs.length);
    for (const [key, value] of primitiveKeyPairs) {
        expect(map.set(key, value)).toStrictEqual(map);
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
    const map = new HashMap(null, null, primitiveKeyPairs);
    expect(map.size).toStrictEqual(primitiveKeyPairs.length);

    for (const [key] of primitiveKeyPairs) {
        expect(map.has(key)).toStrictEqual(true);
    }
    for (const key of nonExistentKeys) {
        expect(map.has(key)).toStrictEqual(false);
    }
});

const defaultValue = ['really', 'default :)'];

test('getter worked properly with primitive keys and the default value', () => {
    let map = new HashMap(null, null, primitiveKeyPairs);

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

    map = new HashMap(null, null, primitiveKeyPairs, defaultValue);
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
        expect(map.set(key, undefined)).toStrictEqual(map);
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
    map = new HashMap(null, null, primitiveKeyPairs);

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

const objects = [
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 2],

    [1, 1, 2],
    [1, 1, 2],
    [1, 1, 3],

    [2, 0, 1],
    [2, 0, 1],
    [2, 0, 2],

    [2, 1, 2],
    [2, 1, 2],
    [2, 1, 3],

    [3, 0, 1]
].reduce((pairs, key, i) => {
    pairs.push([key, 'strObj' + i]);
    return pairs;
}, []);
const clone = (obj) => JSON.parse(JSON.stringify(obj));
const objectsIndexesToDelete = [1, 3];

test('non-hashed objects map ready', () => {
    for (const [key, value] of objects) {
        expect(map.set(key, value)).toStrictEqual(map);
    }

    expect(map.size).toStrictEqual(objects.length);

    for (const [key] of objects) {
        expect(map.has(key)).toStrictEqual(true);
        expect(map.has(clone(key))).toStrictEqual(false);
    }

    for (const i of objectsIndexesToDelete) {
        expect(map.delete(clone(objects[i][0]))).toStrictEqual(false);
        expect(map.delete(objects[i][0])).toStrictEqual(true);
        expect(map.delete(objects[i][0])).toStrictEqual(false);
    }

    const newSize = map.size;
    expect(newSize).toStrictEqual(objects.length - objectsIndexesToDelete.length);

    {
        const leftPairs = objects.filter((_, i) => !objectsIndexesToDelete.includes(i));
        const iter = map[Symbol.iterator]();
        let v;
        for (const pair of leftPairs) {
            v = iter.next();
            expect(v.value[0]).toStrictEqual(pair[0]);
            expect(v.value[1]).toStrictEqual(pair[1]);
        }
        expect(iter.next().done).toStrictEqual(true);
    }

    const newPairs = objects.map(([key, value]) => [new Date(key), value + '-2']);
    for (const [key, value] of newPairs) {
        expect(map.set(key, value)).toStrictEqual(map);
    }
    expect(map.size).toStrictEqual(newSize + objects.length);

    // clear map
    map.clear();
    expect(map.size).toStrictEqual(0);
    expect(map[Symbol.iterator]().next().done).toStrictEqual(true);
});

const keyHash = (arr) => arr[0];

test('hashed-only objects map ready', () => {
    const map = new HashMap(keyHash, null, objects);

    expect(map.size).toStrictEqual(objects.length);

    for (const [key, value] of objects) {
        expect(map.has(key)).toStrictEqual(true);
        expect(map.has(clone(key))).toStrictEqual(false);
    }

    for (const i of objectsIndexesToDelete) {
        expect(map.delete(clone(objects[i][0]))).toStrictEqual(false);
        expect(map.delete(objects[i][0])).toStrictEqual(true);
    }

    expect(map.size).toStrictEqual(objects.length - objectsIndexesToDelete.length);

    {
        const leftPairs = objects.filter((_, i) => !objectsIndexesToDelete.includes(i));
        const iter = map[Symbol.iterator]();
        let v;
        for (const pair of leftPairs) {
            v = iter.next();
            expect(v.value[0]).toStrictEqual(pair[0]);
            expect(v.value[1]).toStrictEqual(pair[1]);
        }
        expect(iter.next().done).toStrictEqual(true);
    }

    const newPairs = objects.map(([key, value]) => [new Date(key), value + '-2']);
    for (const [key, value] of newPairs) {
        expect(map.set(key, value)).toStrictEqual(map);
    }
    expect(map.size).toStrictEqual(objects.length * 2 - objectsIndexesToDelete.length);

    // clear map
    map.clear();
    expect(map.size).toStrictEqual(0);
    expect(map[Symbol.iterator]().next().done).toStrictEqual(true);
});

const areEqual = (obj1, obj2) => obj1[1] === obj2[1];
const getActualPairs = (objects, hash, areEqual) => {
    const hashValues = objects.reduce(
        (map, pair) => {
            const [key, value] = pair;
            const pairs = map.get(hash(key)) || [];
            const indexOfEqual = pairs.findIndex(([k]) => areEqual(k, key));
            if (~indexOfEqual) {
                pairs[indexOfEqual][1] = value;
            } else {
                pairs.push(pair);
                if (pairs.length === 1) {
                    map.set(hash(key), pairs);
                }
            }
            return map;
        },
        new Map()
    );
    const actualHashPairs = [];
    for (const [hash, pairs] of hashValues) {
        for (const pair of pairs) {
            actualHashPairs.push([hash, pair]);
        }
    }
    return actualHashPairs;
};

test('hashed objects map ready', () => {
    const map = new HashMap(keyHash, areEqual, objects);

    const actualHashPairs = getActualPairs(objects, keyHash, areEqual);
    expect(map.size).toStrictEqual(actualHashPairs.length);

    for (const [key, value] of objects) {
        expect(map.has(key)).toStrictEqual(true);
        expect(map.has(clone(key))).toStrictEqual(true);
    }

    const deletedIndexes = objectsIndexesToDelete.map(i => actualHashPairs.findIndex(([, [key]]) => areEqual(key, objects[i][0])));
    for (const i of deletedIndexes) {
        expect(map.delete(clone(actualHashPairs[i][1][0]))).toStrictEqual(true);
        expect(map.delete(actualHashPairs[i][1][0])).toStrictEqual(false);
        expect(map.delete(actualHashPairs[i][0])).toStrictEqual(false);
    }

    expect(map.size).toStrictEqual(actualHashPairs.length - objectsIndexesToDelete.length);

    {
        const leftPairs = actualHashPairs.filter((_, i) => !deletedIndexes.includes(i));
        const iter = map[Symbol.iterator]();
        let v;
        for (const [,pair] of leftPairs) {
            v = iter.next();
            expect(v.value[0]).toStrictEqual(pair[0]);
            expect(v.value[1]).toStrictEqual(pair[1]);
        }
        expect(iter.next().done).toStrictEqual(true);
    }

    const newPairs = objects.map(([key, value]) => [clone(key), value + '-2']);
    for (const [key, value] of newPairs) {
        expect(map.set(key, value)).toStrictEqual(map);
    }
    expect(map.size).toStrictEqual(actualHashPairs.length);

    // clear map
    map.clear();
    expect(map.size).toStrictEqual(0);
    expect(map[Symbol.iterator]().next().done).toStrictEqual(true);
});

test('getter worked properly with object keys and the default value', () => {
    let map = new HashMap(keyHash, null, objects);

    for (const [key, value] of objects) {
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
    for (const [key, value] of objects) {
        expect(map.get(key)).toStrictEqual(value);
    }
    for (const key of nonExistentKeys) {
        expect(map.get(key, anotherDefault)).toStrictEqual(anotherDefault);
    }

    map = new HashMap(null, null, objects, defaultValue);
    for (const [key, value] of objects) {
        expect(map.get(key)).toStrictEqual(value);
    }
    for (const key of nonExistentKeys) {
        expect(map.get(key)).toStrictEqual(defaultValue);
    }
    for (const key of nonExistentKeys) {
        expect(map.get(key, anotherDefault)).toStrictEqual(anotherDefault);
    }

    for (const [key] of objects) {
        expect(map.set(key, undefined)).toStrictEqual(map);
    }
    {
        const iter = map.entries(true);
        let v;
        for (const pair of objects) {
            v = iter.next();
            expect(v.value[1]).toStrictEqual(defaultValue);
        }
        expect(iter.next().done).toStrictEqual(true);
    }
    {
        const iter = map[Symbol.iterator](true, anotherDefault);
        let v;
        for (const pair of objects) {
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
    const jointArray = primitiveKeyPairs.concat(objects);
    const map = new HashMap(null, null, jointArray);

    expect(map.size).toStrictEqual(jointArray.length);

    for (const i of indexesToDelete) {
        expect(map.get(jointArray[i][0])).toStrictEqual(jointArray[i][1]);
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

const NaNSafeIncludes = (arr, value, accessor) => value === value ? arr.some(v => accessor(v) === value) : arr.some(v => Number.isNaN(accessor(v)));

test('hashed-only objects and primitives ready', () => {
    const jointArray = primitiveKeyPairs.concat(objects);
    const map = new HashMap(keyHash, null, jointArray);

    for (const [key, value] of jointArray) {
        expect(map.has(key)).toStrictEqual(true);
        const hash = keyHash(key);
        if (NaNSafeIncludes(primitiveKeyPairs, key, p => p[1])) {
            expect(map.get(key)).toStrictEqual(primitiveKeyPairs.find(([key]) => key === hash || key !== key && hash !== hash)[1]);
            expect(map.get(hash)).toStrictEqual(primitiveKeyPairs.find(([key]) => key === hash || key !== key && hash !== hash)[1]);
        } else {
            expect(set.has(hash)).toStrictEqual(NaNSafeIncludes(primitives, hash, p => p[1]));
        }
    }
    expect(map.size).toStrictEqual(jointArray.length);

    const hashedPairs = jointArray
        .map(([key, value]) => [
            NaNSafeIncludes(primitiveKeyPairs, key, p => p[1])
                ? key
                : hash(key),
                [key, value]
        ])
        .filter(([hash, [key]]) => key === key && hash !== key);
    const deleteCount = parseInt(hashedPairs.length / 2);
    const deletedPrimitives = [];
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