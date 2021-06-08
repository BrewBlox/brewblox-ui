
export const isAbsoluteUrl =
  (val: string): boolean =>
    new RegExp('^(?:[a-z]+:)?//', 'i').test(val);
