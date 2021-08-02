import isFinite from 'lodash/isFinite';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import round from 'lodash/round';
import { date } from 'quasar';

import { Link, Quantity } from '@/shared-types';

import { isDurationUnit, isLink, isQuantity } from './identity';
import { durationString } from './quantity';

type DateCompatible =
  | Date
  | number
  | string

/**
 * Converts date-compatible value to date/time string.
 *
 * "date-compatible" is defined as "valid argument for `new Date()`"
 *
 * @param value
 * @param nullLabel returned if value was null or undefined.
 * @returns
 */
export function dateString(value: Maybe<DateCompatible>, nullLabel = '<not set>'): string {
  if (value == null) {
    return nullLabel;
  }
  return new Date(value).toLocaleString();
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
export function shortDateString(value: Maybe<DateCompatible>, nullLabel = '<not set>'): string {
  if (value == null) {
    return nullLabel;
  }
  const date = new Date(value);
  if (Math.abs(new Date().getTime() - date.getTime()) < (24 * 3600 * 1000)) {
    return date.toLocaleTimeString();
  }
  return date.toLocaleDateString();
}

/**
 * Converts date-compatible value to ISO-8601 formatted string.
 * Additional checks are performed to see if the date is valid.
 *
 * "date-compatible" is defined as "valid argument for `new Date()`"
 *
 * @param value
 * @returns ISO-8601 string ('2021-06-11T15:21:14.564Z') or undefined if `value` was null or invalid.
 */
export function isoDateString(value: Maybe<DateCompatible>): string | undefined {
  if (value instanceof Date) {
    return value.toISOString();
  }
  const numV = Number(value);
  if (isFinite(numV) && date.isValid(numV)) {
    return new Date(numV).toISOString();
  }
  if (isString(value) && date.isValid(value)) {
    return new Date(value).toISOString();
  }
  return undefined;
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
export function roundedNumber(value: Maybe<number>, digits?: number): number | null;
export function roundedNumber(value: Maybe<number>, digits = 2): number | null {
  return isNumber(value)
    ? round(value, digits)
    : null;
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
  return isNumber(value)
    ? value.toFixed(digits)
    : digits > 0 ? '--.--' : '---';
}

/**
 * Rounds number to given digits, and converts it to string with given precision.
 * Returns placeholder string '-' * precision if input is a not a number.
 *
 * ```ts
 * preciseNumber(99.13863, 3, 2) // => '99.1'
 * preciseNumber(100.232452, 3, 2) // => '100'
 * preciseNumber(1.1, 3, 2) // => '1.10'
 * ```
 *
 * @param value
 * @param precision
 * @param digits
 * @returns
 */
export function preciseNumber(value: Maybe<number>, precision = 3, digits = 2): string | number {
  return isNumber(value)
    ? round(value, digits).toPrecision(precision)
    : '-'.repeat(precision);
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
    .replace(/\b(deg)?(Celsius|Fahrenheit|Kelvin)/gi,
      (full, deg, unit: string) => `deg${unit.charAt(0).toUpperCase()}`)
    .replace(/\bdeg(\b|[A-Z])/g, '°$1') // deg, degC, degX, degSomething
    .replace(/(milliseconds?|millis)/gi, 'ms')
    .replace(/(seconds?|sec|minutes?|min|hours?|days?)/gi, v => v.charAt(0).toLowerCase())
    .replace(/1? ?\/ ?/gi, '/')  // 'degC / hour' | '1 / degC'
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
