import Unit from './Unit';
import { Celsius, Fahrenheit } from './Temperature';

import { deserialize, serialize } from './parseObject';

describe('deserialize', () => {
  it('Should recognise properties structured as units', () => {
    const input = {
      test: 'Do not touch',
      something: 1,
      'unknownUnit[answers]': 42,
      'convert[celsius]': 25,
    };

    const output = deserialize(input);

    expect(output.test).toBe('Do not touch');
    expect(output.something).not.toBeInstanceOf(Unit);
    expect(output.unknownUnit).not.toBeInstanceOf(Unit);
    expect(output.convert).toBeInstanceOf(Unit);
    expect(output.convert).toBeInstanceOf(Celsius);
  });

  it('Should recognise deep properties structured as units', () => {
    const input = {
      data: {
        test: 'Do not touch',
        'convert[celsius]': 25,
        evenDeeper: {
          'convert[fahrenheit]': 60,
        },
      },
    };

    const output = deserialize(input);

    expect(output.data.test).toBe('Do not touch');
    expect(output.data.convert).toBeInstanceOf(Unit);
    expect(output.data.convert).toBeInstanceOf(Celsius);
    expect(output.data.evenDeeper.convert).toBeInstanceOf(Unit);
    expect(output.data.evenDeeper.convert).toBeInstanceOf(Fahrenheit);
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
});

describe('serialize', () => {
  it('Converts unit properties for API saving', () => {
    const input = {
      temperature: new Celsius(21),
      leaveThisBe: 666,
      deeper: {
        temperatureInUSA: new Fahrenheit(60),
      },
    };

    const output = {
      'temperature[celsius]': 21,
      leaveThisBe: 666,
      deeper: {
        'temperatureInUSA[fahrenheit]': 60,
      },
    };

    expect(serialize(input)).toEqual(output);
  });
});
