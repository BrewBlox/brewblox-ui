import { mapValues } from 'lodash';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';

import {
  BlockOrIntfType,
  isBloxField,
  isJSBloxField,
  Link,
  Quantity,
  rawLink,
  rawQty,
} from '@/helpers/bloxfield';
import { mapEntries } from '@/helpers/functional';


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

export function parsePostfixed(key: string, val: any): [string, Quantity | Link] | null {
  try {
    if (key.endsWith(']') || key.endsWith('>')) {
      const matched = key.match(postfixExpr);
      if (matched) {
        const [, name, leftBracket, bracketed] = matched;
        if (leftBracket === '<') {
          const [type, driven] = bracketed.split(',');
          return [name, rawLink(val, type as BlockOrIntfType, !!driven)];
        }
        else if (leftBracket === '[') {
          return [name, rawQty(val, bracketed)];
        }
      }
    }
  }
  catch (e) { }
  return null;
}

export function deserialize(obj: any): typeof obj {
  if (isArray(obj)) {
    return obj.map(deserialize);
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

export function serialize(obj: any): typeof obj {
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
