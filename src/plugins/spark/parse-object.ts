import { mapValues } from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';

import { mapEntries } from '@/helpers/functional';

import {
  isJSBloxField,
  isJSONLink,
  isJSONQuantity,
  JSBloxField,
  Link,
  Qty,
} from './bloxfield';
import { BlockOrIntfType } from './types';

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

export function objectUnit(val: any): string | null {
  return (val instanceof Qty)
    ? val.notation
    : null;
}

export function parsePostfixed(key: string, val: any): [string, JSBloxField] | null {
  try {
    if (key.endsWith(']') || key.endsWith('>')) {
      const matched = key.match(postfixExpr);
      if (matched) {
        const [, name, leftBracket, bracketed] = matched;
        if (leftBracket === '<') {
          const [type, driven] = bracketed.split(',');
          return [name, new Link(val, type as BlockOrIntfType, !!driven)];
        }
        else if (leftBracket === '[') {
          return [name, new Qty(val, bracketed)];
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
  if (isJSBloxField(obj)) {
    return obj;
  }
  if (isJSONLink(obj)) {
    return new Link(obj);
  }
  if (isJSONQuantity(obj)) {
    return new Qty(obj);
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

export function deepCopy<T>(obj: T): T {
  return obj
    ? cloneDeep(obj)
    : obj;
}
