import Unit from './Unit';
import valueToUnit from './convertUnit';

const extractUnit = /^([a-zA-Z0-9_.\-[\]]+)\[([a-zA-Z]+)]$/;

export function propertyNameWithoutUnit(name: string): string {
  const matched = name.match(extractUnit);

  return matched ? matched[1] : name;
}

function propertyNameWithUnit(key: string, inputObject: any): string {
  const input = inputObject[key];

  if (input instanceof Unit) {
    return `${key}[${input.unit}]`;
  }

  return key;
}

export function convertToUnit(key: string, value: any): Unit {
  const matched = key.match(extractUnit);

  if (matched) {
    try {
      return valueToUnit(value, matched[2]);
    } catch (e) {
      return value;
    }
  }

  return value;
}

function deserializeProperty(key: string, inputObject: any): any {
  const input = inputObject[key];

  if (Array.isArray(input)) {
    return input.map(item => convertToUnit(key, item)); // eslint-disable-line
  }

  if (
    input !== null &&
    typeof input === 'object'
  ) {
    return deserialize(input); // eslint-disable-line
  }

  return convertToUnit(key, input);
}

export function deserialize(input: any): any {
  return Object.keys(input)
    .reduce(
      (acc, key) => ({
        ...acc,
        [propertyNameWithoutUnit(key)]: deserializeProperty(key, input),
      }),
      {},
    );
}

function serializeProperty(key: string, inputObject: any): any {
  const input = inputObject[key];

  if (input instanceof Unit) {
    return input.value;
  }

  if (typeof input === 'object') {
    return serialize(input); // eslint-disable-line
  }

  return input;
}

export function serialize(input: any): any {
  return Object.keys(input)
    .reduce(
      (acc, key) => ({
        ...acc,
        [propertyNameWithUnit(key, input)]: serializeProperty(key, input),
      }),
      {},
    );
}
