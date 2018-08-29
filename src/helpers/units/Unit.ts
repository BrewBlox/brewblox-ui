export default abstract class Unit {
  value: number;
  unit: string = '';

  constructor(value: number) {
    this.value = value;
  }

  get unitNotation(): string {
    return '';
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
