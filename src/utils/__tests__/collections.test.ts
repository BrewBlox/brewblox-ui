import {
  concatById,
  filterById,
  findById,
  findByKey,
  popById,
  spliceById,
} from '@/utils/collections';
import { describe, expect, it } from 'vitest';

interface TestObj extends HasId {
  v1: string;
  nesting: {
    nested: number;
    other?: number;
  };
}

describe('HasId array manipulation', () => {
  const mkArr = (): TestObj[] => [
    { id: 'id-1', v1: 'one', nesting: { nested: 1 } },
    { id: 'id-2', v1: 'two', nesting: { nested: 2 } },
    { id: 'id-3', v1: 'three', nesting: { nested: 3 } },
    { id: 'id-dup', v1: 'dup1', nesting: { nested: 0 } },
    { id: 'id-dup', v1: 'dup2', nesting: { nested: 0 } },
  ];
  const empty = (): TestObj => ({ id: '', v1: '', nesting: { nested: 0 } });

  it('findById()', () => {
    const arr = mkArr();

    expect(findById(arr, 'nope')).toBeNull();
    expect(findById(arr, 'nope', empty())).toMatchObject({ id: '' });
    expect(findById(arr, 'id-2')).toMatchObject(arr[1]);
    expect(findById(arr, 'id-dup')).toMatchObject({ v1: 'dup1' });
  });

  it('findByKey()', () => {
    const arr = mkArr();

    expect(findByKey(arr, 'v1', 'nope')).toBeNull();
    expect(findByKey(arr, 'v1', '', empty())).toMatchObject({ id: '' });
    expect(findByKey(arr, 'v1', 'two')).toMatchObject(arr[1]);
    expect(findByKey(arr, 'id', 'id-dup')).toMatchObject({ v1: 'dup1' });
  });

  it('spliceById()', () => {
    expect(spliceById(mkArr(), empty()).length).toBe(6);
    expect(spliceById(mkArr(), mkArr()[2]).length).toBe(5);
    expect(spliceById(mkArr(), mkArr()[2], false).length).toBe(4);
    expect(spliceById(mkArr(), { id: 'id-2' }, false).length).toBe(4);

    // input is modified
    const arr = mkArr();
    spliceById(arr, { id: 'id-1' }, false);
    expect(arr.length).toBe(4);
  });

  it('popById()', () => {
    expect(popById(mkArr(), empty())).toBeUndefined();
    expect(popById(mkArr(), mkArr()[2])?.id).toBe('id-3');

    // input is modified
    const arr = mkArr();
    popById(arr, { id: 'id-1' });
    popById(arr, { id: 'id-nope' });
    expect(arr.length).toBe(4);
  });

  it('concatById()', () => {
    expect(concatById(mkArr(), empty()).length).toBe(6);
    expect(concatById(mkArr(), mkArr()[2]).length).toBe(5);

    // input is not modified
    const arr = mkArr();
    const changed = concatById(arr, {
      id: 'id-1',
      v1: 'changed',
      nesting: { nested: 0 },
    });
    expect(arr[0].v1).toBe('one');
    expect(changed[0].v1).toBe('changed');
  });

  it('filterById()', () => {
    expect(filterById(mkArr(), empty()).length).toBe(5);
    expect(filterById(mkArr(), mkArr()[2]).length).toBe(4);

    // input is not modified
    const arr = mkArr();
    const changed = filterById(arr, { id: 'id-1' });
    expect(arr.length).toBe(5);
    expect(changed.length).toBe(4);
    expect(findById(changed, 'id-1')).toBeNull();
  });
});
