type ResponseInput = {
  [key: string]: string[];
};

export default function convertToFlatPaths(input: ResponseInput): string[] {
  return Object.keys(input)
    .reduce(
      (acc: string[], key: string) => ([
        ...acc,
        ...input[key].map(item => `${key}/${item}`),
      ]),
      [],
    );
}
