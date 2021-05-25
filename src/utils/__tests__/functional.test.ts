import {
  findById,
  mqttTopicExp,
  objectSorter,
  objectStringSorter,
  patchedById,
  uniqueFilter,
} from '@/utils/functional';

describe('Array funcs', () => {
  it('should filter and sort arrays', () => {
    expect([1, 1, '1', 2, 5, 5, 5, 5, '8', 'puppies', [], []]
      .filter(uniqueFilter))
      .toEqual([1, '1', 2, 5, '8', 'puppies', [], []]);

    expect([{ k: 1, x: 10 }, { k: 6 }, { k: 2 }, { k: -1 }]
      .sort(objectSorter('k')))
      .toEqual([{ k: -1 }, { k: 1, x: 10 }, { k: 2 }, { k: 6 }]);

    expect([{ k: 'a' }, { k: 'x' }, { k: 'b' }, { k: 'test' }, { k: 'C' }]
      .sort(objectStringSorter('k')))
      .toEqual([{ k: 'a' }, { k: 'b' }, { k: 'C' }, { k: 'test' }, { k: 'x' }]);
  });
});

interface TestObj extends HasId {
  v1: string;
  nesting: {
    nested: number;
    other?: number;
  };
}

describe('HasId array manipulation', () => {
  const mkArr = (): TestObj[] => ([
    { id: 'id-1', v1: 'one', nesting: { nested: 1 } },
    { id: 'id-2', v1: 'two', nesting: { nested: 2 } },
    { id: 'id-3', v1: 'three', nesting: { nested: 3 } },
    { id: 'id-dup', v1: 'dup1', nesting: { nested: 0 } },
    { id: 'id-dup', v1: 'dup2', nesting: { nested: 0 } },
  ]);
  const empty = (): TestObj => ({ id: '', v1: '', nesting: { nested: 0 } });

  it('findById()', () => {
    const arr = mkArr();

    expect(findById(arr, 'nope')).toBeNull();
    expect(findById(arr, 'nope', empty()))
      .toMatchObject({ id: '' });
    expect(findById(arr, 'id-2')).toMatchObject(arr[1]);
    expect(findById(arr, 'id-dup')).toMatchObject({ v1: 'dup1' });
  });

  it('patchedById()', () => {
    const arr = mkArr();
    expect(patchedById(arr, { id: 'absent' }))
      .toBeNull();
    expect(patchedById(arr, { id: 'absent' }, empty()))
      .toMatchObject({ id: '' });
    expect(patchedById(arr, { id: 'id-1', v1: 'one' }, empty()))
      .toMatchObject({ id: 'id-1' });
    expect(patchedById(arr, { id: 'id-2', v1: 'one' }))
      .toMatchObject({ ...arr[1], v1: 'one' });
    expect(patchedById(arr, { id: 'id-dup', nesting: { nested: -1 } }))
      .toMatchObject({ id: 'id-dup', v1: 'dup1', nesting: { nested: -1 } });
  });
});


describe('MQTT helpers', () => {
  it('mqttTopicExp()', () => {
    let exp = mqttTopicExp('base/test');
    expect(exp.test('base/test')).toBe(true);
    expect(exp.test('base/test/other')).toBe(false);

    exp = mqttTopicExp('base/test/+');
    expect(exp.test('base/test')).toBe(false);
    expect(exp.test('base/test/other')).toBe(true);
    expect(exp.test('base/test/something/else')).toBe(false);

    exp = mqttTopicExp('base/test/#');
    expect(exp.test('base/test')).toBe(true);
    expect(exp.test('base/test/other')).toBe(true);
    expect(exp.test('base/test/something/else')).toBe(true);

    exp = mqttTopicExp('base/test/#/end');
    expect(exp.test('base/test')).toBe(false);
    expect(exp.test('base/test/other')).toBe(false);
    expect(exp.test('base/test/something/else/end')).toBe(true);
    expect(exp.test('base/test/end')).toBe(true);

    exp = mqttTopicExp('base/+/middle/+/end');
    expect(exp.test('base/dash-dash/middle/second/end')).toBe(true);
  });
});
