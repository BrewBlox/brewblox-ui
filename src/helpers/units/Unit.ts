import PostFixed from './PostFixed';

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
    .replace(/1 ?\/ ?/gi, '/')
    .replace(/ ?\/ ?/gi, '/')
    .replace(/ ?\* ?/gi, '·');

export default class Unit extends PostFixed {
  private val: number | null;
  public unit: string;
  public notation: string;

  public constructor(value: number | null, unit: string) {
    super();
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

  public serialized(key: string): [string, number | null] {
    return [`${key}${this.postfix}`, this.value];
  }

  public toString(): string {
    return `${this.roundedValue} ${this.unitNotation}`;
  }

  public toJSON(): number | null {
    return this.value;
  }

  public copy(val: number | null = this.val): Unit {
    return new Unit(val, this.unit);
  }

  public isEqual(other: Unit): boolean {
    return other
      && this.notation === other.notation
      && this.roundedValue === other.roundedValue;
  }
}

export class Time extends Unit {
  public constructor(value: number | null = 0, unit: 'ms' | 's' | 'min' | 'h' = 's') {
    super(value, unit);
  }
}

const isTempUnit = (unit: string): boolean => {
  const pretty = prettify(unit);
  return pretty === prettify('degC')
    || pretty === prettify('degF')
    || pretty === prettify('degK');
};

export class Temp extends Unit {
  public constructor(value: Unit);
  public constructor(value: number | null);
  public constructor(value: number | null);
  public constructor(value: number | null, unit: 'degC' | 'degF');
  public constructor(value: number | null, unit: string);

  public constructor(value: number | Unit | null, unit: string = 'degC') {
    if (value instanceof Unit) {
      if (!isTempUnit(value.unit)) {
        throw new Error(`${value} is not a temperature unit`);
      }
      super(value.value, value.unit);
    }
    else {
      if (!isTempUnit(unit)) {
        throw new Error(`${unit} is not a temperature unit`);
      }
      super(value, unit);
    }
  }

  public convert(unit: string): Temp {
    if (this.value === null) {
      return new Temp(null, unit);
    }

    const v = this.value;
    const pretty = prettify(unit);
    const prettyC = prettify('degC');
    const prettyF = prettify('degF');
    const prettyK = prettify('degK');

    if (this.notation === prettyC) {
      if (pretty === prettyC) { return new Temp(this); }
      if (pretty === prettyF) { return new Temp((v * 9 / 5) + 32, pretty); }
      if (pretty === prettyK) { return new Temp(v + 273.15, pretty); }
    }
    if (this.notation === prettyF) {
      if (pretty === prettyC) { return new Temp((v - 32) * 5 / 9, pretty); }
      if (pretty === prettyF) { return new Temp(this); }
      if (pretty === prettyK) { return new Temp((v - 32) * 5 / 9 + 273.15, pretty); }
    }
    if (this.notation === prettyK) {
      if (pretty === prettyC) { return new Temp(v - 273.15, pretty); }
      if (pretty === prettyF) { return new Temp((v - 273.15) * 9 / 5 + 32, pretty); }
      if (pretty === prettyK) { return new Temp(this); }
    }

    return new Temp(null, unit);
  }
}
