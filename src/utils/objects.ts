import isEqual from 'lodash/isEqual';

/**
 * JSON serializes and parses `left` and `right`, and then checks equality.
 * This will accurately check object equality for reactive objects.
 *
 * @param left
 * @param right
 * @returns Whether `left` and `right` are equal in their serialized form.
 */
export function isJsonEqual(left: unknown, right: unknown): boolean {
  return left != null && right != null
    ? isEqual(
        JSON.parse(JSON.stringify(left)),
        JSON.parse(JSON.stringify(right)),
      )
    : (left == null) === (right == null);
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
export function matchesType<T extends HasType>(
  type: T['type'],
  obj: Maybe<HasType>,
): obj is T {
  return obj?.type === type;
}
