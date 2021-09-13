import isEqual from 'lodash/isEqual';

/**
 * Returns a function that will sort objects by one of their properties.
 * If both values are numbers, they will be compared directly.
 * Otherwise, they will be compared as string.
 *
 */
export function makeObjectSorter<T>(key: keyof T): (a: T, b: T) => number {
  return (a: T, b: T) => {
    const left = a[key] ?? 0;
    const right = b[key] ?? 0;

    if (typeof left === 'number' && typeof right === 'number') {
      return left - right;
    } else {
      return `${left}`.localeCompare(`${right}`, undefined, {
        sensitivity: 'base',
        ignorePunctuation: true,
      });
    }
  };
}

/**
 * Returns a function that can directly be used as type guard in Array.find() or Array.filter().
 * It checks whether `obj.type` matches the desired type.
 *
 * ```ts
 * type Circular = PancakeInterface | FrisbeeInterface;
 *
 * function eat(pancake: PancakeInterface): void {
 *   // yum
 * }
 *
 * const items: Circular[] = [
 *   { type: 'Pancake' },
 *   { type: 'Frisbee' },
 * ];
 *
 * items
 *   .filter(makeTypeFilter<PancakeInterface>('Pancake'))
 *   .forEach(v => eat(v)); // Does not raise a type error
 * ```
 *
 * @param type
 */
export function makeTypeFilter<T extends HasType>(
  type: T['type'],
): (obj: Maybe<HasType>) => obj is T {
  return (obj): obj is T => obj != null && obj.type === type;
}

/**
 * Is a filter function to remove all null or undefined objects from an array.
 *
 * ```ts
 * const items: (number | null | undefined)[] = [
 *   1,
 *   undefined,
 *   2,
 *   null,
 *   null,
 *   3,
 * ];
 *
 * const definedItems: number[] = items.filter(nullFilter);
 * // => [1, 2, 3]
 * ```
 */
export function nullFilter<T>(value: Maybe<T>): value is T {
  return value !== null && value !== undefined;
}

/**
 * Is a filter function to remove all duplicate values from an array.
 * It will only return true for the first duplicate item.
 *
 * Objects are compared by equality, not sameness.
 *
 * ```ts
 * [1, 2, 2, 3, 4, 3].filter(uniqueFilter);
 * // => [1, 2, 3, 4]
 *
 * [{a: 1}, {a: 2}, {a: 1}].filter(uniqueFilter);
 * // => [{a: 1}, {a: 2}]
 *
 * ```
 */
export function uniqueFilter<T>(val: T, idx: number, coll: T[]): boolean {
  return coll.findIndex((v) => isEqual(v, val)) === idx;
}
