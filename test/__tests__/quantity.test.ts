import {
  bloxQty,
  isJSQuantity,
  isQuantity,
  prettyQty,
  prettyUnit,
  rawQty,
} from '@/helpers/bloxfield';


describe('Type checking', () => {
  it('Should recognize Quantity', () => {
    expect(isQuantity(null)).toBe(false);
    expect(isQuantity(10)).toBe(false);
    expect(isQuantity(bloxQty(10, 'degC').toJSON())).toBe(true);
    expect(isQuantity(bloxQty(10, 'degC'))).toBe(true);
    expect(isQuantity(rawQty(10, 'degC'))).toBe(true);
  });

  it('Should recognize JSQuantity', () => {
    expect(isJSQuantity(null)).toBe(false);
    expect(isJSQuantity(10)).toBe(false);
    expect(isJSQuantity(bloxQty(10, 'degC').toJSON())).toBe(false);
    expect(isJSQuantity(bloxQty(10, 'degC'))).toBe(true);
    expect(isJSQuantity(rawQty(10, 'degC'))).toBe(false);
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
    expect(
      bloxQty(10, 'degC').eq(bloxQty(15, 'degC')))
      .toBe(false);
    expect(
      bloxQty(10, 'degC').eq(bloxQty(10.1, 'degC')))
      .toBe(false);
    expect(
      bloxQty(10, 'degC').eq(bloxQty(10.001, 'degC')))
      .toBe(true);
    expect(
      bloxQty(10, 'degC').eq(bloxQty(10, 'degF')))
      .toBe(false);
    expect(
      bloxQty(10, 'degC').eq(bloxQty(10, 'delta_degC')))
      .toBe(false);
    expect(
      bloxQty(null, 'degC').eq(bloxQty(10, 'degC')))
      .toBe(false);
    expect(
      bloxQty(null, 'degC').eq(bloxQty(null, 'degC')))
      .toBe(true);
  });
});

describe('Convert temp', () => {
  it('should convert to its own type', () => {
    expect(
      bloxQty(10, 'degC').to('degC'))
      .toEqual(bloxQty(10, 'degC'));
    expect(
      bloxQty(10, 'degF').to('degF'))
      .toEqual(bloxQty(10, 'degF'));
    expect(
      bloxQty(10, 'degF').to('degF'))
      .toEqual(bloxQty(10, 'degF'));
  });

  it('should convert to other absolute temperatures', () => {
    expect(
      bloxQty(10, 'degC').to('degF').eq(bloxQty(50, 'degF')))
      .toBe(true);
    expect(
      bloxQty(10, 'degC').to('degF').eq(bloxQty(10, 'degC')))
      .toBe(true);
    expect(
      bloxQty(10, 'degF').to('degC').eq(bloxQty(-12.22, 'degC')))
      .toBe(true);
  });
});

describe('Convert delta temp', () => {
  it('Should convert from abs to delta values', () => {
    expect(
      bloxQty(10, 'degC')
        .to('delta_degC')
        .eq(bloxQty(10, 'delta_degC')))
      .toBe(true);
    expect(
      bloxQty(10, 'degC')
        .to('delta_degF')
        .eq(bloxQty(18, 'delta_degF')))
      .toBe(true);
    expect(
      bloxQty(10, 'degF')
        .to('delta_degC')
        .eq(bloxQty(5.56, 'delta_degC')))
      .toBe(true);
    expect(
      bloxQty(10, 'degF')
        .to('delta_degF')
        .eq(bloxQty(10, 'delta_degF')))
      .toBe(true);
  });

  it('Should convert from delta to delta values', () => {
    expect(bloxQty(10, 'delta_degC').to('delta_degC').eq(bloxQty(10, 'delta_degC')))
      .toBe(true);
    expect(bloxQty(10, 'delta_degC').to('delta_degF').eq(bloxQty(18, 'delta_degF')))
      .toBe(true);

    expect(bloxQty(10, 'delta_degF').to('delta_degC').eq(bloxQty(5.56, 'delta_degC')))
      .toBe(true);
    expect(bloxQty(10, 'delta_degF').to('delta_degF').eq(bloxQty(10, 'delta_degF')))
      .toBe(true);
  });
});
