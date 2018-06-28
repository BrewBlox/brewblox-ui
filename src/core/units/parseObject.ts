import { convertToUnit, propertyNameWithoutUnit } from './convertUnit';

function parseProperty(key: string, inputObject: any): any {
  const input = inputObject[key];

  if (
    input !== null &&
    typeof input === 'object'
  ) {
    return parseObject(input); // eslint-disable-line
  }

  return convertToUnit(key, input);
}

export default function parseObject(input: any): any {
  return Object.keys(input)
    .reduce(
      (acc, key) => ({
        ...acc,
        [propertyNameWithoutUnit(key)]: parseProperty(key, input),
      }),
      {},
    );
}
