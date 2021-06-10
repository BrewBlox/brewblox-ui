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

export function dateString(value: Maybe<DateCompatible>, nullLabel = '<not set>'): string {
  if (value == null) {
    return nullLabel;
  }
  return new Date(value).toLocaleString();
}

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

export function roundedNumber(value: number, digits?: number): number;
export function roundedNumber(value: Maybe<number>, digits?: number): number | null;
export function roundedNumber(value: Maybe<number>, digits = 2): number | null {
  return value != null
    ? round(value, digits)
    : null;
}

export function fixedNumber(value: Maybe<number>, digits = 2): string {
  return value != null
    ? Number(value).toFixed(digits)
    : digits > 0 ? '--.--' : '---';
}

export function preciseNumber(value: Maybe<number>, precision = 3, digits = 2): string | number {
  return value != null
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
 * Generates a regular expression that matches the MQTT topic filter.
 * MQTT wildcards + and # are converted to RegEx syntax.
 *
 * @param topicFilter A MQTT topic path that may include wildcards.
 * @returns A regular expression that will test true for topics matching `topicFilter`.
 */
export function mqttTopicExp(topicFilter: string): RegExp {
  return new RegExp(
    topicFilter
      .split('/')
      .map(s => s
        .replace('+', '[a-zA-Z0-9 _.-]*')
        .replace('#', '?($|[a-zA-Z0-9 \/_.-]*)'))
      .join('\\/')
    + '$');
}

export function roundedQty(q: Quantity, digits = 2): Quantity {
  return {
    ...q,
    value: round(q.value ?? 0, digits),
  };
}

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

export function prettyQty(q: Maybe<Quantity>, digits = 2): string {
  if (!isQuantity(q)) {
    return '---';
  }
  if (isDurationUnit(q.unit)) {
    return durationString(q);
  }
  return `${fixedNumber(q.value, digits)} ${prettyUnit(q.unit)}`;
}

export function prettyLink(v: Maybe<Link>): string {
  return v?.id || '[not set]';
}

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
