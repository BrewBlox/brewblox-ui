type ResponseInput = {
  [key: string]: string[];
};

export function convertToFlatPaths(input: ResponseInput): string[] {
  return Object.keys(input)
    .reduce(
      (acc: string[], key: string) => ([
        ...acc,
        ...input[key].map(item => `${key}/${item}`),
      ]),
      [],
    );
}

export function getMetricsFromPath(input: string[], path: string = ''): string[] {
  return input
    .filter(item => item.indexOf(path) === 0)
    .map(item => item.substr(path.length === 0 ? 0 : path.length + 1))
    .map(item => item.split('/')[0])
    .reduce(
      (acc: string[], item) => {
        if (acc.indexOf(item) > -1) {
          return acc;
        }

        return [...acc, item];
      },
      [],
    );
}
