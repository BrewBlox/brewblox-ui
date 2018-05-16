import fromObject from './fromObject';

function parseProperty(input: any): any {
  if (typeof input === 'object') {
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
        [key]: parseProperty(input[key]),
      }),
      {},
    );
}
