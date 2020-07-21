import isObject from 'lodash/isObject';
import round from 'lodash/round';
import { Enum } from 'typescript-string-enums';

import { SerializedUnit } from '../types';
import { MetaClass } from './MetaClass';

export const prettify = (unitName: string): string =>
  unitName
    .replace(/delta_/g, '')
    .replace(/\b(deg)?(Celsius|Fahrenheit|Kelvin)/gi,
      (full, deg, unit: string) => `deg${unit.charAt(0).toUpperCase()}`)
    .replace(/\bdeg(\b|[A-Z])/g, '°$1') // deg, degC, degX, degSomething
    .replace(/milliseconds?/gi, 'ms')
    .replace(/(seconds?|minutes?|hours?|days?)/gi, v => v.charAt(0).toLowerCase())
    .replace(/1 ?\/ ?/gi, '/') // 1 / degC
    .replace(/ ?\/ ?/gi, '/')  // degC / hour
    .replace(/ ?\* ?/gi, '·');  // degC * hour

export function isSerializedUnit(obj: any): obj is SerializedUnit {
  return isObject(obj) && (obj as SerializedUnit).__metaclass === 'Unit';
}

export class Unit implements MetaClass {
  public readonly metaclass = 'Unit';
  private _val: number | null;
  private _unit: string;
  private _notation: string;

  public constructor(raw: SerializedUnit);
  public constructor(value: number | null, unit: string);
  public constructor(value: SerializedUnit | number | null, unit: string = '') {
    if (isSerializedUnit(value)) {
      this._val = value.value ?? null;
      this._unit = value.unit ?? '';
    }
    else {
      this._val = value ?? null;
      this._unit = unit ?? '';
    }
    this._notation = prettify(this._unit);
  }

  public get value(): number | null {
    return this._val;
  }

  public set value(v: number | null) {
    this._val = v === null ? null : Number(v);
  }

  public get postfix(): string {
    return `[${this.unit}]`;
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

  public toString(): string {
    return `${this.roundedValue} ${this.notation}`;
  }

  public toJSON(): SerializedUnit {
    return {
      __metaclass: 'Unit',
      value: this.value,
      unit: this.unit,
    };
  }

  public copy(value: number | null = this.value): Unit {
    return new Unit({ ...this.toJSON(), value });
  }

  public isEqual(other: Unit): boolean {
    return other
      && this.notation === other.notation
      && this.delta === other.delta
      && (this.value === null) === (other.value === null)
      && round(this.value ?? 0, 2) === round(other.value ?? 0, 2);
  }
}

export const TimeUnitType = Enum(
  'ms',
  'millisecond',
  's',
  'second',
  'min',
  'minute',
  'hour',
);
export type TimeUnitType = Enum<typeof TimeUnitType>;

export class Time extends Unit {
  public constructor(value: number | null = 0, unit: TimeUnitType = 'second') {
    super(value, unit);
  }
}

const prettyC = prettify('degC');
const prettyF = prettify('degF');
const prettyK = prettify('degK');

const isTempUnit = (unit: string): boolean =>
  [prettyC, prettyF, prettyK].includes(prettify(unit));

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
