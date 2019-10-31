import cloneDeep from 'lodash/cloneDeep';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';

import { mapEntries } from '../functional';
import Link from './Link';
import PostFixed from './PostFixed';
import Unit from './Unit';

// "not brackets",
// then a left bracket,
// then more "not brackets, not comma",
// then optional comma + "not brackets"
// then right bracket
const unitExp = /^([^[<]+)([[<])([^\]>,]*),?([^\]>]*)[\]>]$/;

export function propertyNameWithoutUnit(name: string): string {
  const matched = name.match(unitExp);
  return matched ? matched[1] : name;
}

export function propertyNameWithUnit(name: string): [string, string | null] {
  const matched = name.match(unitExp);
  return matched ? [matched[1], matched[3]] : [name, null];
}

export function objectUnit(val: any): string | null {
  return (val instanceof Unit)
    ? val.notation
    : null;
}

export function serializedPropertyName(key: string, obj: any): string {
  const val = obj[key];

  if (val instanceof Unit) {
    return `${key}[${val.unit}]`;
  }

  if (val instanceof Link) {
    return `${key}${val.postfix}`;
  }

  return key;
}

export function postfixedDisplayNames(displayNames: Mapped<string>, obj: any): Mapped<string> {
  const retv: Mapped<string> = {};

  for (const key in displayNames) {
    const serializedKey = serializedPropertyName(key, obj);
    const unit = objectUnit(obj[key]);
    const name = displayNames[key];
    retv[serializedKey] = unit ? `${name} [${unit}]` : name;
  }
  return retv;
}

export function parsePostfixed(key: string, val: any): [string, PostFixed] | null {
  const matched = key.match(unitExp);
  if (matched) {
    const [, name, leftBracket, bracketed, driven] = matched;
    try {
      if (leftBracket === '<') {
        return [name, new Link(val, bracketed, !!driven)];
      }
      else if (leftBracket === '[') {
        return [name, new Unit(val, bracketed)];
      }
    } catch (e) { }
  }
  return null;
}

export function deserialize(obj: any): typeof obj {
  if (isArray(obj)) {
    return obj.map(deserialize);
  }
  if (isObject(obj)) {
    return (obj instanceof PostFixed)
      ? obj
      : mapEntries(obj, ([key, val]) =>
        parsePostfixed(key, val) || [key, deserialize(val)]);
  }
  return obj;
}

export function serialize(obj: any): typeof obj {
  if (isArray(obj)) {
    return obj.map(serialize);
  }
  if (isObject(obj)) {
    return mapEntries(obj, ([key, val]) =>
      (val instanceof PostFixed)
        ? val.serialized(key)
        : [key, serialize(val)]);
  }
  return obj;
}

export function deepCopy<T>(obj: T): T {
  return obj
    ? cloneDeep(obj)
    : obj;
}
