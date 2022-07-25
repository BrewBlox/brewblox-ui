import { describe, expect, it } from 'vitest';
import { makeRuleValidator, suggestId } from '../rules';

describe('InputRule validation', () => {
  it('Should generate a rule validator', () => {
    const rules: InputRule[] = [
      (v) => v > 2 || 'Value is <= 2',
      (v) => v < 10 || 'Value is >= 10',
      (v) => v > 5 || 'Value is <= 5',
    ];

    const validator = makeRuleValidator(rules);
    const resultValidator = makeRuleValidator(rules, 'result');
    const errorValidator = makeRuleValidator(rules, 'error');

    expect(validator(1)).toBe(false);
    expect(validator(2)).toBe(false);
    expect(validator(5)).toBe(false);
    expect(validator(10)).toBe(false);
    expect(validator(6)).toBe(true);

    expect(resultValidator(1)).toBe(false);
    expect(resultValidator(6)).toBe(true);

    expect(errorValidator(1)).toBe('Value is <= 2');
    expect(errorValidator(5)).toBe('Value is <= 5');
    expect(errorValidator(10)).toBe('Value is >= 10');
    expect(errorValidator(6)).toBe(null);
  });

  it('Should suggest valid IDs', () => {
    const rules: InputRule[] = [(v) => v === 'name-10' || 'next please!'];

    const validator = makeRuleValidator(rules);

    expect(suggestId('name', validator)).toBe('name-10');
    expect(suggestId('name', () => true)).toBe('name');
    expect(() => suggestId('name', () => false)).toThrowError(
      'Max suggestions exceeded',
    );
  });
});
