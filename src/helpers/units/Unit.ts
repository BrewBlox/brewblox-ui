const prettify = (v: string) => v
  .replace(/delta_/g, '')
  .replace(/(celsius|degC(elsius)?)/gi, '°C')
  .replace(/(fahrenheit|degF(ahrenheit)?)/gi, '°F')
  .replace(/(kelvin|degK(elvin)?)/gi, '°K')
  .replace(/milliseconds?/gi, 'ms')
  .replace(/seconds?/gi, 's')
  .replace(/minutes?/gi, 'm')
  .replace(/hours?/gi, 'h')
  .replace(/1 \/ /gi, '/')
  .replace(/ \/ /gi, '/')
  .replace(/ \* /gi, '·');

export default class Unit {
  value: number | null;
  unit: string;
  notation: string;

  constructor(value: number | null, unit: string) {
    this.value = value;
    this.unit = unit;
    this.notation = prettify(this.unit);
  }

  get unitNotation(): string {
    return this.notation;
  }

  get roundedValue(): string {
    return (this.value === null)
      ? '--.--'
      : this.value.toFixed(2);
  }

  serializedKeyName(key: string): string {
    return `${key}[${this.unit}]`;
  }

  toString(): string {
    return `${this.roundedValue} ${this.unitNotation}`;
  }

  toJSON(): number | null {
    return this.value;
  }
}
