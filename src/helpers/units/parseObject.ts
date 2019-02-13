import Link from './Link';
import Unit from './Unit';

// "not brackets",
// then a left bracket,
// then more "not brackets, not comma",
// then optional comma + "not brackets"
// then right bracket
const extractUnit = /^([^[<]+)([[<])([^\]>,]*),?([^\]>]*)[\]>]$/;

export function propertyNameWithoutUnit(name: string): string {
  const matched = name.match(extractUnit);
  return matched ? matched[1] : name;
}

export function objectUnit(val: any): string | null {
  if (Array.isArray(val) && val[0] instanceof Unit) {
    return val[0].notation;
  }
  if (val instanceof Unit) {
    return val.notation;
  }
  return null;
}

export function serializedPropertyName(key: string, inputObject: any): string {
  const input = inputObject[key];

  if (
    Array.isArray(input) &&
    input[0] instanceof Unit
  ) {
    return `${key}[${input[0].unit}]`;
  }

  if (input instanceof Unit) {
    return `${key}[${input.unit}]`;
  }

  if (
    Array.isArray(input) &&
    input[0] instanceof Link
  ) {
    return `${key}${input[0].postfix}`;
  }

  if (input instanceof Link) {
    return `${key}${input.postfix}`;
  }

  return key;
}

type DisplayNameType = { [key: string]: string };

export function postfixedDisplayNames(displayNames: DisplayNameType, inputObject: any): DisplayNameType {
  const displayNameReducer = (acc: DisplayNameType, [key, displayName]) => {
    const serializedKey = serializedPropertyName(key, inputObject);
    const unit = objectUnit(inputObject[key]);
    return { ...acc, [serializedKey]: unit ? `${displayName} [${unit}]` : displayName };
  };

  return Object.entries(displayNames)
    .reduce(displayNameReducer, {});
}

export function convertToUnit(key: string, value: any): Unit | Link {
  const matched = key.match(extractUnit);

  if (matched) {
    const [, , leftBracket, bracketed, driven] = matched;
    try {
      if (leftBracket === '<') {
        return new Link(value, bracketed, !!driven);
      }

      if (leftBracket === '[') {
        return new Unit(value, bracketed);
      }

      return value;
    } catch (e) {
      return value;
    }
  }

  return value;
}

function deserializeProperty(key: string, inputObject: any, input = inputObject[key]): any {
  if (
    input !== null &&
    typeof input === 'object'
  ) {
    return deserialize(input, key); // eslint-disable-line
  }

  return convertToUnit(key, input);
}

export function deserialize(input: any, prevKey: string = ''): any {
  if (Array.isArray(input)) {
    return input.map(item => deserializeProperty(prevKey, null, item));
  }

  return Object.keys(input)
    .reduce(
      (acc, key) => ({
        ...acc,
        [propertyNameWithoutUnit(key)]: deserializeProperty(key, input),
      }),
      {},
    );
}

function serializeProperty(key: string, inputObject: any, input = inputObject[key]): any {
  if (input instanceof Unit) {
    return input.value;
  }

  if (input instanceof Link) {
    return input.id;
  }

  if (input === null) {
    return input;
  }

  if (typeof input === 'object') {
    return serialize(input, key); // eslint-disable-line
  }

  return input;
}

export function serialize(input: any, prevKey: string = ''): any {
  if (Array.isArray(input)) {
    return input.map(item => serializeProperty(prevKey, null, item));
  }

  return Object.keys(input)
    .reduce(
      (acc, key) => ({
        ...acc,
        [serializedPropertyName(key, input)]: serializeProperty(key, input),
      }),
      {},
    );
}
