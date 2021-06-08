import {
  findById,
  patchedById,
} from '@/utils/collections';

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
