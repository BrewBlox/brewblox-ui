import { BlockOrIntfType, Link, Quantity } from 'brewblox-proto/ts';
import fromPairs from 'lodash/fromPairs';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import mapValues from 'lodash/mapValues';
import toPairs from 'lodash/toPairs';
import { canSerialize, isBloxField } from './identity';
import { rawLink } from './link';
import { rawQty } from './quantity';

// string start
// then any characters (captured)
// then a left bracket (captured)
// then any characters (captured)
// then a right bracket
// string end
// Example values:
//   'field<SetpointSensorPair,driven>'
//   'field2[degC]'
//   'field_underscored[1 / degC]'
const postfixExpr = /^(.*)([\[<])(.*)[\]>]$/;

/**
 * Parses given name, and extracts base name and postfix.
 * If no postfix was detected, the full name is considered the base name.
 *
 * @param name
 * @returns
 */
export function splitPostfixed(name: string): [string, string | null] {
  const matched = name.match(postfixExpr);
  if (!matched) {
    return [name, null];
  }
  const baseName = matched[1];
  const unit = matched[3].split(',')[0];
  return [baseName, unit];
}

/**
 * Parses given name and value,
 * and returns base name + parsed Quantity or Link.
 *
 * @param key
 * @param val
 * @returns
 */
export function parsePostfixed(
  key: string,
  val: unknown,
): [string, Quantity | Link] | null {
  try {
    if (key.endsWith(']') || key.endsWith('>')) {
      const matched = key.match(postfixExpr);
      if (matched) {
        const [, name, leftBracket, bracketed] = matched;
        if (leftBracket === '<') {
          const [type] = bracketed.split(','); // backwards compatibility for old 'driven' links
          return [name, rawLink(val as string | null, type as BlockOrIntfType)];
        } else if (leftBracket === '[') {
          return [name, rawQty(val as number | null, bracketed)];
        }
      }
    }
  } catch (e) {}
  return null;
}

/**
 * Recursively deserializes given object.
 * If any postfixed Quantity/Link values are detected,
 * they are converted, and the postfix is stripped from the key.
 *
 * @param obj
 * @returns
 */
export function deserialize<T>(obj: T): T {
  if (isArray(obj)) {
    return (obj as any).map(deserialize) as T;
  }
  if (isBloxField(obj)) {
    return obj;
  }
  if (isObject(obj)) {
    const parsed = toPairs(obj).map(
      ([key, val]) => parsePostfixed(key, val) ?? [key, deserialize(val)],
    );
    return fromPairs(parsed) as T;
  }
  return obj;
}

/**
 * Recursively serializes given object.
 * Attempts to reduce class objects to a JSON-compatible object.
 *
 * If an object with a `toJSON` function is encountered,
 * the function is used instead of deeper recursion.
 *
 * @param obj
 * @returns
 */
export function serialize<T>(obj: T): T {
  if (isArray(obj)) {
    return (obj as any).map(serialize);
  }
  if (canSerialize(obj)) {
    return obj.toJSON();
  }
  if (isObject(obj)) {
    return mapValues(obj, serialize) as any; // lies
  }
  return obj;
}
