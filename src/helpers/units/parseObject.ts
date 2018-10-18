import Unit from './Unit';
import Link from './Link';

// "not brackets", then a left bracket, then more "not brackets", then right bracket
const extractUnit = /^([^[<]+)([[<])([^\]>]*)[\]>]$/;

export function propertyNameWithoutUnit(name: string): string {
  const matched = name.match(extractUnit);
  return matched ? matched[1] : name;
}

function propertyNameWithUnit(key: string, inputObject: any): string {
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
    (Array.isArray(input) && input[0] instanceof Link) ||
    input instanceof Link
  ) {
    return `${key}<>`;
  }

  return key;
}

export function convertToUnit(key: string, value: any): Unit | Link {
  const matched = key.match(extractUnit);

  if (matched) {
    const [full, base, leftBracket, unit, rightBracket] = matched;
    try {
      console.log(matched);
      if (leftBracket === '<') {
        return new Link(value);
      }

      if (leftBracket === '[') {
        return new Unit(value, unit);
      }

      return value;
    } catch (e) {
      console.log(e);
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
        [propertyNameWithUnit(key, input)]: serializeProperty(key, input),
      }),
      {},
    );
}
