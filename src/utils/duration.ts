import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import parseDuration from 'parse-duration';

import { bloxQty, isQuantity, Quantity } from './bloxfield';

// repeated number + time unit
// 'm' for minute is allowed here
const durationExp = /^(\s*\d*\.?\d+\s*(ms|milliseconds?|s|seconds?|m|mins?|minutes?|h|hours?|d|days?)\s*)*$/i;
const durationUnitExp = /^(ms|milliseconds?|s|seconds?|mins?|minutes?|h|hours?|d|days?)$/i;

export const isDurationString =
  (v: unknown): v is string =>
    isString(v) && durationExp.test(v);

export const isDurationUnit =
  (v: unknown): v is string =>
    isString(v) && durationUnitExp.test(v);

const defaultNullValue = Symbol();

export const durationMs =
  (duration: Quantity | number | string | null | undefined, nullValue: any = defaultNullValue): number => {
    if (!duration) {
      return 0;
    }
    else if (isQuantity(duration)) {
      return isDurationUnit(duration.unit)
        ? bloxQty(duration).to('ms').value as number
        : 0;
    }
    else if (isNumber(duration)) {
      return duration;
    }
    else if (isDurationString(duration)) {
      return parseDuration(duration);
    }
    else if (nullValue !== defaultNullValue) {
      return nullValue;
    }
    else {
      return duration;
    }
  };

export const durationString =
  (duration: Quantity | number | string | null | undefined, nullValue: any = defaultNullValue): string => {
    const ms = durationMs(duration, nullValue);
    if (ms === nullValue) {
      return nullValue;
    }
    const secondsTotal = Number(ms) / 1000;
    const days = Math.floor(secondsTotal / 86400);
    const hours = Math.floor((secondsTotal - (days * 86400)) / 3600);
    const minutes =
      Math.floor((secondsTotal - (days * 86400) - (hours * 3600)) / 60);
    const seconds = Math.floor(
      secondsTotal - (days * 86400) - (hours * 3600) - (minutes * 60));
    const milliseconds = (secondsTotal < 10) ? Math.floor((secondsTotal - Math.floor(secondsTotal)) * 1000) : 0;
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
    return strVal || '0s';
  };
