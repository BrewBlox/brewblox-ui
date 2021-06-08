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
