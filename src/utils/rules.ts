import isString from 'lodash/isString';

export function makeRuleValidator(rules: InputRule[]): ((val: any) => boolean) {
  return val => rules.every(rule => !isString(rule(val)));
}

export function makeRuleErrorFinder(rules: InputRule[]): ((val: any) => string | null) {
  return val => {
    for (const rule of rules) {
      const res = rule(val);
      if (isString(res)) {
        return res;
      }
    }
    return null;
  };
}

export function suggestId(id: string, validate: (val: string) => boolean): string {
  if (validate(id)) {
    return id;
  }

  const copyName = (i: number): string =>
    id.match(/-\d+$/)
      ? id.replace(/-\d+$/, `-${i}`)
      : `${id}-${i}`;

  let idx = 2;
  while (!validate(copyName(idx))) {
    idx += 1;
    if (idx > 100) {
      throw new Error('Max suggestions exceeded');
    }
  }

  return copyName(idx);
}
