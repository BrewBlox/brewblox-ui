import isString from 'lodash/isString';

type ValidationMode = 'result' | 'error';

/**
 * Creates a function to check whether a given value is valid.
 * Provided rules adhere to the Quasar rule style:
 * a list of functions that return true or an error string.
 *
 * If `mode` is 'result', the validator will return true if all rules passed, and false otherwise.
 * If `mode` is 'error', the validator will return the first error, and null otherwise.
 *
 * @param rules
 * @param mode
 */
export function makeRuleValidator(rules: InputRule[]): (val: any) => boolean;
export function makeRuleValidator(
  rules: InputRule[],
  mode: 'result',
): (val: any) => boolean;
export function makeRuleValidator(
  rules: InputRule[],
  mode: 'error',
): (val: any) => string | null;
export function makeRuleValidator(
  rules: InputRule[],
  mode?: ValidationMode,
): (val: any) => boolean | string | null {
  return (val) => {
    for (const rule of rules) {
      const res = rule(val);
      if (isString(res)) {
        return mode === 'error' ? res : false;
      }
    }
    // No errors found
    return mode === 'error' ? null : true;
  };
}

/**
 * Generates ID suggestions until one is considered valid.
 *
 * For the `id` 'name', these values will be checked:
 * - 'name'
 * - 'name-1'
 * - 'name-2'
 * - 'name-3'
 * ...
 * - 'name-100'
 *
 * If `id` already matches this pattern, the chain will resume.
 * For the `id` 'name-3', these values will be checked:
 * - 'name-3'
 * - 'name-1'
 * - 'name-2'
 * ...
 * - 'name-100'
 *
 * @param id
 * @param validate
 * @returns The first value where `validate(value)` is true.
 */
export function suggestId(
  id: string,
  validate: (val: string) => boolean,
): string {
  if (validate(id)) {
    return id;
  }

  const copyName = (i: number): string =>
    id.match(/-\d+$/) ? id.replace(/-\d+$/, `-${i}`) : `${id}-${i}`;

  let idx = 2;
  while (!validate(copyName(idx))) {
    idx += 1;
    if (idx > 100) {
      throw new Error('Max suggestions exceeded');
    }
  }

  return copyName(idx);
}
