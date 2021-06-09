import isFinite from 'lodash/isFinite';
import isString from 'lodash/isString';
import round from 'lodash/round';
import { date } from 'quasar';

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

export function roundNumber(value: number, digits?: number): number;
export function roundNumber(value: Maybe<number>, digits?: number): number | null;
export function roundNumber(value: Maybe<number>, digits = 2): number | null {
  return value != null
    ? round(value, digits)
    : null;
}

export function fixedNumber(value: Maybe<number>, digits = 2): string {
  return value != null
    ? Number(value).toFixed(digits)
    : digits > 0 ? `-.${'-'.repeat(digits)}` : '--';
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
