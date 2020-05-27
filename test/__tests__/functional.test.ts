import {
  durationString,
  objectSorter,
  objectStringSorter,
  uniqueFilter,
  unitDurationString,
} from '@/helpers/functional';
import { Unit } from '@/plugins/spark/units';

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

describe('durationString', () => {
  it('should parse strings', () => {
    expect(durationString('10s')).toEqual('10s');
    expect(durationString('80m')).toEqual('1h 20m');
  });

  it('should parse numbers', () => {
    expect(durationString(10000)).toEqual('10s');
    expect(durationString(0)).toEqual('0s');
    expect(durationString(10)).toEqual('10ms');
    expect(durationString(897866554)).toEqual('10d 9h 24m 26s');
  });

  it('Should handle error cases', () => {
    expect(durationString('10x')).toEqual('10ms');
    expect(durationString(null as any)).toEqual('0s');
    expect(durationString([] as any)).toEqual('0s');
  });
});

describe('unitDurationString', () => {
  it('should parse Units', () => {
    expect(unitDurationString(new Unit(10, 's'))).toEqual('10s');
    expect(unitDurationString(new Unit(80, 'min'))).toEqual('1h 20m');
  });

  it('Should handle error cases', () => {
    expect(unitDurationString(new Unit(10, 'meter'))).toEqual('10ms');
    expect(unitDurationString(null)).toEqual('---');
    expect(unitDurationString(new Unit(null, 's'))).toEqual('---');
  });
});
