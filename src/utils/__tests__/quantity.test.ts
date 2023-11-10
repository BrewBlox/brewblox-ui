import { describe, expect, it } from 'vitest';
import { isDurationString, isQuantity } from '../identity';
import {
  bloxQty,
  durationMs,
  durationString,
  prettyQty,
  prettyUnit,
  rawQty,
} from '../quantity';

describe('Type checking', () => {
  it('Should recognize Quantity', () => {
    expect(isQuantity(null)).toBe(false);
    expect(isQuantity(10)).toBe(false);
    expect(isQuantity(bloxQty(10, 'degC').toJSON())).toBe(true);
    expect(isQuantity(bloxQty(10, 'degC'))).toBe(true);
    expect(isQuantity(rawQty(10, 'degC'))).toBe(true);
  });
});

describe('prettify unit values', () => {
  it('Should handle direct unit strings', () => {
    expect(prettyUnit('celsius')).toBe('°C');
    expect(prettyUnit('degC')).toBe('°C');
    expect(prettyUnit('degCelsius')).toBe('°C');

    expect(prettyUnit('fahrenheit')).toBe('°F');
    expect(prettyUnit('degF')).toBe('°F');
    expect(prettyUnit('degfahrenheit')).toBe('°F');

    expect(prettyUnit('1/degC')).toBe('/°C');
    expect(prettyUnit('1 / degC')).toBe('/°C');
    expect(prettyUnit('1/degC')).toBe('/°C');
    expect(prettyUnit('°C /hour')).toBe('°C/h');
    expect(prettyUnit('degC * hour')).toBe('°C·h');

    expect(prettyUnit('degP test')).toBe('°P test');
    expect(prettyUnit('degXYZ')).toBe('°XYZ');
    expect(prettyUnit('gedegend')).toBe('gedegend');
    expect(prettyUnit('degend')).toBe('degend');
    expect(prettyUnit('degEnd')).toBe('°End');
    expect(prettyUnit('[degC]')).toBe('[°C]');
    expect(prettyUnit('deg')).toBe('°');

    expect(prettyUnit('millisecond')).toBe('ms');
    expect(prettyUnit('[millisecond]')).toBe('[ms]');
    expect(prettyUnit('hours')).toBe('h');
    expect(prettyUnit('Hour daily')).toBe('h daily');
  });

  it('Should handle Quantity objects', () => {
    expect(prettyUnit(bloxQty(10, 'degC'))).toBe('°C');
    expect(prettyUnit(bloxQty(20, 'degF'))).toBe('°F');
  });
});

describe('prettify Quantity', () => {
  it('should prettify quantities', () => {
    expect(prettyQty(bloxQty(10, 'degC'))).toBe('10.00 °C');
    expect(prettyQty(bloxQty('61m30s'))).toBe('1h 1m 30s');
  });
});

describe('Check equality', () => {
  it('should compare units using .eq()', () => {
    expect(bloxQty(10, 'degC').eq(bloxQty(15, 'degC'))).toBe(false);
    expect(bloxQty(10, 'degC').eq(bloxQty(10.1, 'degC'))).toBe(false);
    expect(bloxQty(10, 'degC').eq(bloxQty(10.001, 'degC'))).toBe(true);
    expect(bloxQty(10, 'degC').eq(bloxQty(10, 'degF'))).toBe(false);
    expect(bloxQty(10, 'degC').eq(bloxQty(10, 'delta_degC'))).toBe(false);
    expect(bloxQty(null, 'degC').eq(bloxQty(10, 'degC'))).toBe(false);
    expect(bloxQty(null, 'degC').eq(bloxQty(null, 'degC'))).toBe(true);
  });
});

describe('Convert temp', () => {
  it('should convert to its own type', () => {
    expect(bloxQty(10, 'degC').to('degC')).toEqual(bloxQty(10, 'degC'));
    expect(bloxQty(10, 'degF').to('degF')).toEqual(bloxQty(10, 'degF'));
    expect(bloxQty(10, 'degF').to('degF')).toEqual(bloxQty(10, 'degF'));
  });

  it('should convert to other absolute temperatures', () => {
    expect(bloxQty(10, 'degC').to('degF').eq(bloxQty(50, 'degF'))).toBe(true);
    expect(bloxQty(10, 'degC').to('degF').eq(bloxQty(10, 'degC'))).toBe(true);
    expect(bloxQty(10, 'degF').to('degC').eq(bloxQty(-12.22, 'degC'))).toBe(
      true,
    );
  });
});

describe('Convert delta temp', () => {
  it('Should convert from abs to delta values', () => {
    expect(
      bloxQty(10, 'degC').to('delta_degC').eq(bloxQty(10, 'delta_degC')),
    ).toBe(true);
    expect(
      bloxQty(10, 'degC').to('delta_degF').eq(bloxQty(18, 'delta_degF')),
    ).toBe(true);
    expect(
      bloxQty(10, 'degF').to('delta_degC').eq(bloxQty(5.56, 'delta_degC')),
    ).toBe(true);
    expect(
      bloxQty(10, 'degF').to('delta_degF').eq(bloxQty(10, 'delta_degF')),
    ).toBe(true);
  });

  it('Should convert from delta to delta values', () => {
    expect(
      bloxQty(10, 'delta_degC').to('delta_degC').eq(bloxQty(10, 'delta_degC')),
    ).toBe(true);
    expect(
      bloxQty(10, 'delta_degC').to('delta_degF').eq(bloxQty(18, 'delta_degF')),
    ).toBe(true);

    expect(
      bloxQty(10, 'delta_degF')
        .to('delta_degC')
        .eq(bloxQty(5.56, 'delta_degC')),
    ).toBe(true);
    expect(
      bloxQty(10, 'delta_degF').to('delta_degF').eq(bloxQty(10, 'delta_degF')),
    ).toBe(true);
  });
});

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
