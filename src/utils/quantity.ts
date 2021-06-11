import isFinite from 'lodash/isFinite';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import round from 'lodash/round';
import parseDuration from 'parse-duration';

import { Quantity, TempUnit } from '@/shared-types';
import { systemStore } from '@/store/system';

import { prettyQty } from './formatting';
import { isCompatibleQty, isDurationString, isDurationUnit, isQuantity, libUnit, toLibQty } from './identity';

type QuantityCompatible =
  | Quantity
  | number
  | string
  | null

type DurationCompatible =
  | Quantity
  | number
  | string

type TempFunc = (valueDegC: number | null) => Quantity;

const fromArgs =
  (value: number | null, unit: string, readonly = false): Quantity => ({
    __bloxtype: 'Quantity',
    value,
    unit,
    readonly: readonly || undefined,
  });

export function rawQty(value: number | null, unit: string): Quantity;
export function rawQty(value: Quantity | string): Quantity;
export function rawQty(value: QuantityCompatible, unit?: string): Quantity {
  if (isQuantity(value)) {
    return fromArgs(value.value, value.unit, value.readonly);
  }
  else if (isDurationString(value)) {
    return fromArgs(durationMs(value) / 1000, 's');
  }
  else if ((value === null || isNumber(value)) && isString(unit)) {
    return fromArgs(value, unit);
  }
  throw new Error(`Invalid Quantity args: ${value}, ${unit}`);
}

export class JSQuantity implements Quantity {
  public readonly __bloxtype = 'Quantity';
  public value: number | null;
  public unit: string;
  public readonly: boolean;

  public constructor(value: number | null, unit: string);
  public constructor(value: Quantity | string);
  public constructor(value: QuantityCompatible, unit?: string) {
    const obj = rawQty(value as any, unit as any);
    this.value = obj.value;
    this.unit = obj.unit;
    this.readonly = obj.readonly ?? false;
  }

  public get postfix(): string {
    return `[${this.unit}]`;
  }

  public toString(): string {
    return prettyQty(this);
  }

  public toJSON(): Quantity {
    return {
      __bloxtype: 'Quantity',
      value: this.value,
      unit: this.unit,
      readonly: this.readonly || undefined,
    };
  }

  public rawCopy(value?: number | null, unit?: string): Quantity {
    return {
      ...this.toJSON(),
      value: value !== undefined ? value : this.value, // null is valid
      unit: unit ?? this.unit,
    };
  }

  public copy(value?: number | null, unit?: string): JSQuantity {
    return new JSQuantity(this.rawCopy(value, unit));
  }

  public eq(other: Quantity): boolean {
    return isQuantity(other)
      && isCompatibleQty(this, other)
      && (this.value === null) === (other.value === null)
      && toLibQty(this.round()).eq(toLibQty(bloxQty(other).round()));
  }

  public to(unit: string): JSQuantity {
    if (unit === this.unit) {
      return this.copy();
    }
    const value = this.value !== null
      ? toLibQty(this).to(libUnit(unit)).scalar
      : null;
    return this.copy(value, unit);
  }

  public round(precision = 2): JSQuantity {
    const value = this.value !== null
      ? round(this.value, precision)
      : null;
    return this.copy(value);
  }
}

/**
 * Create a Quantity object.
 *
 * Quantities express a value with a unit,
 * and are commonly used in block data.
 *
 * The following input types are supported:
 * - Raw arguments: `bloxQty(10, 'degC')`
 * - Duration-formatted string: `bloxQty('10s')`
 * - Another Quantity object: `bloxQty(bloxQty(10, 'degC'))`
 *
 * https://brewblox.netlify.app/dev/decisions/20200723_typed_fields.html
 *
 */
export function bloxQty(value: number | null, unit: string): JSQuantity;
export function bloxQty(value: Quantity | string): JSQuantity;
export function bloxQty(value: QuantityCompatible, unit?: string): JSQuantity {
  // Let the constructor handle invalid combinations of args
  return new JSQuantity(value as any, unit as any);
}

/**
 * Get millisecond value of a variety of duration-compatible formats.
 * This includes time quantities, numbers, and duration-formatted strings.
 *
 * Numbers and unitless string numbers are assumed to be in milliseconds.
 *
 * 0 is returned for invalid or null inputs.
 *
 * @param duration value that can be interpreted as a duration
 * @returns duration measured in milliseconds
 */
export function durationMs(duration: Maybe<DurationCompatible>): number {
  if (isQuantity(duration)) {
    return isDurationUnit(duration.unit)
      ? bloxQty(duration).to('ms').value ?? 0
      : 0;
  }
  else if (isFinite(duration)) {
    return Number(duration);
  }
  else if (isDurationString(duration)) {
    return parseDuration(duration);
  }
  else {
    return 0;
  }
}

/**
 * Format duration as string (eg. '1d 6h 10s').
 * Input is parsed before formatting, and will optimize duration strings.
 * For example, '70s' will be reformatted as '1m 10s'.
 *
 * '0s' is returned for invalid or null inputs.
 *
 * Millisecond values are only included if the total value is < 10s.
 *
 * @param duration value that can be interpreted as a duration
 * @returns duration formatted as duration string
 */
export function durationString(duration: Maybe<DurationCompatible>): string {
  const ms = durationMs(duration);
  if (!ms) {
    return '0s';
  }

  const secondsTotal = Number(ms) / 1000;
  const days = Math.floor(secondsTotal / 86400);
  const hours = Math.floor((secondsTotal - (days * 86400)) / 3600);
  const minutes =
    Math.floor((secondsTotal - (days * 86400) - (hours * 3600)) / 60);
  const seconds = Math.floor(
    secondsTotal - (days * 86400) - (hours * 3600) - (minutes * 60));
  const milliseconds = (secondsTotal < 10) ? ms % 1000 : 0;
  const values = [
    [days, 'd'],
    [hours, 'h'],
    [minutes, 'm'],
    [seconds, 's'],
    [milliseconds, 'ms'],
  ];

  const strVal = values
    .filter(([val]) => !!val)
    .map(([val, unit]) => `${val}${unit}`)
    .join(' ');
  return strVal;
}

const converted = (valueDegC: number | null, fmt: (unit: TempUnit) => string): Quantity =>
  bloxQty(valueDegC, fmt('degC')).to(fmt(systemStore.units.temperature));

export const tempQty: TempFunc = v => converted(v, u => u);
export const inverseTempQty: TempFunc = v => converted(v, u => `1 / ${u}`);
export const deltaTempQty: TempFunc = v => converted(v, u => `delta_${u}`);
export const deltaTempPerSecondQty: TempFunc = v => converted(v, u => `delta_${u} / second`);
export const deltaTempPerMinuteQty: TempFunc = v => converted(v, u => `delta_${u} / minute`);
export const deltaTempPerHourQty: TempFunc = v => converted(v, u => `delta_${u} / hour`);
export const deltaTempMultSecondQty: TempFunc = v => converted(v, u => `delta_${u} * second`);
export const deltaTempMultMinuteQty: TempFunc = v => converted(v, u => `delta_${u} * minute`);
export const deltaTempMultHourQty: TempFunc = v => converted(v, u => `delta_${u} * hour`);
