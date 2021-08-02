import {
  makeObjectSorter,
  uniqueFilter,
} from '@/utils/functional';

describe('Array funcs', () => {
  it('should filter and sort arrays', () => {
    expect([1, 1, '1', 2, 5, 5, 5, 5, '8', 'puppies', [], []]
      .filter(uniqueFilter))
      .toEqual([1, '1', 2, 5, '8', 'puppies', []]);

    expect([{ k: 1, x: 10 }, { k: 6 }, { k: 2 }, { k: -1 }]
      .sort(makeObjectSorter('k')))
      .toEqual([{ k: -1 }, { k: 1, x: 10 }, { k: 2 }, { k: 6 }]);

    expect([{ k: 'a' }, { k: 'x' }, { k: 'b' }, { k: 'test' }, { k: 'C' }]
      .sort(makeObjectSorter('k')))
      .toEqual([{ k: 'a' }, { k: 'b' }, { k: 'C' }, { k: 'test' }, { k: 'x' }]);
  });
});
