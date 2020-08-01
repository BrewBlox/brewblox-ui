import {
  bloxQty,
  isJSLink,
  isJSQuantity,
  isLink,
  isQuantity,
  JSLink,
} from '@/helpers/bloxfield';
import {
  deserialize,
  serialize,
} from '@/plugins/spark/parse-object';

describe('Type checking', () => {
  it('Should recognize Quantity', () => {
    expect(isQuantity(null)).toBe(false);
    expect(isQuantity(10)).toBe(false);
    expect(isQuantity(bloxQty(10, 'degC').toJSON())).toBe(true);
    expect(isQuantity(bloxQty(10, 'degC'))).toBe(true);
  });

  it('Should recognize Quantity', () => {
    expect(isJSQuantity(null)).toBe(false);
    expect(isJSQuantity(10)).toBe(false);
    expect(isJSQuantity(bloxQty(10, 'degC').toJSON())).toBe(false);
    expect(isJSQuantity(bloxQty(10, 'degC'))).toBe(true);
  });
});

describe('deserialize', () => {
  it('Should recognise properties structured as units', () => {
    const input = {
      test: 'Do not touch',
      something: 1,
      'convert[degC]': 25,
      normal: [21, 22, 23],
      'array[degC]': [21, 22, 23],
    };

    const output = deserialize(input);

    expect(output.test).toBe('Do not touch');
    expect(isQuantity(output.something)).toBe(false);
    expect(isQuantity(output.to)).toBe(true);
    expect(isJSQuantity(output.to)).toBe(false);
    expect(output.normal[0]).toBe(21);
  });

  it('Should recognise deep properties structured as units', () => {
    const input = {
      data: {
        test: 'Do not touch',
        'convert[degC]': 25,
        evenDeeper: {
          'convert[degF]': 60,
        },
      },
    };

    const output = deserialize(input);

    expect(output.data.test).toBe('Do not touch');
    expect(isQuantity(output.data.convert)).toBe(true);
    expect(isQuantity(output.data.evenDeeper.convert)).toBe(true);
  });

  it('Should handle undefined and null properties', () => {
    const input = {
      normal: 'Okay',
      undef: undefined,
      nothing: null,
    };

    const output = deserialize(input);

    expect(input).toEqual(output);
  });

  it('Should handle when input is an array', () => {
    const input = [
      {
        'convert[degC]': 25,
      },
      25,
      'do not touch',
      null,
    ];

    const output = deserialize(input);

    expect(output).toBeInstanceOf(Array);
    expect(output[1]).toBe(25);
    expect(output[2]).toBe('do not touch');
  });

  it('Should recognise properties structured as links', () => {
    const input = {
      test: 'Do not touch',
      something: 1,
      'sensor<>': 'some-sensor-id',
    };

    const output = deserialize(input);

    expect(output.test).toBe('Do not touch');
    expect(isLink(output.something)).toBe(false);
    expect(isLink(output.sensor)).toBe(true);
    expect(isJSLink(output.sensor)).toBe(false);
  });
});

describe('serialize', () => {
  it('Converts unit properties for API saving', () => {
    const input = {
      temperature: bloxQty(21, 'degC'),
      leaveThisBe: 666,
      normalArray: [22, 23, 24],
      emptyArray: [],
      deeper: {
        temperatureInUSA: bloxQty(60, 'degF'),
        nullable: null,
      },
    };

    const output = {
      temperature: {
        __bloxtype: 'Quantity',
        value: 21,
        unit: 'degC',
      },
      leaveThisBe: 666,
      normalArray: [22, 23, 24],
      emptyArray: [],
      deeper: {
        temperatureInUSA: {
          __bloxtype: 'Quantity',
          value: 60,
          unit: 'degF',
        },
        nullable: null,
      },
    };

    expect(serialize(input)).toEqual(output);
  });

  it('Handles root arrays correctly', () => {
    const input = [
      20,
      {
        test: bloxQty(23, 'degC'),
      },
    ];

    const output = [
      20,
      {
        test: {
          __bloxtype: 'Quantity',
          value: 23,
          unit: 'degC',
        },
      },
    ];

    expect(serialize(input)).toEqual(output);
  });

  it('Converts link properties for API saving', () => {
    const input = {
      sensor: new JSLink('sensor-1'),
      deeper: {
        sensor: new JSLink('sensor-2'),
      },
    };

    const output = {
      sensor: {
        __bloxtype: 'Link',
        id: 'sensor-1',
        type: null,
        driven: undefined,
      },
      deeper: {
        sensor: {
          __bloxtype: 'Link',
          id: 'sensor-2',
          type: null,
          driven: undefined,
        },
      },
    };

    expect(serialize(input)).toEqual(output);
  });
});
