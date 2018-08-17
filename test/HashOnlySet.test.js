const { HashOnlySet } = require('../dist');

const primitives = [undefined, null, 0, 1, 2, 3, NaN, true, false, Symbol.iterator, Symbol('test'), '', '0', 'str1', 'test'];

/**
 * primitives and basic operations
 **/

test('primitives are added and iterated properly', () => {
    const set = new HashOnlySet();
    
    for (const value of primitives) {
        set.add(value);
    }
    expect(set.size).toStrictEqual(primitives.length);

    const iter = set[Symbol.iterator]();
    for (let i = 0, v = iter.next(); i < primitives.length; i++, v = iter.next()) {
        expect(v.value).toStrictEqual(primitives[i]);
    }
    expect(iter.next().done).toStrictEqual(true);
});

const nonExistent = [new Date, {}];

test('constructed with iterable, `has()` worked for primitives', () => {
    const set = new HashOnlySet(null, primitives);
    expect(set.size).toStrictEqual(primitives.length);
    
    for (const value of primitives) {
        expect(set.has(value)).toStrictEqual(true);
    }
    for (const value of nonExistent) {
        expect(set.has(value)).toStrictEqual(false);
    }
});

let primitivesIndexesToDelete = [1, 4, 5, 8];

test('values are deleted and set is cleared', () => {
    const set = new HashOnlySet(null, primitives);

    for (const i of primitivesIndexesToDelete) {
        expect(set.delete(primitives[i])).toStrictEqual(true);
    }
    expect(set.size).toStrictEqual(primitives.length - primitivesIndexesToDelete.length);
    for (const absent of nonExistent) {
        expect(set.delete(absent)).toStrictEqual(false);
    }
    expect(set.size).toStrictEqual(primitives.length - primitivesIndexesToDelete.length);

    for (let i = 0; i < primitives.length; i++) {
        expect(set.has(primitives[i])).toStrictEqual(!primitivesIndexesToDelete.includes(i));
    }
    for (const absent of nonExistent) {
        expect(set.delete(absent)).toStrictEqual(false);
    }
    expect(set.size).toStrictEqual(primitives.length - primitivesIndexesToDelete.length);

    // iterating
    {
        const leftSeed = primitives.filter((_, i) => !primitivesIndexesToDelete.includes(i));
        const iter = set[Symbol.iterator]();
        let v;
        for (const value of leftSeed) {
            v = iter.next();
            expect(v.value).toStrictEqual(value);
        }
        expect(iter.next().done).toStrictEqual(true);
    }

    // clearing set
    set.clear();
    expect(set.size).toStrictEqual(0);
    expect(set[Symbol.iterator]().next().done).toStrictEqual(true);
});

/**
 * objects tests
 **/

const dates = [new Date(), new Date(0), new Date(100000), new Date('bad')];
const objectsIndexesToDelete = [1, 3];

test('non-hashed objects set ready', () => {
    const set = new HashOnlySet(null, dates);

    expect(set.size).toStrictEqual(dates.length);

    for (const date of dates) {
        expect(set.has(date)).toStrictEqual(true);
        expect(set.has(new Date(date))).toStrictEqual(false);
    }

    for (const i of objectsIndexesToDelete) {
        expect(set.delete(new Date(dates[i]))).toStrictEqual(false);
        expect(set.delete(dates[i])).toStrictEqual(true);
        expect(set.delete(dates[i])).toStrictEqual(false);
    }

    const newSize = set.size;
    expect(newSize).toStrictEqual(dates.length - objectsIndexesToDelete.length);

    {
        const leftDates = dates.filter((_, i) => !objectsIndexesToDelete.includes(i));
        const iter = set[Symbol.iterator]();
        let v;
        for (const value of leftDates) {
            v = iter.next();
            expect(v.value).toStrictEqual(value);
        }
        expect(iter.next().done).toStrictEqual(true);
    }

    const newObjects = dates.map(date => new Date(date));
    for (const date of newObjects) {
        set.add(date);
    }
    expect(set.size).toStrictEqual(newSize + dates.length);

    // clear set
    set.clear();
    expect(set.size).toStrictEqual(0);
    expect(set[Symbol.iterator]().next().done).toStrictEqual(true);    
});

const hash = (date) => +date;

test('hashed objects set ready', () => {
    const set = new HashOnlySet(hash, dates);

    expect(set.size).toStrictEqual(dates.length);

    for (const date of dates) {
        expect(set.has(date)).toStrictEqual(true);
        expect(set.has(new Date(date))).toStrictEqual(true);
    }

    for (const i of objectsIndexesToDelete) {
        expect(set.delete(new Date(dates[i]))).toStrictEqual(true);
        expect(set.delete(dates[i])).toStrictEqual(false);
    }

    expect(set.size).toStrictEqual(dates.length - objectsIndexesToDelete.length);

    {
        const leftDates = dates.filter((_, i) => !objectsIndexesToDelete.includes(i));
        const iter = set[Symbol.iterator]();
        let v;
        for (const value of leftDates) {
            v = iter.next();
            expect(v.value).toStrictEqual(value);
        }
        expect(iter.next().done).toStrictEqual(true);
    }

    const newObjects = dates.map(date => new Date(date));
    for (const date of newObjects) {
        set.add(date);
    }
    expect(set.size).toStrictEqual(dates.length);

    // clear set
    set.clear();
    expect(set.size).toStrictEqual(0);
    expect(set[Symbol.iterator]().next().done).toStrictEqual(true);    
});

/**
 * Mixed sets (primitives and objects);
 */

const indexesToDelete = primitivesIndexesToDelete.concat(
    objectsIndexesToDelete.map(i => primitives.length + i)
);

test('non-hashed objects and primitives ready', () => {
    const jointArray = primitives.concat(dates);
    const set = new HashOnlySet(null, jointArray);

    expect(set.size).toStrictEqual(jointArray.length);

    for (const i of indexesToDelete) {
        expect(set.has(jointArray[i])).toStrictEqual(true);
        expect(set.delete(jointArray[i])).toStrictEqual(true);
        expect(set.has(jointArray[i])).toStrictEqual(false);
        expect(set.delete(jointArray[i])).toStrictEqual(false);
    }

    const leftArray = jointArray.filter((_, i) => !indexesToDelete.includes(i));
    expect(set.size).toStrictEqual(leftArray.length);

    {
        const iter = set[Symbol.iterator]();
        let v;
        for (const value of leftArray) {
            v = iter.next();
            expect(v.value).toStrictEqual(value);
        }
        expect(iter.next().done).toStrictEqual(true);
    }

    set.clear();
    expect(set.size).toStrictEqual(0);
    expect(set[Symbol.iterator]().next().done).toStrictEqual(true);
});

test('hashed objects and primitives ready', () => {
    const jointArray = primitives.concat(dates);
    const set = new HashOnlySet(hash, jointArray);

    const hashMap = jointArray.reduce(
        (map, value) => map.set(
            primitives.includes(value)
            ? value
            : hash(value),
            value),
        new Map()
    );

    for (const [hash, value] of hashMap) {
        expect(set.has(hash)).toStrictEqual(true);
        expect(set.has(value)).toStrictEqual(true);
    }
    expect(set.size).toStrictEqual(hashMap.size);

    const hashedValues = [...hashMap].filter(([hash, value]) => hash !== value);
    const deleteCount = parseInt(hashedValues.length / 2);
    for (let i = 0; i < deleteCount; i++) {
        const [hash, value] = hashedValues[i];
        expect(set.has(value)).toStrictEqual(true);
        expect(set.has(hash)).toStrictEqual(true);
        expect(set.delete(value)).toStrictEqual(true);
        expect(set.delete(hash)).toStrictEqual(false);
        expect(set.has(value)).toStrictEqual(false);
        expect(set.has(hash)).toStrictEqual(false);
        hashMap.delete(hash);
    }
    
    const leftValues = [...hashMap].map(([, value]) => value);
    expect(set.size).toStrictEqual(leftValues.length);

    {
        const iter = set[Symbol.iterator]();
        let v;
        for (const value of leftValues) {
            v = iter.next();
            expect(v.value).toStrictEqual(value);
        }
        expect(iter.next().done).toStrictEqual(true);
    }

    set.clear();
    expect(set.size).toStrictEqual(0);
    expect(set[Symbol.iterator]().next().done).toStrictEqual(true);
});

test('iterators work similar', () => {
    const set = new HashOnlySet(hash, primitives.concat(dates));

    const iterators = [
        set.keys(),
        set.values(),
        set.entries(),
        set[Symbol.iterator]()
    ];

    for (let i = 0; i < set.size; i++) {
        const first = iterators[0].next();
        for (let i = 1; i < iterators.length; i++) {
            const res = iterators[i].next();
            expect(res.value).toStrictEqual(first.value);
            expect(res.done).toStrictEqual(false);
        }
    }
    for (let iter of iterators) {
        expect(iter.next().done).toStrictEqual(true);
    }
});

const stringHash = (date) => date.toString();

test('`hash()` monkey patching', () => {
    const set = new HashOnlySet(hash, dates);

    set.valueHash = null;
    for (const date of dates) {
        expect(set.has(date)).toStrictEqual(false);
        expect(set.has(hash(date))).toStrictEqual(true);
        set.add(date);
        expect(set.has(date)).toStrictEqual(true);
    }

    set.valueHash = stringHash;
    for (const date of dates) {
        expect(set.has(date)).toStrictEqual(false);
        set.add(date);
        expect(set.has(date)).toStrictEqual(true);
    }

    expect(set.size).toStrictEqual(dates.length * 3);
});