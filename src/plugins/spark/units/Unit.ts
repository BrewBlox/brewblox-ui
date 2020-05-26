import round from 'lodash/round';

import { PostFixed } from './PostFixed';

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

export class Unit implements PostFixed {
  private _val: number | null;
  private _unit: string;
  private _notation: string;

  public constructor(value: number | null, unit: string) {
    this._val = value;
    this._unit = unit;
    this._notation = prettify(unit);
  }

  public get value(): number | null {
    return this._val;
  }

  public set value(v: number | null) {
    this._val = v === null ? null : Number(v);
  }

  public get unit(): string {
    return this._unit;
  }

  public set unit(v: string) {
    this._unit = v;
    this._notation = prettify(v);
  }

  public get notation(): string {
    return this._notation;
  }

  public get delta(): boolean {
    return this.unit.startsWith('delta_');
  }

  public get roundedValue(): string {
    return (this.value === null) ? '--.--' : this.value.toFixed(2);
  }

  public get postfix(): string {
    return `[${this.unit}]`;
  }

  public toSerialized(key: string): [string, number | null] {
    return [`${key}${this.postfix}`, this.value];
  }

  public toString(): string {
    return `${this.roundedValue} ${this.notation}`;
  }

  public toJSON(): number | null {
    return this.value;
  }

  public copy(val: number | null = this._val): Unit {
    return new Unit(val, this.unit);
  }

  public isEqual(other: Unit): boolean {
    return other
      && this.notation === other.notation
      && this.delta === other.delta
      && (this.value === null) === (other.value === null)
      && round(this.value ?? 0, 2) === round(other.value ?? 0, 2);
  }
}

export class Time extends Unit {
  public constructor(value: number | null = 0, unit: 'ms' | 's' | 'min' | 'hour' = 's') {
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
  public constructor(value: number | null, unit: 'degC' | 'degF' | 'delta_degC' | 'delta_degF');
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

    // Note that prettify() strips the delta prefix
    // prettify('degC') === prettify('delta_degC')
    const pretty = prettify(unit);
    const prettyC = prettify('degC');
    const prettyF = prettify('degF');
    const prettyK = prettify('degK');

    const offsetF = unit.startsWith('delta_') ? 0 : 32;
    const offsetK = unit.startsWith('delta_') ? 0 : 273.15;

    if (this.notation === prettyC) {
      if (pretty === prettyC) { return new Temp(v, unit); }
      if (pretty === prettyF) { return new Temp((v * 9 / 5) + offsetF, unit); }
      if (pretty === prettyK) { return new Temp(v + offsetK, unit); }
    }
    if (this.notation === prettyF) {
      if (pretty === prettyC) { return new Temp((v - offsetF) * 5 / 9, unit); }
      if (pretty === prettyF) { return new Temp(v, unit); }
      if (pretty === prettyK) { return new Temp((v - offsetF) * 5 / 9 + offsetK, unit); }
    }
    if (this.notation === prettyK) {
      if (pretty === prettyC) { return new Temp(v - offsetK, unit); }
      if (pretty === prettyF) { return new Temp((v - offsetK) * 9 / 5 + offsetF, unit); }
      if (pretty === prettyK) { return new Temp(v, unit); }
    }

    return new Temp(null, unit);
  }
}
