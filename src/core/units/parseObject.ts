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
    return parseObject(input); // eslint-disable-line
  }

  const matched = key.match(extractUnit);

  if (matched) {
    try {
      return fromObject(input, matched[2]);
    } catch (e) {
      return input;
    }
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
