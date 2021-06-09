import { bloxQty } from '@/utils/bloxfield';
import { durationMs, durationString, isDurationString } from '@/utils/duration';

describe('Check parsing durations', () => {

  it('Should recognize duration strings', () => {
    expect(isDurationString('1d 6h 0.5min')).toBe(true);
    expect(isDurationString('1d 6h 0.5m')).toBe(true);
    expect(isDurationString('1degC')).toBe(false);
    expect(isDurationString('1d and some other stuff')).toBe(false);
    expect(isDurationString('')).toBe(true);
    expect(isDurationString('10')).toBe(true);
    expect(isDurationString('10 10')).toBe(true);
  });

  it('Should parse durations as ms', () => {
    expect(durationMs('2h 6m')).toBe((120 + 6) * 60 * 1000);
    expect(durationMs('')).toBe(0);
    expect(durationMs('10')).toBe(10);
    expect(durationMs('10 10')).toBe(20);
    expect(durationMs(NaN)).toBe(0);
    expect(durationMs(bloxQty(10, 's'))).toBe(10000);
    expect(durationMs(bloxQty(null, 's'))).toBe(0);
    expect(durationMs(bloxQty(10, 'parsecs'))).toBe(0);
  });

  it('Should format durations as string', () => {
    expect(durationString('2h 6m')).toBe('2h 6m');
    expect(durationString('')).toBe('0s');
    expect(durationString('10')).toBe('10ms');
    expect(durationString('10 10')).toBe('20ms');
    expect(durationString(NaN)).toBe('0s');
    expect(durationString(bloxQty(10, 's'))).toBe('10s');
    expect(durationString(bloxQty(null, 's'))).toBe('0s');
    expect(durationString(bloxQty(10, 'parsecs'))).toBe('0s');
    expect(durationString('3662s')).toBe('1h 1m 2s');
    expect(durationString(21010)).toBe('21s');
    expect(durationString(9011)).toBe('9s 11ms');
  });
});
