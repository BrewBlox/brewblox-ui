import { Quantity } from './types';

export interface UnitGroup {
  name: string;
  example: string;
  test: (s: string) => boolean;
  convert: (s: string) => string;
}

const groups: UnitGroup[] = [
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

export const findGroup = (unit?: string): UnitGroup | null =>
  unit
    ? groups.find(g => g.test(unit)) ?? null
    : null;

export const isCompatibleQty = (qty1: Quantity, qty2: Quantity): boolean => {
  const group1 = findGroup(qty1.unit)?.name;
  const group2 = findGroup(qty2.unit)?.name;
  return group1 === group2;
};
