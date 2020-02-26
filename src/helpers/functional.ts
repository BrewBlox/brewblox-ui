import fromEntries from 'fromentries';
import isEqual from 'lodash/isEqual';
import isString from 'lodash/isString';
import parseDuration from 'parse-duration';
import { colors } from 'quasar';

import { Unit } from './units';

type SortFunc = (a: any, b: any) => number

export const uniqueFilter =
  (val: any, idx: number, coll: any[]): boolean => coll.indexOf(val) === idx;

export const objectSorter =
  (key: string): SortFunc => ((a: any, b: any) => a[key] - b[key]);

export const objectStringSorter =
  (key: string): SortFunc =>
    (a: any, b: any) => {
      const left = a[key].toLowerCase();
      const right = b[key].toLowerCase();
      return left.localeCompare(right);
    };

export const durationMs =
  (duration: number | string): number =>
    isString(duration)
      ? parseDuration(duration)
      : duration;

export const durationString =
  (duration: number | string): string => {
    const ms = durationMs(duration);
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

export const unitDurationString =
  (value: Unit | null): string => {
    if (value === null || value === undefined || value.value === null) {
      return '---';
    }
    return durationString(`${value.value}${value.notation}`);
  };

export const spaceCased =
  (input: string): string =>
    input.replace(/[_-]/, ' ')
      .replace(/([^^])([A-Z][^A-Z])/g, (_, v1, v2) => `${v1} ${v2.toLowerCase()}`)
      .replace(/([^^])([A-Z]+)/g, (_, v1, v2) => `${v1} ${v2}`);

export const snakeCased =
  (input: string): string =>
    input.replace(/[ -]/, '_')
      .replace(/\.?([A-Z]+)/g, (_, v: string) => `_${v}`)
      .toLowerCase();

export const kebabCased =
  (input: string): string =>
    input.replace(/[ _]/, '-')
      .replace(/\.?([A-Z]+)/g, (_, v: string) => `-${v}`)
      .toLowerCase();

export const camelCased =
  (input: string): string =>
    input.replace(/[ -_](.)/, (_, v1) => v1.toUpperCase());

export const sentenceCased =
  (input: string): string => {
    const spaced = spaceCased(input).trimLeft();
    return spaced.substr(0, 1).toUpperCase() + spaced.substr(1, spaced.length);
  };

export const hexToBase64 =
  (hex: string): string => Buffer.from(hex, 'hex').toString('base64');

export const base64ToHex =
  (b64: string): string => Buffer.from(b64, 'base64').toString('hex');

export const clamp =
  (num: number, min: number, max: number): number => Math.max(min, Math.min(num, max));

export const clampRotation =
  (val: number): number => (val + 360) % 360;

export const dateString =
  (value: number | string | Date | null, nullLabel = '<not set>'): string => {
    if (value === null || value === undefined) {
      return nullLabel;
    }
    return new Date(value).toLocaleString();
  };

export const shortDateString =
  (value: number | string | Date | null, nullLabel = '<not set>'): string => {
    if (value === null || value === undefined) {
      return nullLabel;
    }
    const date = new Date(value);
    if (Math.abs(new Date().getTime() - date.getTime()) < (24 * 3600 * 1000)) {
      return date.toLocaleTimeString();
    }
    return date.toLocaleDateString();
  };

export const round =
  (value: any, digits = 2): string | number => {
    if (value === null || value === undefined) {
      return '--.--';
    }
    return (+value).toFixed(digits);
  };

export const truncateRound =
  (value: any): string | number => {
    if (value === null || value === undefined) {
      return '---';
    }
    const v = +value;
    if (Math.abs(v) >= 100) {
      return v.toFixed(0);
    }
    if (Math.abs(v) >= 10) {
      return v.toFixed(1);
    }
    return v.toFixed(2);
  };

export const roundNumber =
  (value: number, digits = 2): number =>
    Number((Math.round(Number(value + 'e' + digits)) + 'e-' + digits));

export const truncate =
  (value: string): string => {
    const strVal = value.toString();
    return strVal.length <= 30 ? strVal : `${strVal.slice(0, 27)}...`;
  };

export function chunked<T>(arr: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  let i = 0;
  const n = arr.length;
  while (i < n) {
    chunks.push(arr.slice(i, i += chunkSize));
  }
  return chunks;
}

export const nanoToMilli =
  (nano: number): number => Math.floor(nano / 1e6);

export const capitalized =
  (s: string): string =>
    isString(s)
      ? s.charAt(0).toUpperCase() + s.slice(1)
      : s;

export const contrastColor =
  (background: string): string => {
    // Algorithm copied from StackOverflow at 2019/06/27
    // https://stackoverflow.com/questions/1855884/determine-font-color-based-on-background-color
    const rgb = colors.hexToRgb(background);
    const luma = ((0.299 * rgb.r) + (0.587 * rgb.g) + (0.114 * rgb.b)) / 255;
    return luma > 0.8 ? 'black' : 'white';
  };

export const suggestId =
  (id: string, validate: (val: string) => boolean, ): string => {
    if (validate(id)) {
      return id;
    }

    const copyName = (i: number): string =>
      (id.match(/-\d+$/)
        ? id.replace(/-\d+$/, `-${i}`)
        : `${id}-${i}`);

    let idx = 2;
    while (!validate(copyName(idx))) {
      idx += 1;
      if (idx > 100) {
        throw new Error('Max suggestions exceeded');
      }
    }

    return copyName(idx);
  };

export const isAbsoluteUrl =
  (val: string): boolean =>
    new RegExp('^(?:[a-z]+:)?//', 'i').test(val);

export const isJsonEqual =
  (left: any, right: any): boolean =>
    isEqual(JSON.parse(JSON.stringify(left)), JSON.parse(JSON.stringify(right)));

export const ruleValidator =
  (rules: InputRule[]): ((val: any) => boolean) =>
    val => rules.every(rule => !isString(rule(val)));

export const ruleErrorFinder =
  (rules: InputRule[]): ((val: any) => string | null) =>
    val => {
      for (const rule of rules) {
        const res = rule(val);
        if (isString(res)) {
          return res;
        }
      }
      return null;
    };

export const mutate =
  (acc, key: keyof any, val: any): typeof acc => {
    acc[key] = val;
    return acc;
  };

export const objReducer =
  (key: string) =>
    (acc: Mapped<any>, obj: any) => mutate(acc, obj[key], obj);


export const mapEntries =
  (obj: Record<keyof any, any>, callback: ([k, v]) => [keyof any, any]): typeof obj =>
    fromEntries(Object.entries(obj).map(callback));

export function spliceById<T extends HasId>
  (arr: T[], obj: T, insert = true): T[] {
  const idx = arr.findIndex(v => v.id === obj.id);
  if (idx !== -1) {
    insert
      ? arr.splice(idx, 1, obj)
      : arr.splice(idx, 1);
  }
  return arr;
}

export function popById<T extends HasId>(arr: T[], obj: HasId): T | undefined {
  const idx = arr.findIndex(v => v.id === obj.id);
  return idx !== -1
    ? arr.splice(idx, 1)[0]
    : undefined;
}
