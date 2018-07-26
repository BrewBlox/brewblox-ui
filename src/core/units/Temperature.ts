import Unit from './Unit';

export class Temperature extends Unit {}

export class Celsius extends Temperature {
  unit: string = 'celsius';

  get unitNotation() {
    return '°C';
  }
}

export class Fahrenheit extends Temperature {
  unit: string = 'fahrenheit';

  get unitNotation() {
    return '°F';
  }
}
