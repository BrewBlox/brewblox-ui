
/**
 * Check if a given string looks like an absolute URL.
 * No check is done whether the full URL is syntactically correct.
 *
 * @param val URL string
 * @returns if URL is absolute (includes scheme and host )
 */
export function isAbsoluteUrl(val: string): boolean {
  return /^(?:[a-zA-Z]+:)?\/\//.test(val);
}

/**
 * Check if a given string can safely be used as URL path.
 * The check is strict, and will return false for URL-encoded special characters.
 *
 * @param val checked string
 * @returns if `val` is safe to use as URL path
 */
export function isUrlSafe(val: string): boolean {
  return /^[\w\-\.~]*$/.test(val);
}

/**
 * Sanitize given string, replacing all invalid characters with a filler.
 * Sequences of invalid characters are replaced with a single filler.
 *
 * @param val input string
 * @param filler replacement string for invalid characters
 * @returns sanitized input string
 */
export function makeUrlSafe(val: string, filler = '-'): string {
  if (filler !== '-' && !isUrlSafe(filler)) {
    throw new Error(`Filler string "${filler}" is not URL-safe`);
  }
  return val.replace(/[^\w\-\.~]+/g, filler);
}
