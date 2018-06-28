import Unit from './Unit';
import { Celsius, Fahrenheit } from './Temperature';

export default function valueToUnit(value: number, unit: string): Unit {
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
