export const uniqueFilter = (val: any, idx: number, coll: any[]) =>
  coll.indexOf(val) === idx;

export const objectSorter = (key: string) =>
  ((a: any, b: any) => a[key] - b[key]);

export const objectStringSorter = (key: string) =>
  (a: any, b: any) => {
    const left = a[key].toLowerCase();
    const right = b[key].toLowerCase();
    if (left < right) {
      return -1;
    }
    if (right > left) {
      return 1;
    }
    return 0;
  };

export const durationString = (durationMs: number) => {
  const secondsTotal = Number(durationMs) / 1000;
  const days = Math.floor(secondsTotal / 86400);
  const hours = Math.floor((secondsTotal - (days * 86400)) / 3600);
  const minutes = Math.floor((secondsTotal - (days * 86400) - (hours * 3600)) / 60);
  const seconds = Math.floor(secondsTotal - (days * 86400) - (hours * 3600) - (minutes * 60));
  return [
    [days, 'd'],
    [hours, 'h'],
    [minutes, 'm'],
    [seconds, 's'],
  ]
    .reduceRight((acc: string, [val, unit]) => (val ? `${val}${unit} ${acc}` : acc), '') || '0s';
};

export const spaceCased = (input: string) =>
  input
    .replace(/[_-]/, ' ')
    .replace(/([^^])([A-Z]+)/g, (_, v1, v2) => `${v1} ${v2.toLowerCase()}`);

export const snakeCased = (input: string) =>
  input
    .replace(/[ -]/, '_')
    .replace(/\.?([A-Z]+)/g, (_, v: string) => `_${v}`)
    .toLowerCase();

export const kebabCased = (input: string) =>
  input
    .replace(/[ _]/, '-')
    .replace(/\.?([A-Z]+)/g, (_, v: string) => `-${v}`)
    .toLowerCase();

export const camelCased = (input: string) =>
  input
    .replace(/[ -_](.)/, (_, v1) => v1.toUpperCase());
