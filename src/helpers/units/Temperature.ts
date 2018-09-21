import Unit from './Unit';

export class Temperature extends Unit { }

export class Celsius extends Temperature {
  constructor(value: number) {
    super(value, 'celsius');
  }

  get unitNotation() {
    return '°C';
  }
}

export class Fahrenheit extends Temperature {
  constructor(value: number) {
    super(value, 'fahrenheit');
  }

  get unitNotation() {
    return '°F';
  }
}

export class Kelvin extends Temperature {
  constructor(value: number) {
    super(value, 'kelvin');
  }

  get unitNotation() {
    return '°K';
  }
}
