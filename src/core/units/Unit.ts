export default abstract class Unit {
  value: number;
  unit: string = '';

  constructor(value: number) {
    this.value = value;
  }

  toJSON() {
    return {
      value: this.value,
      unit: this.unit,
    };
  }
}
