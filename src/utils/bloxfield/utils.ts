import isNumber from 'lodash/isNumber';
import round from 'lodash/round';

import { durationString, isDurationUnit } from '../duration';
import { BloxField, JSBloxField, Link, Quantity } from './types';

export const isBloxField =
  (obj: unknown): obj is BloxField =>
    obj instanceof Object
    && '__bloxtype' in obj;

export const isJSBloxField =
  (obj: unknown): obj is JSBloxField =>
    isBloxField(obj)
    && 'toJSON' in obj;

export const isQuantity =
  (obj: unknown): obj is Quantity =>
    isBloxField(obj)
    && obj.__bloxtype === 'Quantity';

export const isLink =
  (obj: unknown): obj is Link =>
    isBloxField(obj)
    && obj.__bloxtype === 'Link';

export const prettyUnit = (value: Nullable<Quantity | string>): string => {
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
    .replace(/1 ?\/ ?/gi, '/') // 1 / degC
    .replace(/ ?\/ ?/gi, '/')  // degC / hour
    .replace(/ ?\* ?/gi, '·');  // degC * hour
};

export const prettyQty =
  (q: Nullable<Quantity>, precision = 2): string => {
    if (!isQuantity(q)) {
      return '---';
    }
    if (isDurationUnit(q.unit)) {
      return durationString(q);
    }
    const valueStr = isNumber(q.value)
      ? q.value.toFixed(precision)
      : '--.--';
    return `${valueStr} ${prettyUnit(q.unit)}`;
  };

export const roundedQty =
  (q: Quantity, precision = 2): Quantity => ({
    ...q,
    value: round(q.value ?? 0, precision),
  });

export const prettyLink = (v: Nullable<Link>): string =>
  v?.id || '[not set]';

export const prettyAny = (v: unknown): string => {
  if (isQuantity(v)) {
    return prettyQty(v);
  }
  if (isLink(v)) {
    return prettyLink(v);
  }
  return JSON.stringify(v);
};
