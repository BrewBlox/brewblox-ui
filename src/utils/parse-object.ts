import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import mapValues from 'lodash/mapValues';

import {
  BlockOrIntfType,
  isBloxField,
  isJSBloxField,
  Link,
  Quantity,
  rawLink,
  rawQty,
} from '@/utils/bloxfield';
import { mapEntries } from '@/utils/functional';


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

export function propertyNameWithoutUnit(name: string): string {
  const matched = name.match(postfixExpr);
  return matched ? matched[1] : name;
}

export function propertyNameWithUnit(name: string): [string, string | null] {
  const matched = name.match(postfixExpr);
  if (!matched) {
    return [name, null];
  }
  const baseName = matched[1];
  const unit = matched[3].split(',')[0];
  return [baseName, unit];
}

export function parsePostfixed(key: string, val: string | number | null): [string, Quantity | Link] | null {
  try {
    if (key.endsWith(']') || key.endsWith('>')) {
      const matched = key.match(postfixExpr);
      if (matched) {
        const [, name, leftBracket, bracketed] = matched;
        if (leftBracket === '<') {
          const [type, driven] = bracketed.split(',');
          return [name, rawLink(val as string, type as BlockOrIntfType, !!driven)];
        }
        else if (leftBracket === '[') {
          return [name, rawQty(val as number, bracketed)];
        }
      }
    }
  }
  catch (e) { }
  return null;
}

export function deserialize<T extends any>(obj: T): T {
  if (isArray(obj)) {
    return obj.map(deserialize) as T;
  }
  if (isBloxField(obj)) {
    return obj;
  }
  if (isObject(obj)) {
    return mapEntries(obj,
      ([key, val]) => parsePostfixed(key, val) ?? [key, deserialize(val)]);
  }
  return obj;
}

export function serialize(obj: unknown): typeof obj {
  if (isArray(obj)) {
    return obj.map(serialize);
  }
  if (isJSBloxField(obj)) {
    return obj.toJSON();
  }
  if (isObject(obj)) {
    return mapValues(obj, serialize);
  }
  return obj;
}
