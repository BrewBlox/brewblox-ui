import LibQty from 'js-quantities';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import round from 'lodash/round';

import { durationMs, isDurationString } from '@/utils/duration';

import { findGroup, isCompatibleQty } from './groups';
import { JSBloxField, Quantity } from './types';
import { isQuantity, prettyQty, roundedQty } from './utils';

type WrapperValue = Quantity | number | string | null;

const libUnit = (unit: string): string =>
  findGroup(unit)?.convert(unit) ?? unit;

const toLibQty = (v: Quantity): LibQty =>
  LibQty(v.value ?? 0, libUnit(v.unit)!);

const fromArgs =
  (value: number | null, unit: string, readonly = false): Quantity => ({
    __bloxtype: 'Quantity',
    value,
    unit,
    readonly: readonly || undefined,
  });

export function rawQty(value: number | null, unit: string): Quantity;
export function rawQty(value: Quantity | string): Quantity;
export function rawQty(value: WrapperValue, unit?: string): Quantity {
  if (isQuantity(value)) {
    return fromArgs(value.value, value.unit, value.readonly);
  }
  else if (isDurationString(value)) {
    return fromArgs(durationMs(value) / 1000, 's');
  }
  else if ((value === null || isNumber(value)) && isString(unit)) {
    return fromArgs(value, unit);
  }
  throw new Error(`Invalid Quantity args: ${value}, ${unit}`);
}

export class JSQuantity implements JSBloxField, Quantity {
  public readonly __bloxtype = 'Quantity';
  public value: number | null;
  public unit: string;
  public readonly: boolean;

  public constructor(value: number | null, unit: string);
  public constructor(value: Quantity | string);
  public constructor(value: WrapperValue, unit?: string) {
    const obj = rawQty(value as any, unit as any);
    this.value = obj.value;
    this.unit = obj.unit;
    this.readonly = obj.readonly ?? false;
  }

  public get postfix(): string {
    return `[${this.unit}]`;
  }

  public toString(): string {
    return prettyQty(this);
  }

  public toJSON(): Quantity {
    return {
      __bloxtype: 'Quantity',
      value: this.value,
      unit: this.unit,
      readonly: this.readonly || undefined,
    };
  }

  public rawCopy(value?: number | null, unit?: string): Quantity {
    return {
      ...this.toJSON(),
      value: value !== undefined ? value : this.value, // null is valid
      unit: unit ?? this.unit,
    };
  }

  public copy(value?: number | null, unit?: string): JSQuantity {
    return new JSQuantity(this.rawCopy(value, unit));
  }

  public eq(other: Quantity): boolean {
    return isQuantity(other)
      && isCompatibleQty(this, other)
      && (this.value === null) === (other.value === null)
      && toLibQty(roundedQty(this)).eq(toLibQty(roundedQty(other)));
  }

  public to(unit: string): JSQuantity {
    if (unit === this.unit) {
      return this.copy();
    }
    const value = this.value !== null
      ? toLibQty(this).to(libUnit(unit)).scalar
      : null;
    return this.copy(value, unit);
  }

  public round(precision = 2): JSQuantity {
    const value = this.value !== null
      ? round(this.value, precision)
      : null;
    return this.copy(value);
  }
}

export function bloxQty(value: number | null, unit: string): JSQuantity;
export function bloxQty(value: Quantity | string): JSQuantity;
export function bloxQty(value: WrapperValue, unit?: string): JSQuantity {
  // Let the constructor handle invalid combinations of args
  return new JSQuantity(value as any, unit as any);
}
