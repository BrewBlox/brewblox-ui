import { prettify, Temp } from '@/plugins/spark/units';


describe('Prettify unit values', () => {
  it('Should handle unit postfixes', () => {
    expect(prettify('celsius')).toBe('°C');
    expect(prettify('degC')).toBe('°C');
    expect(prettify('degCelsius')).toBe('°C');

    expect(prettify('fahrenheit')).toBe('°F');
    expect(prettify('degF')).toBe('°F');
    expect(prettify('degfahrenheit')).toBe('°F');

    expect(prettify('1/degC')).toBe('/°C');
    expect(prettify('1 / degC')).toBe('/°C');
    expect(prettify('1/degC')).toBe('/°C');
    expect(prettify('°C /hour')).toBe('°C/h');
    expect(prettify('degC * hour')).toBe('°C·h');

    expect(prettify('degP test')).toBe('°P test');
    expect(prettify('degXYZ')).toBe('°XYZ');
    expect(prettify('gedegend')).toBe('gedegend');
    expect(prettify('degend')).toBe('degend');
    expect(prettify('degEnd')).toBe('°End');
    expect(prettify('[degC]')).toBe('[°C]');
    expect(prettify('deg')).toBe('°');

    expect(prettify('millisecond')).toBe('ms');
    expect(prettify('hours')).toBe('h');
    expect(prettify('Hour daily')).toBe('h daily');
  });
});

describe('Check equality', () => {
  it('should compare units using .isEqual()', () => {
    expect(new Temp(10, 'degC').isEqual(new Temp(15, 'degC')))
      .toBe(false);
    expect(new Temp(10, 'degC').isEqual(new Temp(10.1, 'degC')))
      .toBe(false);
    expect(new Temp(10, 'degC').isEqual(new Temp(10.001, 'degC')))
      .toBe(true);
    expect(new Temp(10, 'degC').isEqual(new Temp(10, 'degF')))
      .toBe(false);
    expect(new Temp(10, 'degC').isEqual(new Temp(10, 'delta_degC')))
      .toBe(false);
    expect(new Temp(null, 'degC').isEqual(new Temp(10, 'degC')))
      .toBe(false);
    expect(new Temp(null, 'degC').isEqual(new Temp(null, 'degC')))
      .toBe(true);
  });
});

describe('Convert temp', () => {
  it('should convert to its own type', () => {
    expect(new Temp(10, 'degC').convert('degC'))
      .toEqual(new Temp(10, 'degC'));
    expect(new Temp(10, 'degF').convert('degF'))
      .toEqual(new Temp(10, 'degF'));
    expect(new Temp(10, 'degK').convert('degK'))
      .toEqual(new Temp(10, 'degK'));
  });

  it('should convert to other absolute temperatures', () => {
    expect(new Temp(10, 'degC').convert('degF').isEqual(new Temp(50, 'degF')))
      .toBe(true);
    expect(new Temp(10, 'degC').convert('degK').isEqual(new Temp(283.15, 'degK')))
      .toBe(true);

    expect(new Temp(10, 'degF').convert('degC').isEqual(new Temp(-12.22, 'degC')))
      .toBe(true);
    expect(new Temp(10, 'degF').convert('degK').isEqual(new Temp(260.928, 'degK')))
      .toBe(true);

    expect(new Temp(10, 'degK').convert('degC').isEqual(new Temp(-263.15, 'degC')))
      .toBe(true);
    expect(new Temp(10, 'degK').convert('degF').isEqual(new Temp(-441.67, 'degF')))
      .toBe(true);
  });
});

describe('Convert delta temp', () => {
  it('Should convert from abs to delta values', () => {
    expect(new Temp(10, 'degC').convert('delta_degC').isEqual(new Temp(10, 'delta_degC')))
      .toBe(true);
    expect(new Temp(10, 'degC').convert('delta_degF').isEqual(new Temp(18, 'delta_degF')))
      .toBe(true);
    expect(new Temp(10, 'degC').convert('delta_degK').isEqual(new Temp(10, 'delta_degK')))
      .toBe(true);

    expect(new Temp(10, 'degF').convert('delta_degC').isEqual(new Temp(5.56, 'delta_degC')))
      .toBe(true);
    expect(new Temp(10, 'degF').convert('delta_degF').isEqual(new Temp(10, 'delta_degF')))
      .toBe(true);
    expect(new Temp(10, 'degF').convert('delta_degK').isEqual(new Temp(5.56, 'delta_degK')))
      .toBe(true);

    expect(new Temp(10, 'degK').convert('delta_degC').isEqual(new Temp(10, 'delta_degC')))
      .toBe(true);
    expect(new Temp(10, 'degK').convert('delta_degF').isEqual(new Temp(18, 'delta_degF')))
      .toBe(true);
    expect(new Temp(10, 'degK').convert('delta_degK').isEqual(new Temp(10, 'delta_degK')))
      .toBe(true);
  });

  it('Should convert from delta to delta values', () => {
    expect(new Temp(10, 'delta_degC').convert('delta_degC').isEqual(new Temp(10, 'delta_degC')))
      .toBe(true);
    expect(new Temp(10, 'delta_degC').convert('delta_degF').isEqual(new Temp(18, 'delta_degF')))
      .toBe(true);
    expect(new Temp(10, 'delta_degC').convert('delta_degK').isEqual(new Temp(10, 'delta_degK')))
      .toBe(true);

    expect(new Temp(10, 'delta_degF').convert('delta_degC').isEqual(new Temp(5.56, 'delta_degC')))
      .toBe(true);
    expect(new Temp(10, 'delta_degF').convert('delta_degF').isEqual(new Temp(10, 'delta_degF')))
      .toBe(true);
    expect(new Temp(10, 'delta_degF').convert('delta_degK').isEqual(new Temp(5.56, 'delta_degK')))
      .toBe(true);

    expect(new Temp(10, 'delta_degK').convert('delta_degC').isEqual(new Temp(10, 'delta_degC')))
      .toBe(true);
    expect(new Temp(10, 'delta_degK').convert('delta_degF').isEqual(new Temp(18, 'delta_degF')))
      .toBe(true);
    expect(new Temp(10, 'delta_degK').convert('delta_degK').isEqual(new Temp(10, 'delta_degK')))
      .toBe(true);
  });
});
