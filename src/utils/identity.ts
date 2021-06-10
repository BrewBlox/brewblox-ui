import LibQty from 'js-quantities';
import isString from 'lodash/isString';

import { BloxField, Link, Quantity } from '@/shared-types';

interface UnitGroup {
  name: string;
  example: string;
  test: (s: string) => boolean;
  convert: (s: string) => string;
}

// repeated number + time unit
// 'm' for minute is allowed here
const durationExp = /^(\s*\d*\.?\d+\s*(ms|milliseconds?|s|seconds?|m|mins?|minutes?|h|hours?|d|days?)?\s*)*$/i;
const durationUnitExp = /^(ms|milliseconds?|s|seconds?|mins?|minutes?|h|hours?|d|days?)$/i;

const unitConversionGroups: UnitGroup[] = [
  {
    name: 'Time',
    example: 'second',
    test: s => /^(ms|milliseconds?|s|seconds?|mins?|minutes?|h|hours?|d|days?)$/.test(s),
    convert: s => s,
  },
  {
    name: 'Temp',
    example: 'degC',
    test: s => /^deg(F|C)$/i.test(s),
    convert: s => s.replace('deg', 'temp'),
  },
  {
    name: 'Delta Temp',
    example: 'delta_degC',
    test: s => /^delta_deg(F|C)$/i.test(s),
    convert: s => s.replace('delta_', ''),
  },
  {
    name: 'Inverse Temp',
    example: '1 / degC',
    test: s => /^1 ?\/ ?deg(F|C)$/i.test(s),
    convert: s => s,
  },
  {
    name: 'Delta Temp / Time',
    example: 'delta_degC / second',
    test: s => /^delta_deg(F|C) ?\/ ?(s|seconds?|mins?|minutes?|h|hours?|d|days?)$/i.test(s),
    convert: s => s.replace('delta_', ''),
  },
  {
    name: 'Delta Temp * Time',
    example: 'delta_degC * second',
    test: s => /^delta_deg(F|C) ?\* ?(s|seconds?|mins?|minutes?|h|hours?|d|days?)$/i.test(s),
    convert: s => s.replace('delta_', ''),
  },
];

const findGroup = (unit?: string): UnitGroup | null =>
  unit
    ? unitConversionGroups.find(g => g.test(unit)) ?? null
    : null;

export const canSerialize =
  (obj: unknown): obj is { toJSON(): any; } =>
    obj instanceof Object
    && 'toJSON' in obj;

export const isBloxField =
  (obj: unknown): obj is BloxField =>
    obj instanceof Object
    && '__bloxtype' in obj;

export const isQuantity =
  (obj: unknown): obj is Quantity =>
    isBloxField(obj)
    && obj.__bloxtype === 'Quantity';

export const isLink =
  (obj: unknown): obj is Link =>
    isBloxField(obj)
    && obj.__bloxtype === 'Link';

export const isDurationString =
  (v: unknown): v is string =>
    isString(v) && durationExp.test(v);

export const isDurationUnit =
  (v: unknown): v is string =>
    isString(v) && durationUnitExp.test(v);

export const isCompatibleQty = (qty1: Quantity, qty2: Quantity): boolean => {
  const group1 = findGroup(qty1.unit)?.name;
  const group2 = findGroup(qty2.unit)?.name;
  return group1 === group2;
};

export const libUnit = (unit: string): string =>
  findGroup(unit)?.convert(unit) ?? unit;

export const toLibQty = (v: Quantity): LibQty =>
  LibQty(v.value ?? 0, libUnit(v.unit)!);
