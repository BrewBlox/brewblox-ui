import fromObject from './fromObject';

const extractUnit = /^([a-zA-Z0-9_.\-[\]]+)\[([a-zA-Z]+)]$/;

function propertyNameWithoutUnit(name: string): string {
  const matched = name.match(extractUnit);

  return matched ? matched[1] : name;
}

function parseProperty(key: string, inputObject: any): any {
  const input = inputObject[key];

  if (
    input !== null &&
    typeof input === 'object'
  ) {
    if (
      Object.keys(input).length === 2 &&
      'value' in input &&
      'unit' in input
    ) {
      try {
        return fromObject(input);
      } catch (e) {
        return input;
      }
    }

    return parseObject(input); // eslint-disable-line
  }

  return input;
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
