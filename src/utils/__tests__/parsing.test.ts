import { describe, expect, it } from 'vitest';
import { isLink, isQuantity } from '../identity';
import { JSLink } from '../link';
import { deserialize, serialize } from '../parsing';
import { bloxQty } from '../quantity';

describe('deserialize', () => {
  it('Should recognise properties structured as units', () => {
    const input: any = {
      test: 'Do not touch',
      something: 1,
      'postfixValue[degC]': 25,
      normalArray: [21, 22, 23, 24],
      'otherV[degC]': 21,
    };

    const output = deserialize(input);

    expect(output.test).toBe('Do not touch');
    expect(isQuantity(output.something)).toBe(false);
    expect(isQuantity(output.postfixValue)).toBe(true);
    expect(output.normalArray[0]).toBe(21);
    expect(deserialize(output)).toEqual(output);
  });

  it('Should recognise deep properties structured as units', () => {
    const input: any = {
      data: {
        test: 'Do not touch',
        'postfixValue[degC]': 25,
        evenDeeper: {
          'postfixValue[degF]': 60,
        },
      },
    };

    const output = deserialize(input);

    expect(output.data.test).toBe('Do not touch');
    expect(isQuantity(output.data.postfixValue)).toBe(true);
    expect(isQuantity(output.data.evenDeeper.postfixValue)).toBe(true);
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
    const input: any = {
      test: 'Do not touch',
      something: 1,
      'sensor<>': 'some-sensor-id',
    };

    const output = deserialize(input);

    expect(output.test).toBe('Do not touch');
    expect(isLink(output.something)).toBe(false);
    expect(isLink(output.sensor)).toBe(true);
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
    expect(serialize(output)).toEqual(output);
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
      },
      deeper: {
        sensor: {
          __bloxtype: 'Link',
          id: 'sensor-2',
          type: null,
        },
      },
    };

    expect(serialize(input)).toEqual(output);
  });
});
