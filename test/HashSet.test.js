const { HashSet } = require('../dist');

const primitives = [undefined, null, 0, 1, 2, 3, NaN, true, false, Symbol.iterator, Symbol('test'), '', '0', 'str1', 'test'];

/**
 * primitives and basic operations
 **/

test('primitives are added and iterated properly', () => {
    const set = new HashSet();
    
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

const nonExistent = [['Nothing', 'here'], [1, 'smth']];

test('constructed with iterable, `has()` worked for primitives', () => {
    const set = new HashSet(null, null, primitives);
    expect(set.size).toStrictEqual(primitives.length);
    
    for (const value of primitives) {
        expect(set.has(value)).toStrictEqual(true);
    }
    for (const value of nonExistent) {
        expect(set.has(value)).toStrictEqual(false);
    }
});