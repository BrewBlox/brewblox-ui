import { convertToUnit, propertyNameWithoutUnit } from './convertUnit';

function parseProperty(key: string, inputObject: any): any {
  const input = inputObject[key];

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
        [propertyNameWithoutUnit(key)]: parseProperty(key, input),
      }),
      {},
    );
}

export function serialize(input: any): any {
  return input;
}
