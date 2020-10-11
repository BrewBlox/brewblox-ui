import { durationMs, isDurationString } from '@/helpers/duration';


describe('Check parsing durations', () => {

  it('Should recognize duration strings', () => {
    expect(isDurationString('1d 6h 0.5min')).toBe(true);
    expect(isDurationString('1d 6h 0.5m')).toBe(true);
    expect(isDurationString('1degC')).toBe(false);
    expect(isDurationString('1d and some other stuff')).toBe(false);
    expect(isDurationString('')).toBe(true);
  });

  it('Should parse duration strings', () => {
    expect(durationMs('2h 6m')).toBe((120 + 6) * 60 * 1000);
    expect(durationMs('')).toBe(0);
  });
});
