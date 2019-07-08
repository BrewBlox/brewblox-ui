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
  const checked = Array.isArray(val)
    ? val[0]
    : val;

  if (checked instanceof Unit) {
    return checked.notation;
  }
  return null;
}

export function serializedPropertyName(key: string, inputObject: any): string {
  const input = inputObject[key];
  const checked = Array.isArray(input)
    ? input[0]
    : input;

  if (checked instanceof Unit) {
    return `${key}[${checked.unit}]`;
  }

  if (checked instanceof Link) {
    return `${key}${checked.postfix}`;
  }

  return key;
}

interface DisplayNameType { [key: string]: string }

export function postfixedDisplayNames(displayNames: DisplayNameType, inputObject: any): DisplayNameType {
  const retv: DisplayNameType = {};

  for (let key in displayNames) {
    const serializedKey = serializedPropertyName(key, inputObject);
    const unit = objectUnit(inputObject[key]);
    const name = displayNames[key];
    retv[serializedKey] = unit ? `${name} [${unit}]` : name;
  }
  return retv;
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

export function deepCopy<T>(obj: T): T {
  return obj
    ? deserialize(JSON.parse(JSON.stringify(serialize(obj))))
    : obj;
}

function nullish(val: any): boolean {
  return val === null || val === undefined;
}

export function isSubSet(small: Record<string, any>, big: Record<string, any>): boolean {
  return Object.entries(small)
    .every(([key, smallV]) => {
      const bigV = big[key];
      if (nullish(smallV) !== nullish(bigV)) {
        return false;
      }
      if (smallV instanceof Unit || smallV instanceof Link) {
        return smallV.isEqual(bigV);
      }
      if (typeof smallV === 'number' && typeof bigV === 'number') {
        return smallV.toFixed(2) === bigV.toFixed(2);
      }
      return smallV === bigV;
    });
}
