export const prettify = (v: string): string =>
  v.replace(/delta_/g, '')
    .replace(/(celsius|degC(elsius)?)/gi, '°C')
    .replace(/(fahrenheit|degF(ahrenheit)?)/gi, '°F')
    .replace(/(kelvin|degK(elvin)?)/gi, '°K')
    .replace(/milliseconds?/gi, 'ms')
    .replace(/seconds?/gi, 's')
    .replace(/minutes?/gi, 'm')
    .replace(/hours?/gi, 'h')
    .replace(/days?/gi, 'd')
    .replace(/1 \/ /gi, '/')
    .replace(/ \/ /gi, '/')
    .replace(/ \* /gi, '·');

export default class Unit {
  private val: number | null;
  public unit: string;
  public notation: string;

  public constructor(value: number | null, unit: string) {
    this.val = value;
    this.unit = unit;
    this.notation = prettify(this.unit);
  }

  public get value(): number | null {
    return this.val;
  }

  public set value(v: number | null) {
    this.val = Number(v);
  }

  public get unitNotation(): string {
    return this.notation;
  }

  public get roundedValue(): string {
    return (this.value === null) ? '--.--' : this.value.toFixed(2);
  }

  public get postfix(): string {
    return `[${this.unit}]`;
  }

  public serializedKeyName(key: string): string {
    return `${key}${this.postfix}`;
  }

  public toString(): string {
    return `${this.roundedValue} ${this.unitNotation}`;
  }

  public toJSON(): number | null {
    return this.value;
  }
}
