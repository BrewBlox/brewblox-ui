/**
 * Looks for object in array collection.
 *
 * @param arr object collection.
 * @param id unique ID of desired object.
 * @param fallback returned if no match found.
 */
export function findById<T extends HasId>(
  arr: T[],
  id: Maybe<string>,
  fallback: T | null = null,
): T | typeof fallback {
  return id != null
    ? arr.find(v => v.id === id) ?? fallback
    : fallback;
}

/**
 * Looks for object in array collection.
 * Functions like `findById`, but can use keys other than `id`.
 *
 * @param arr object collection.
 * @param key object key where the value should equal `desired`.
 * @param desired value of `obj[key]`
 * @param fallback returned if no match found
 * @returns
 */
export function findByKey<T>(
  arr: T[],
  key: keyof T,
  desired: Maybe<T[keyof T]>,
  fallback: T | null = null,
): T | typeof fallback {
  return desired != null
    ? arr.find(v => v[key] === desired) ?? fallback
    : fallback;
}

/**
 * Replaces or removes a member in input array.
 * Modifies and returns input array.
 * If `obj` does not match any member, it is inserted at the end of the array.
 *
 * @param arr object collection
 * @param obj compared object
 * @param insert true to replace the object, false to remove
 */
export function spliceById<T extends HasId>(arr: T[], obj: T): T[];
export function spliceById<T extends HasId>(arr: T[], obj: T, insert: true): T[];
export function spliceById<T extends HasId>(arr: T[], obj: HasId, insert: false): T[];
export function spliceById<T extends HasId>(arr: T[], obj: T, insert = true): T[] {
  const idx = arr.findIndex(v => v.id === obj.id);
  if (idx >= 0) {
    insert
      ? arr.splice(idx, 1, obj)
      : arr.splice(idx, 1);
  }
  else if (insert) {
    arr.push(obj);
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
  return idx >= 0
    ? arr.splice(idx, 1)[0]
    : undefined;
}

/**
 * Returns a new array consisting of all members of input array
 * minus the first member matching `obj`, and plus `obj` itself.
 * Does not modify input array.
 * If no members match `obj`, `obj` is appended.
 * If a member matches `obj`, `obj` is inserted at the same index.
 *
 * @param arr object collection
 * @param obj object to be inserted
 */
export function concatById<T extends HasId>(arr: T[], obj: T): T[] {
  const idx = arr.findIndex(v => v.id === obj.id);
  return idx >= 0
    ? [...arr.slice(0, idx), obj, ...arr.slice(idx + 1)]
    : [...arr, obj];
}

/**
 * Returns a new array consisting of all members of input array
 * minus those matching `obj`.
 * Does not modify input array.
 *
 * @param arr object collection
 * @param obj full object or { id } stub to compare against
 */
export function filterById<T extends HasId>(arr: T[], obj: T | HasId): T[] {
  return arr.filter(v => v.id !== obj.id);
}
