export default abstract class Unit {
  value: number;
  unit: string = '';

  constructor(value: number) {
    this.value = value;
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
