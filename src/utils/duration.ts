import isFinite from 'lodash/isFinite';
import isString from 'lodash/isString';
import parseDuration from 'parse-duration';

import { bloxQty, isQuantity, Quantity } from './bloxfield';

type Duration =
  | Quantity
  | number
  | string

// repeated number + time unit
// 'm' for minute is allowed here
const durationExp = /^(\s*\d*\.?\d+\s*(ms|milliseconds?|s|seconds?|m|mins?|minutes?|h|hours?|d|days?)?\s*)*$/i;
const durationUnitExp = /^(ms|milliseconds?|s|seconds?|mins?|minutes?|h|hours?|d|days?)$/i;

export const isDurationString =
  (v: unknown): v is string =>
    isString(v) && durationExp.test(v);

export const isDurationUnit =
  (v: unknown): v is string =>
    isString(v) && durationUnitExp.test(v);

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
export function durationMs(duration: Maybe<Duration>): number {
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
export function durationString(duration: Maybe<Duration>): string {
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
