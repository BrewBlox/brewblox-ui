import Unit from './Unit';
import { Celsius, Fahrenheit, Kelvin } from './Temperature';

export default function valueToUnit(value: number, unit: string): Unit {
  switch (unit.toLowerCase()) {
    // Temperatures
    case 'celsius':
      return new Celsius(value);
    case 'fahrenheit':
      return new Fahrenheit(value);
    case 'kelvin':
      return new Kelvin(value);
    default:
      throw new Error(`No suitable unit found for '${unit}'`);
  }
}
