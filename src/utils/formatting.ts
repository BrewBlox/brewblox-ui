import isFinite from 'lodash/isFinite';
import isString from 'lodash/isString';
import round from 'lodash/round';
import { date } from 'quasar';

export function dateString(value: number | string | Date | null, nullLabel = '<not set>'): string {
  if (value === null || value === undefined) {
    return nullLabel;
  }
  return new Date(value).toLocaleString();
}

export function shortDateString(value: number | string | Date | null | undefined, nullLabel = '<not set>'): string {
  if (value === null || value === undefined) {
    return nullLabel;
  }
  const date = new Date(value);
  if (Math.abs(new Date().getTime() - date.getTime()) < (24 * 3600 * 1000)) {
    return date.toLocaleTimeString();
  }
  return date.toLocaleDateString();
}

export function isoDateString(val: Maybe<Date | number | string>): string | undefined {
  if (val instanceof Date) {
    return val.toISOString();
  }
  const numV = Number(val);
  if (isFinite(numV) && date.isValid(numV)) {
    return new Date(numV).toISOString();
  }
  if (isString(val) && date.isValid(val)) {
    return new Date(val).toISOString();
  }
  return undefined;
}

export function fixedNumber(value: Maybe<number>, digits = 2): string {
  return value != null
    ? Number(value).toFixed(digits)
    : digits > 0 ? `--.${'-'.repeat(digits)}` : '--';
}

export function preciseNumber(value: Maybe<number>, precision = 3): string | number {
  return value != null
    ? Number(value).toPrecision(precision)
    : '-'.repeat(precision);
}

export function roundNumber(value: number, digits?: number): number;
export function roundNumber(value: Maybe<number>, digits?: number): number | null;
export function roundNumber(value: Maybe<number>, digits = 2): number | null {
  return value != null
    ? round(value, digits)
    : null;
}

export function clampRotation(value: number): number {
  return (value + 360) % 360;
}

export const mqttTopicExp =
  (topicFilter: string): RegExp =>
    new RegExp(
      topicFilter
        .split('/')
        .map(s => s
          .replace('+', '[a-zA-Z0-9 _.-]*')
          .replace('#', '?($|[a-zA-Z0-9 \/_.-]*)'))
        .join('\\/')
      + '$');
