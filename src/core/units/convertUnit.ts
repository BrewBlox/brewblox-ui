import Unit from './Unit';
import { Celsius, Fahrenheit } from './Temperature';

const extractUnit = /^([a-zA-Z0-9_.\-[\]]+)\[([a-zA-Z]+)]$/;

export function propertyNameWithoutUnit(name: string): string {
  const matched = name.match(extractUnit);

  return matched ? matched[1] : name;
}

function valueToUnit(value: number, unit: string): Unit {
  switch (unit) {
    // Temperatures
    case 'celsius':
      return new Celsius(value);
    case 'fahrenheit':
      return new Fahrenheit(value);
    default:
      throw new Error(`No suitable unit found for '${unit}'`);
  }
}

export function convertToUnit(key: string, value: any): Unit {
  const matched = key.match(extractUnit);

  if (matched) {
    try {
      return valueToUnit(value, matched[2]);
    } catch (e) {
      return value;
    }
  }

  return value;
}
