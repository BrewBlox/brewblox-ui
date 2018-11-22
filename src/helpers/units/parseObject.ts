import Link from './Link';
import Unit from './Unit';

// "not brackets", then a left bracket, then more "not brackets", then right bracket
const extractUnit = /^([^[<]+)([[<])([^\]>]*)[\]>]$/;

export function propertyNameWithoutUnit(name: string): string {
  const matched = name.match(extractUnit);
  return matched ? matched[1] : name;
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
    return `${key}<${input[0].type}>`;
  }

  if (input instanceof Link) {
    return `${key}<${input.type}>`;
  }

  return key;
}

export function convertToUnit(key: string, value: any): Unit | Link {
  const matched = key.match(extractUnit);

  if (matched) {
    const [, , leftBracket, bracketed] = matched;
    try {
      if (leftBracket === '<') {
        return new Link(value, bracketed);
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
