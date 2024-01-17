import { Link, Quantity, TempUnit } from 'brewblox-proto/ts';
import { format as formatDate } from 'date-fns/format';
import isFinite from 'lodash/isFinite';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import round from 'lodash/round';
import parseDuration from 'parse-duration';
import { date } from 'quasar';
import { userUISettings, userUnits } from '@/user-settings';
import {
  isCompatibleQty,
  isDurationString,
  isDurationUnit,
  isLink,
  isQuantity,
  libUnit,
  toLibQty,
} from './identity';

type DateCompatible = Date | number | string;

type QuantityCompatible = Quantity | number | string | null;

type DurationCompatible = Quantity | number | string;

type TempFunc = (valueDegC: number | null) => Quantity;

/**
 * Converts generic value to string.
 *
 * Null and undefined values are replaced with the nullLabel param.
 *
 * @param value
 * @param nullLabel
 */
export function nonNullString(value: unknown, nullLabel = ''): string {
  return `${value ?? nullLabel}`;
}

/**
 * Tries to convert given value to a date.
 * Supports UTC seconds, milliseconds,
 * strings, and pre-existing dates.
 *
 * @param value potential date/time value
 */
export function parseDate(value: Maybe<DateCompatible>): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return date.clone(value);
  }

  if (typeof value === 'number') {
    if (value < 10e10) {
      // This is an educated guess
      // 10e10 falls in 1973 if the timestamp is in milliseconds,
      // and in 5138 if the timestamp is in seconds
      value *= 1000;
    }
  }

  return date.isValid(value) ? new Date(value) : null;
}

export function compareDate(
  lhs: Maybe<DateCompatible>,
  rhs: Maybe<DateCompatible>,
): number {
  const lhsV = parseDate(lhs) ?? new Date(0);
  const rhsV = parseDate(rhs) ?? new Date(0);
  return lhsV.getTime() - rhsV.getTime();
}

/**
 * Converts date-compatible value to date/time string.
 *
 * "date-compatible" is defined as "valid argument for `new Date()`"
 *
 * @param value
 * @param nullLabel returned if value was null or undefined.
 * @returns
 */
export function dateString(
  value: Maybe<DateCompatible>,
  nullLabel = '<not set>',
): string {
  const dv = parseDate(value);
  const { dateFormatString, timeFormatString } = userUISettings.value;
  const fmt = `${dateFormatString} ${timeFormatString}`;
  return dv == null ? nullLabel : formatDate(dv, fmt);
}

/**
 * Converts date-compatible value to date/time or time string,
 * depending on how recent the date is.
 *
 * The date is omitted for values within 24h of `new Date()`.
 *
 * "date-compatible" is defined as "valid argument for `new Date()`"
 *
 * @param value
 * @param nullLabel returned if value was null or undefined.
 * @returns
 */
export function shortDateString(
  value: Maybe<DateCompatible>,
  nullLabel = '<not set>',
): string {
  const dv = parseDate(value);
  if (dv == null) {
    return nullLabel;
  }
  const { dateFormatString, timeFormatString } = userUISettings.value;
  const fmt =
    Math.abs(date.getDateDiff(new Date(), dv, 'hours')) < 24
      ? timeFormatString
      : `${dateFormatString} ${timeFormatString}`;
  return formatDate(dv, fmt);
}

/**
 * Converts date-compatible value to ISO-8601 formatted string.
 * Additional checks are performed to see if the date is valid.
 *
 * "date-compatible" is defined as "valid argument for `new Date()`"
 *
 * @param value
 * @returns ISO-8601 string ('2021-06-11T15:21:14.564Z')
 * or undefined if `value` was null or invalid.
 */
export function isoDateString(
  value: Maybe<DateCompatible>,
): string | undefined {
  const dv = parseDate(value);
  return dv == null ? undefined : dv.toISOString();
}

/**
 * Rounds number to given digits.
 * Returns null if input is not a number.
 *
 * @param value
 * @param digits
 * @returns number if input was number, else null
 */
export function roundedNumber(value: number, digits?: number): number;
export function roundedNumber(
  value: Maybe<number>,
  digits?: number,
): number | null;
export function roundedNumber(value: Maybe<number>, digits = 2): number | null {
  return isNumber(value) ? round(value, digits) : null;
}

/**
 * Rounds number to given digits, and converts it to string.
 * Returns placeholder string '--.--' / '---' if input is not a number.
 *
 * @param value
 * @param digits
 * @returns
 */
export function fixedNumber(value: Maybe<number>, digits = 2): string {
  return isNumber(value) ? value.toFixed(digits) : digits > 0 ? '--.--' : '---';
}

/**
 * Rounds number to given digits, and converts it to string with given precision.
 * Returns placeholder string '-' * precision if input is a not a number.
 *
 * ```ts
 * preciseNumber(99.13863, 3) // => '99.1'
 * preciseNumber(100.232452, 3) // => '100'
 * preciseNumber(1.1, 3) // => '1.10'
 * preciseNumber(0.006, 3) // => '0.01'
 * ```
 *
 * @param value
 * @param characters
 * @returns
 */
export function preciseNumber(
  value: Maybe<number>,
  characters = 3,
): string | number {
  if (!isNumber(value)) {
    return '-'.repeat(characters);
  }
  const strV = value.toFixed(0);
  const fractionDigits = Math.max(characters - strV.length, 0);
  return value.toFixed(fractionDigits);
}

/**
 * Clamp any given number to degrees rotation.
 *
 * @param value Unbounded value
 * @returns 0-360 value that matches the rotation of `value`.
 */
export function clampRotation(value: number): number {
  return (value + 360) % 360;
}

/**
 * Formats Quantity unit as prettified string.
 * This is done on a best-effort basis to provide best result for common units,
 * while leaving invalid or unfamiliar units unchanged.
 *
 * @param value
 * @returns
 */
export function prettyUnit(value: Maybe<Quantity | string>): string {
  const unit = isQuantity(value) ? value.unit : value;
  if (!unit) {
    return '';
  }
  return unit
    .replace(/delta_/g, '')
    .replace(
      /\b(deg)?(Celsius|Fahrenheit|Kelvin)/gi,
      (full, deg, unit: string) => `deg${unit.charAt(0).toUpperCase()}`,
    )
    .replace(/\bdeg(\b|[A-Z])/g, '°$1') // deg, degC, degX, degSomething
    .replace(/(milliseconds?|millis)/gi, 'ms')
    .replace(/(seconds?|sec|minutes?|min|hours?|days?)/gi, (v) =>
      v.charAt(0).toLowerCase(),
    )
    .replace(/1? ?\/ ?/gi, '/') // 'degC / hour' | '1 / degC'
    .replace(/ ?\* ?/gi, '·'); // 'degC * hour'
}

/**
 * Formats Quantity object as prettified string.
 * Time quantities will be formatted as duration,
 * and all other values will be formatted as `fixedNumber(q.value, digits)` first.
 *
 * @param q
 * @param digits
 * @returns
 */
export function prettyQty(q: Maybe<Quantity>, digits = 2): string {
  if (!isQuantity(q)) {
    return '---';
  }
  if (isDurationUnit(q.unit)) {
    return durationString(q);
  }
  return `${fixedNumber(q.value, digits)} ${prettyUnit(q.unit)}`;
}

/**
 * Formats Link object as prettified string.
 *
 * @param v
 * @returns
 */
export function prettyLink(v: Maybe<Link>): string {
  return v?.id || '[not set]';
}

/**
 * Provides best-effort prettification for input value.
 * Quantity, Link, Date, and number values have special handling.
 *
 * @param v
 * @returns
 */
export function prettyAny(v: unknown): string {
  if (isQuantity(v)) {
    return prettyQty(v);
  }
  if (isLink(v)) {
    return prettyLink(v);
  }
  if (isNumber(v)) {
    return fixedNumber(v);
  }
  if (v instanceof Date) {
    return shortDateString(v);
  }
  return JSON.stringify(v);
}

const fromArgs = (
  value: number | null,
  unit: string,
  readonly = false,
): Quantity => ({
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
  } else if (isDurationString(value)) {
    return fromArgs(durationMs(value) / 1000, 's');
  } else if ((value === null || isNumber(value)) && isString(unit)) {
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
    return (
      isQuantity(other) &&
      isCompatibleQty(this, other) &&
      (this.value === null) === (other.value === null) &&
      toLibQty(this.round()).eq(toLibQty(bloxQty(other).round()))
    );
  }

  public to(unit: string): JSQuantity {
    if (unit === this.unit) {
      return this.copy();
    }
    const value =
      this.value !== null ? toLibQty(this).to(libUnit(unit)).scalar : null;
    return this.copy(value, unit);
  }

  public round(precision = 2): JSQuantity {
    const value = this.value !== null ? round(this.value, precision) : null;
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
 * https://brewblox.com/dev/decisions/20200723_typed_fields.html
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
  } else if (isFinite(duration)) {
    return Number(duration);
  } else if (isDurationString(duration)) {
    return parseDuration(duration) ?? 0;
  } else {
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
 * @param msIncluded if false, value is rounded down to the nearest second
 * @returns duration formatted as duration string
 */
export function durationString(
  duration: Maybe<DurationCompatible>,
  msIncluded = true,
): string {
  const ms = durationMs(duration);
  if (!ms) {
    return '0s';
  }

  const sign = ms < 0 ? '-' : '';
  const absMs = Math.abs(Number(ms));
  const secondsTotal = absMs / 1000;
  const days = Math.floor(secondsTotal / 86400);
  const hours = Math.floor((secondsTotal - days * 86400) / 3600);
  const minutes = Math.floor((secondsTotal - days * 86400 - hours * 3600) / 60);
  const seconds = Math.floor(
    secondsTotal - days * 86400 - hours * 3600 - minutes * 60,
  );
  const milliseconds = msIncluded && secondsTotal < 10 ? absMs % 1000 : 0;
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
  return sign + strVal;
}

const converted = (
  valueDegC: number | null,
  fmt: (unit: TempUnit) => string,
): Quantity =>
  bloxQty(valueDegC, fmt('degC')).to(fmt(userUnits.value.temperature));

export const tempQty: TempFunc = (v) => converted(v, (u) => u);
export const inverseTempQty: TempFunc = (v) => converted(v, (u) => `1 / ${u}`);
export const deltaTempQty: TempFunc = (v) => converted(v, (u) => `delta_${u}`);
export const deltaTempPerSecondQty: TempFunc = (v) =>
  converted(v, (u) => `delta_${u} / second`);
export const deltaTempPerMinuteQty: TempFunc = (v) =>
  converted(v, (u) => `delta_${u} / minute`);
export const deltaTempPerHourQty: TempFunc = (v) =>
  converted(v, (u) => `delta_${u} / hour`);
export const deltaTempMultSecondQty: TempFunc = (v) =>
  converted(v, (u) => `delta_${u} * second`);
export const deltaTempMultMinuteQty: TempFunc = (v) =>
  converted(v, (u) => `delta_${u} * minute`);
export const deltaTempMultHourQty: TempFunc = (v) =>
  converted(v, (u) => `delta_${u} * hour`);
