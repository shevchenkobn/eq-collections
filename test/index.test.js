test('everything is properly exported', () => {
    const index = require('../dist');

    expect(index).toHaveProperty('HashMap');
    expect(index).toHaveProperty('HashOnlyMap');
    expect(index).toHaveProperty('HashSet');
    expect(index).toHaveProperty('HashOnlySet');
    expect(index).toHaveProperty('isPrimitive');

    const { HashMap } = require('../dist/HashMap');
    const { HashOnlyMap } = require('../dist/HashOnlyMap');
    const { HashSet } = require('../dist/HashSet');
    const { HashOnlySet } = require('../dist/HashOnlySet');
    const { isPrimitive } = require('../dist/utils');

    expect(index.HashMap).toStrictEqual(HashMap);
    expect(index.HashOnlyMap).toStrictEqual(HashOnlyMap);
    expect(index.HashSet).toStrictEqual(HashSet);
    expect(index.HashOnlySet).toStrictEqual(HashOnlySet);
    expect(index.isPrimitive).toStrictEqual(isPrimitive);
});