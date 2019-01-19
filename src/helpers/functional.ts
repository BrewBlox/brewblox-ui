import parseDuration from 'parse-duration';
import { Unit } from './units';

export const uniqueFilter = (val: any, idx: number, coll: any[]) =>
  coll.indexOf(val) === idx;

export const objectSorter = (key: string) =>
  ((a: any, b: any) => a[key] - b[key]);

export const objectStringSorter = (key: string) => (a: any, b: any) => {
  const left = a[key].toLowerCase();
  const right = b[key].toLowerCase();
  if (left < right) {
    return -1;
  }
  if (right > left) {
    return 1;
  }
  return 0;
};

export const durationString = (duration: number | string) => {
  const durationMs =
    typeof duration === 'string' ? parseDuration(duration) : duration;
  const secondsTotal = Number(durationMs) / 1000;
  const days = Math.floor(secondsTotal / 86400);
  const hours = Math.floor((secondsTotal - (days * 86400)) / 3600);
  const minutes =
    Math.floor((secondsTotal - (days * 86400) - (hours * 3600)) / 60);
  const seconds = Math.floor(
    secondsTotal - (days * 86400) - (hours * 3600) - (minutes * 60));
  const milliseconds = (secondsTotal < 10 ) ? Math.floor((secondsTotal - Math.floor(secondsTotal)) * 1000) : 0;
  const values = [
    [days, 'd'],
    [hours, 'h'],
    [minutes, 'm'],
    [seconds, 's'],
    [milliseconds, 'ms'],
  ];
  return values.reduceRight(
    (acc: string, [val, unit]) => (val ? `${val}${unit} ${acc}` : acc),
    '') ||
    '0s';
};

export const unitDurationString = (value: Unit | null) => {
  if (value === null || value === undefined || value.value === null) {
    return '---';
  }
  return durationString(`${value.value}${value.notation}`);
};

export const spaceCased = (input: string) =>
  input.replace(/[_-]/, ' ')
    .replace(/([^^])([A-Z]+)/g, (_, v1, v2) => `${v1} ${v2.toLowerCase()}`);

export const snakeCased = (input: string) =>
  input.replace(/[ -]/, '_')
    .replace(/\.?([A-Z]+)/g, (_, v: string) => `_${v}`)
    .toLowerCase();

export const kebabCased = (input: string) =>
  input.replace(/[ _]/, '-')
    .replace(/\.?([A-Z]+)/g, (_, v: string) => `-${v}`)
    .toLowerCase();

export const camelCased = (input: string) =>
  input.replace(/[ -_](.)/, (_, v1) => v1.toUpperCase());

export const hexToBase64 = (hex: string) =>
  Buffer.from(hex, 'hex').toString('base64');

export const base64ToHex = (b64: string) =>
  Buffer.from(b64, 'base64').toString('hex');

export const clamp = (num: number, min: number, max: number) =>
  Math.max(min, Math.min(num, max));

export const clampRotation = (val: number) => (val + 360) % 360;

export const dateString = (value: number | string | null, nullLabel: string = '<not set>') => {
  if (value === null || value === undefined) {
    return nullLabel;
  }
  return new Date(value).toLocaleString();
};

export const shortDateString = (value: number | string | null, nullLabel: string = '<not set>') => {
  if (value === null || value === undefined) {
    return nullLabel;
  }
  const date = new Date(value);
  if (Math.abs(new Date().getTime() - date.getTime()) < (24 * 3600 * 1000)) {
    return date.toLocaleTimeString();
  }
  return date.toLocaleDateString();
};
