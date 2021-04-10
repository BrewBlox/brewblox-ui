import fromEntries from 'fromentries';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import isFinite from 'lodash/isFinite';
import isString from 'lodash/isString';
import mapKeys from 'lodash/mapKeys';
import { colors, date } from 'quasar';

type SortFunc = (a: any, b: any) => number

export const uniqueFilter =
  <T>(val: T, idx: number, coll: T[]): boolean => coll.indexOf(val) === idx;

export const objectSorter =
  (key: string): SortFunc => ((a: any, b: any) => a[key] - b[key]);

export const objectStringSorter =
  (key: string): SortFunc =>
    (a: any, b: any) => {
      const left = a[key]?.toLowerCase() ?? '';
      const right = b[key]?.toLowerCase() ?? '';
      return left.localeCompare(right);
    };

export const spaceCased =
  (input: string): string =>
    input.replace(/[_-]/, ' ')
      .replace(/([^^])([A-Z][^A-Z])/g, (_, v1, v2) => `${v1} ${v2.toLowerCase()}`)
      .replace(/([^^])([A-Z]+)/g, (_, v1, v2) => `${v1} ${v2}`)
      .replace(/\s+/g, ' ');

export const snakeCased =
  (input: string): string =>
    input.replace(/[ -]/, '_')
      .replace(/\.?([A-Z]+)/g, (_, v: string) => `_${v}`)
      .toLowerCase();

export const snakeCasedObj =
  (obj: Mapped<any>): Mapped<any> =>
    mapKeys(obj, (_, key) => snakeCased(key));

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
    const spaced = spaceCased(input).trim();
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
  (value: number | string | Date | null | undefined, nullLabel = '<not set>'): string => {
    if (value === null || value === undefined) {
      return nullLabel;
    }
    const date = new Date(value);
    if (Math.abs(new Date().getTime() - date.getTime()) < (24 * 3600 * 1000)) {
      return date.toLocaleTimeString();
    }
    return date.toLocaleDateString();
  };

export const isoDateString =
  (val: Date | number | string | undefined): string | undefined => {
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
  };

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

export const round =
  (value: number | null | undefined, digits = 2): string => {
    if (value == null) {
      return '--.--';
    }
    return (+value).toFixed(digits);
  };

export const truncateRound =
  (value: number | null | undefined): string | number => {
    if (value == null) {
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

export function roundNumber(value: number, digits?: number): number;
export function roundNumber(value: number | null, digits?: number): number | null;
export function roundNumber(value: number | null, digits = 2): number | null {
  return value != null
    ? Number((Math.round(Number(value + 'e' + digits)) + 'e-' + digits))
    : null;
}

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
    isString(s) && s.length > 0
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
  (id: string, validate: (val: string) => boolean): string => {
    if (validate(id)) {
      return id;
    }

    const copyName = (i: number): string =>
      id.match(/-\d+$/)
        ? id.replace(/-\d+$/, `-${i}`)
        : `${id}-${i}`;

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
  (left: unknown, right: unknown): boolean =>
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
  <T extends unknown>(acc: T, key: keyof T, val: T[keyof T]): T => {
    acc[key] = val;
    return acc;
  };

export const objReducer =
  (key: string) =>
    (acc: Mapped<unknown>, obj: any) => mutate(acc, obj[key], obj);

export const mapEntries =
  (obj: Record<keyof any, any>, callback: ([k, v]) => [keyof any, any]): typeof obj =>
    fromEntries(Object.entries(obj).map(callback));

export function combinations<T>(arr: T[]): [T, T][] {
  const results: [T, T][] = [];
  // last element is skipped
  for (let i = 0; i < arr.length - 1; i++) {
    // Capture the second part of the combination
    for (let j = i + 1; j < arr.length; j++) {
      results.push([arr[i], arr[j]]);
    }
  }
  return results;
}

// Overloads for spliceById
// if insert is false, the stub { id } is sufficient to remove the existing object
export function spliceById<T extends HasId>(arr: T[], obj: T): T[];
export function spliceById<T extends HasId>(arr: T[], obj: T, insert: true): T[];
export function spliceById<T extends HasId>(arr: T[], obj: HasId, insert: false): T[];

/**
 * Modifies input array by either replacing or removing a member.
 * Returns the modified array.
 * If no members match `obj`, `arr` is not modified.
 *
 * @param arr object collection
 * @param obj compared object
 * @param insert true to replace the object, false to remove
 */
export function spliceById<T extends HasId>(arr: T[], obj: T, insert = true): T[] {
  const idx = arr.findIndex(v => v.id === obj.id);
  if (idx !== -1) {
    insert
      ? arr.splice(idx, 1, obj)
      : arr.splice(idx, 1);
  }
  return arr;
}

/**
 * Modifies input array by removing the member matching `obj`.
 * Returns the matched member, or undefined.
 *
 * @param arr object collection
 * @param obj full object or { id } stub to compare against
 */
export function popById<T extends HasId>(arr: T[], obj: HasId): T | undefined {
  const idx = arr.findIndex(v => v.id === obj.id);
  return idx !== -1
    ? arr.splice(idx, 1)[0]
    : undefined;
}

/**
 * Returns a new array consisting of all members of input array
 * minus those matching `obj`.
 * Does not modify input array.
 *
 * @param arr object collection
 * @param obj full object or { id } stub to compare against
 */
export function filterById<T extends HasId>(arr: T[], obj: HasId): T[] {
  return arr.filter(v => v.id !== obj.id);
}

/**
 * Returns a new array consisting of all members of input array
 * minus those matching `obj`, and plus `obj` itself.
 * Does not modify input array.
 * If no members match `obj`, `obj` is appended.
 * If a member matches `obj`, `obj` is inserted at the same index.
 *
 * @param arr object collection
 * @param obj object to be inserted
 */
export function extendById<T extends HasId>(arr: T[], obj: T): T[] {
  const idx = arr.findIndex(v => v.id === obj.id);
  return idx !== -1
    ? [...arr.slice(0, idx), obj, ...arr.slice(idx + 1)]
    : [...arr, obj];
}

/**
 * Looks for object in array collection.
 *
 * @param arr object collection.
 * @param id unique ID of desired object.
 */
export function findById<T extends HasId>(
  arr: T[],
  id: string | null,
  fallback: T | null = null,
): T | typeof fallback {
  return id != null
    ? arr.find(v => v.id === id) ?? fallback
    : fallback;
}

/**
 * Finds object in `arr` with ID matching `patch`.
 * Returns a shallow merge of found object and `patch`.
 *
 * Returns `fallback` if no match was found in `arr`.
 * Does not modify `arr`.
 *
 * @param arr object collection.
 * @param patch partial object with required ID.
 */
export function patchedById<T extends HasId>(
  arr: T[],
  patch: Patch<T>,
  fallback: T | null = null,
): T | typeof fallback {
  const existing = findById(arr, patch.id);
  return existing
    ? { ...existing, ...patch }
    : fallback;
}

/**
 * Checks if a generic object with a 'type' field matches a TS interface.
 * Best used when T.type is a constant value.
 *
 * @remarks
 *
 * The function acts as a type guard:
 * https://www.typescriptlang.org/docs/handbook/advanced-types.html#instanceof-type-guards
 *
 * This is useful for when data is dynamically loaded,
 * and we want to perform a runtime type check,
 * while validating the 'type' argument at compile time.
 *
 * ```ts
 * interface PancakeIntf {
 *   type: 'Pancake';
 *   value: string;
 * }
 * matchesType<PancakeIntf>('Pancake', {type: 'Pancake', value: 'no'}) >>>> true
 * matchesType<PancakeIntf>('Pancake', {type: 'Waffle', value: 'yes'}) >>>> false
 * matchesType<PancakeIntf>('Waffle', {type: 'Waffle', value: 'yes'})
 * //                        ^^^^^^
 * // Argument of type '"Waffle"' is not assignable to parameter of type '"Pancake"'
 * ```
 *
 * @param type
 * @param obj
 */
export function matchesType<T extends HasType>(type: T['type'], obj: HasType): obj is T {
  return obj.type === type;
}

/**
 * The curried version of `matchesType()`
 *
 * Returns a function that can directly be used as type guard in Array.find() or Array.filter().
 *
 * ```ts
 * interface Circular = PancakeInterface | FrisbeeInterface;
 *
 * function eat(pancake: PancakeInterface): void {
 *   // yum
 * }
 *
 * const items: Circular[] = [
 *   { type: 'Pancake' },
 *   { type: 'Frisbee' }
 * ];
 *
 * items
 *   .filter(typeMatchFilter<PancakeInterface>('Pancake'))
 *   .forEach(v => eat(v)); // Does not raise a type error
 * ```
 *
 * @param type
 */
export function typeMatchFilter<T extends HasType>(type: T['type']): ((obj: HasType | null | undefined) => obj is T) {
  return (obj): obj is T => obj != null && obj.type === type;
}

export function nullFilter<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function deepCopy<T>(obj: T): T {
  return obj
    ? cloneDeep(obj)
    : obj;
}
