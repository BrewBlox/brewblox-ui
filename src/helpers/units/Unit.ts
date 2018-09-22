export default class Unit {
  value: number;
  unit: string;

  constructor(value: number, unit: string) {
    this.value = value;
    this.unit = unit;
  }

  get unitNotation(): string {
    return this.unit;
  }

  get roundedValue(): string {
    return this.value.toFixed(2);
  }

  toString(): string {
    return `${this.roundedValue} ${this.unitNotation}`;
  }

  toJSON(): number {
    return this.value;
  }
}
