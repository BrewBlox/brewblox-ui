export default abstract class Unit {
  value: number;
  unit: string = '';

  constructor(value: number) {
    this.value = value;
  }

  get roundedValue() {
    return this.value.toFixed(2).replace(/\.?0+$/, '');
  }

  toString(): string {
    return this.value.toString();
  }

  toJSON() {
    return {
      value: this.value,
      unit: this.unit,
    };
  }
}
