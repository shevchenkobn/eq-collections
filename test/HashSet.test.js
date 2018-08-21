const { HashSet } = require('../dist');

const primitives = [undefined, null, 0, 1, 2, 1e6, Infinity, NaN, true, false, Symbol.iterator, Symbol('test'), '', '0', 'str1', 'test'];

/**
 * primitives and basic operations
 **/

test('primitives are added and iterated properly', () => {
  const set = new HashSet();

  for (const value of primitives) {
    expect(set.add(value)).toStrictEqual(set);
  }
  expect(set.size).toStrictEqual(primitives.length);
  for (const value of primitives) {
    expect(set.add(value)).toStrictEqual(set);
  }
  expect(set.size).toStrictEqual(primitives.length);

  const iter = set[Symbol.iterator]();
  for (let i = 0, v = iter.next(); i < primitives.length; i++ , v = iter.next()) {
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

let primitivesIndexesToDelete = [1, 4, 5, 8];
let set;

test('values are deleted and set is cleared', () => {
  set = new HashSet(null, null, primitives);

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

  // iterating
  {
    const leftPrimitives = primitives.filter((_, i) => !primitivesIndexesToDelete.includes(i));
    const iter = set[Symbol.iterator]();
    let v;
    for (const value of leftPrimitives) {
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
];
const clone = (obj) => JSON.parse(JSON.stringify(obj));
const objectsIndexesToDelete = [1, 3];

test('non-hashed objects set ready', () => {
  for (const obj of objects) {
    expect(set.add(obj)).toStrictEqual(set);
  }

  expect(set.size).toStrictEqual(objects.length);

  for (const obj of objects) {
    expect(set.has(obj)).toStrictEqual(true);
    expect(set.has(clone(obj))).toStrictEqual(false);
  }

  for (const i of objectsIndexesToDelete) {
    expect(set.delete(clone(objects[i]))).toStrictEqual(false);
    expect(set.delete(objects[i])).toStrictEqual(true);
    expect(set.delete(objects[i])).toStrictEqual(false);
  }

  const newSize = set.size;
  expect(newSize).toStrictEqual(objects.length - objectsIndexesToDelete.length);

  {
    const leftObjs = objects.filter((_, i) => !objectsIndexesToDelete.includes(i));
    const iter = set[Symbol.iterator]();
    let v;
    for (const value of leftObjs) {
      v = iter.next();
      expect(v.value).toStrictEqual(value);
    }
    expect(iter.next().done).toStrictEqual(true);
  }

  const newObjects = objects.map(date => new Date(date));
  for (const date of newObjects) {
    expect(set.add(date)).toStrictEqual(set);
  }
  expect(set.size).toStrictEqual(newSize + objects.length);

  // clear set
  set.clear();
  expect(set.size).toStrictEqual(0);
  expect(set[Symbol.iterator]().next().done).toStrictEqual(true);
});

const hash = (obj) => obj[0];

test('hashed-only objects set ready', () => {
  const set = new HashSet(hash, null, objects);

  expect(set.size).toStrictEqual(objects.length);

  for (const obj of objects) {
    expect(set.has(obj)).toStrictEqual(true);
    expect(set.has(clone(obj))).toStrictEqual(false);
  }

  for (const i of objectsIndexesToDelete) {
    expect(set.delete(clone(objects[i]))).toStrictEqual(false);
    expect(set.delete(objects[i])).toStrictEqual(true);
  }

  expect(set.size).toStrictEqual(objects.length - objectsIndexesToDelete.length);

  {
    const leftObjs = objects.filter((_, i) => !objectsIndexesToDelete.includes(i));
    const iter = set[Symbol.iterator]();
    let v;
    for (const value of leftObjs) {
      v = iter.next();
      expect(v.value).toStrictEqual(value);
    }
    expect(iter.next().done).toStrictEqual(true);
  }

  const newObjects = objects.map(clone);
  for (const obj of newObjects) {
    expect(set.add(obj)).toStrictEqual(set);
  }
  expect(set.size).toStrictEqual(objects.length * 2 - objectsIndexesToDelete.length);

  // clear set
  set.clear();
  expect(set.size).toStrictEqual(0);
  expect(set[Symbol.iterator]().next().done).toStrictEqual(true);
});

const areEqual = (obj1, obj2) => obj1[1] === obj2[1];
const getActualPairs = (objects, hash, areEqual) => {
  const hashValues = objects.reduce(
    (map, value) => {
      const values = map.get(hash(value)) || [];
      const indexOfEqual = values.findIndex(v => areEqual(v, value));
      if (~indexOfEqual) {
        values[indexOfEqual] = value;
      } else {
        values.push(value);
        if (values.length === 1) {
          map.set(hash(value), values);
        }
      }
      return map;
    },
    new Map()
  );
  const actualHashPairs = [];
  for (const [hash, values] of hashValues) {
    for (const value of values) {
      actualHashPairs.push([hash, value]);
    }
  }
  return actualHashPairs;
};

test('hashed objects set ready', () => {
  const set = new HashSet(hash, areEqual, objects);

  const actualHashPairs = getActualPairs(objects, hash, areEqual);
  expect(set.size).toStrictEqual(actualHashPairs.length);

  for (const obj of objects) {
    expect(set.has(obj)).toStrictEqual(true);
    expect(set.has(clone(obj))).toStrictEqual(true);
  }

  const deletedIndexes = objectsIndexesToDelete.map(i => actualHashPairs.findIndex(([, value]) => areEqual(value, objects[i])));
  for (const i of deletedIndexes) {
    expect(set.delete(clone(actualHashPairs[i][1]))).toStrictEqual(true);
    expect(set.delete(actualHashPairs[i][1])).toStrictEqual(false);
    expect(set.delete(actualHashPairs[i][0])).toStrictEqual(false);
  }

  expect(set.size).toStrictEqual(actualHashPairs.length - deletedIndexes.length);

  {
    const leftObjs = actualHashPairs.filter((_, i) => !deletedIndexes.includes(i));
    const iter = set[Symbol.iterator]();
    let v;
    for (const [, value] of leftObjs) {
      v = iter.next();
      expect(v.value).toStrictEqual(value);
    }
    expect(iter.next().done).toStrictEqual(true);
  }

  const newObjects = objects.map(clone);
  for (const obj of newObjects) {
    expect(set.add(obj)).toStrictEqual(set);
  }
  expect(set.size).toStrictEqual(actualHashPairs.length);

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
  const jointArray = primitives.concat(objects);
  const set = new HashSet(null, null, jointArray);

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

const NaNSafeIncludes = (arr, value) => value === value ? arr.includes(value) : arr.some(Number.isNaN);

test('hashed-only objects and primitives ready', () => {
  const jointArray = primitives.concat(objects);
  const set = new HashSet(hash, null, jointArray);

  for (const value of jointArray) {
    expect(set.has(value)).toStrictEqual(true);
    if (!NaNSafeIncludes(primitives, value)) {
      const hashed = hash(value);
      expect(set.has(hashed)).toStrictEqual(NaNSafeIncludes(primitives, hashed));
    }
  }
  expect(set.size).toStrictEqual(jointArray.length);

  const hashedValues = jointArray
    .map(value => [
      NaNSafeIncludes(primitives, value)
        ? value
        : hash(value),
      value
    ])
    .filter(([hash, value]) => value === value && hash !== value);
  const deleteCount = parseInt(hashedValues.length / 2);
  const deletedPrimitives = [];
  for (let i = 0; i < deleteCount; i++) {
    const [hash, value] = hashedValues[i];
    const hashIsValidPrimitive = NaNSafeIncludes(primitives, hash) && !NaNSafeIncludes(deletedPrimitives, hash);
    expect(set.has(value)).toStrictEqual(true);
    expect(set.has(hash)).toStrictEqual(hashIsValidPrimitive);
    expect(set.delete(hash)).toStrictEqual(hashIsValidPrimitive);
    if (hashIsValidPrimitive) {
      deletedPrimitives.push(hash);
    }
    expect(set.delete(value)).toStrictEqual(true);
    expect(set.has(value)).toStrictEqual(false);
    expect(set.has(hash)).toStrictEqual(false);
  }

  const leftValues = jointArray.filter(
    value => NaNSafeIncludes(primitives, value)
      && !hashedValues.some(([hash], i) => i < deleteCount && value === hash)
      || hashedValues.findIndex(([hash, v]) => value === v) >= deleteCount
  );
  const hashToValues = leftValues.reduce((map, value) => {
    if (NaNSafeIncludes(primitives, value)) {
      return map;
    }
    const hashed = hash(value);
    if (NaNSafeIncludes(primitives, hashed)) {
      const values = map.get(hashed) || [];
      values.push(value);
      if (values.length === 1) {
        map.set(hashed, values);
      }
    }
    return map;
  }, new Map());
  for (const [hash, values] of hashToValues) {
    const indexToInsert = leftValues.indexOf(hash);
    for (const value of values) {
      leftValues.splice(leftValues.indexOf(value), 1);
    }
    leftValues.splice(indexToInsert + 1, 0, ...values);
  }
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

const mixedEqual = (value1, value2) => {
  return NaNSafeIncludes(primitives, value1) || NaNSafeIncludes(primitives, value2)
    ? value1 === value2
    : areEqual(value1, value2);
};

test('hashed objects and primitives ready', () => {
  const jointArray = primitives.concat(objects);
  const set = new HashSet(hash, mixedEqual, jointArray);

  const hashedValues = jointArray.reduce(
    (map, value) => {
      const hashedIsValue = NaNSafeIncludes(primitives, value);
      const hashed = hashedIsValue ? value : hash(value);
      const values = map.get(hashed) || [];
      const indexOfEqual = values.findIndex(
        v => mixedEqual(v, value)
      );
      if (~indexOfEqual) {
        values[indexOfEqual] = value;
      } else {
        values.push(value);
        if (values.length === 1) {
          map.set(hashed, values);
        }
      }
      return map;
    },
    new Map()
  );
  const actualHashPairs = [];
  for (const [hash, values] of hashedValues) {
    for (const value of values) {
      actualHashPairs.push([hash, value]);
    }
  }

  for (const value of jointArray) {
    expect(set.has(value)).toStrictEqual(true);
    if (!NaNSafeIncludes(primitives, value)) {
      const hashed = hash(value);
      expect(set.has(hashed)).toStrictEqual(NaNSafeIncludes(primitives, hashed));
    }
  }
  expect(set.size).toStrictEqual(actualHashPairs.length);

  const deleteCount = parseInt(actualHashPairs.length / 2);
  const deletedPrimitives = [];
  for (let i = 0; i < deleteCount; i++) {
    const [hash, value] = actualHashPairs[i];
    const hashIsValidPrimitive = NaNSafeIncludes(primitives, hash) && !NaNSafeIncludes(deletedPrimitives, hash);
    expect(set.has(value)).toStrictEqual(true);
    expect(set.has(hash)).toStrictEqual(hashIsValidPrimitive);
    expect(set.delete(hash)).toStrictEqual(hashIsValidPrimitive);
    if (hashIsValidPrimitive) {
      deletedPrimitives.push(hash);
    }
    expect(set.delete(value)).toStrictEqual(!hashIsValidPrimitive);
    expect(set.has(value)).toStrictEqual(false);
    expect(set.has(hash)).toStrictEqual(false);
  }

  const leftHashedValues = actualHashPairs.filter(
    ([hash, value], i) => i >= deleteCount
      && (
        !NaNSafeIncludes(primitives, value)
        || actualHashPairs.findIndex(
          ([hash,], i) => i < deleteCount && (value !== value && hash !== hash || hash === value)
        )
      )
  );
  expect(set.size).toStrictEqual(leftHashedValues.length);

  {
    const iter = set[Symbol.iterator]();
    let v;
    for (const [, value] of leftHashedValues) {
      v = iter.next();
      expect(v.value).toStrictEqual(value);
    }
    expect(iter.next().done).toStrictEqual(true);
  }

  set.clear();
  expect(set.size).toStrictEqual(0);
  expect(set[Symbol.iterator]().next().done).toStrictEqual(true);
});

test('iterators work similarly', () => {
  const set = new HashSet(hash, mixedEqual, primitives.concat(objects));

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

test('`forEach()` testing', () => {
  const set = new HashSet(hash, mixedEqual, primitives.concat(objects));

  let iter = set.entries();
  let value;

  set.forEach((value1, value2, mapArg) => {
    value = iter.next().value;

    expect(value).toStrictEqual(value1);
    expect(value).toStrictEqual(value2);
    expect(mapArg).toStrictEqual(set);
  });
  expect(iter.next().done).toStrictEqual(true);

  iter = set.entries();
  const thisArg = { hello: 'world' };

  set.forEach(function(value1, value2, mapArg) {
    expect(this).toStrictEqual(thisArg);

    value = iter.next().value;

    expect(value).toStrictEqual(value1);
    expect(value).toStrictEqual(value2);
    expect(mapArg).toStrictEqual(set);
  }, thisArg);
  expect(iter.next().done).toStrictEqual(true);
});

const stringHash = (arr) => arr[0].toString();

test('hash function monkey patching', () => {
  const set = new HashSet(hash, null, objects);

  set.valueHash = null;
  for (const obj of objects) {
    expect(set.has(obj)).toStrictEqual(false);
    expect(set.has(hash(obj))).toStrictEqual(false);
    expect(set.add(obj)).toStrictEqual(set);
    expect(set.has(obj)).toStrictEqual(true);
  }

  set.valueHash = stringHash;
  for (const obj of objects) {
    expect(set.has(obj)).toStrictEqual(false);
    expect(set.add(obj)).toStrictEqual(set);
    expect(set.has(obj)).toStrictEqual(true);
  }

  expect(set.size).toStrictEqual(objects.length * 3);
});

const anotherEqual = function (arr1, arr2) {
  const equal = arr1[1] === arr2[1];
  if (equal) {
    this.push('equal');
  }
  return equal;
};

test('equal function monkey patching', () => {
  const set = new HashSet(hash, areEqual, objects);

  const actualHashPairs = getActualPairs(objects, hash, areEqual);

  set.valuesEqual = null;
  for (const obj of objects) {
    const cloned = clone(obj);
    const isInSet = actualHashPairs.some(([, value]) => value === obj);
    expect(set.has(obj)).toStrictEqual(isInSet);
    expect(set.has(hash(obj))).toStrictEqual(false);
    expect(set.has(cloned)).toStrictEqual(false);
    if (!isInSet) {
      expect(set.add(obj)).toStrictEqual(set);
      expect(set.has(cloned)).toStrictEqual(false);
      expect(set.has(obj)).toStrictEqual(true);
    }
  }
  expect(set.size).toStrictEqual(objects.length);

  const logs = [];
  set.valuesEqual = anotherEqual.bind(logs);
  for (const obj of objects) {
    expect(set.has(obj)).toStrictEqual(true);
    expect(set.has(clone(obj))).toStrictEqual(true);
  }
  expect(set.size * 2).toStrictEqual(logs.length);
});