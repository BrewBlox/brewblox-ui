import Unit from './Unit';

export class Temperature extends Unit {}

export class Celsius extends Temperature {
  type: string = 'celsius';
}

export class Fahrenheit extends Temperature {
  type: string = 'fahrenheit';
}
