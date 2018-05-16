import Unit from './Unit';
import { Celsius, Fahrenheit } from './Temperature';

import parseObject from './parseObject';

describe('parseObject', () => {
  it('Should recognise properties structured as units', () => {
    const input = {
      test: 'Do not touch',
      something: {
        value: 1,
      },
      unknownUnit: {
        value: 42,
        unit: 'answers',
      },
      convert: {
        value: 25,
        unit: 'celsius',
      },
    };

    const output = parseObject(input);

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
        convert: {
          value: 25,
          unit: 'celsius',
        },
        evenDeeper: {
          convert: {
            value: 60,
            unit: 'fahrenheit',
          },
        },
      },
    };

    const output = parseObject(input);

    expect(output.data.test).toBe('Do not touch');
    expect(output.data.convert).toBeInstanceOf(Unit);
    expect(output.data.convert).toBeInstanceOf(Celsius);
    expect(output.data.evenDeeper.convert).toBeInstanceOf(Unit);
    expect(output.data.evenDeeper.convert).toBeInstanceOf(Fahrenheit);
  });
});
