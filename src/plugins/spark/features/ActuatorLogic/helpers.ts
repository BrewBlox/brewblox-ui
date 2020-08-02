import { bloxQty } from '@/helpers/bloxfield';
import { isCompatible } from '@/plugins/spark/helpers';
import { ActuatorLogicBlock, AnalogCompare, BlockIntfType, DigitalCompare } from '@/plugins/spark/types';

import { analogOpTitles, digitalOpTitles, digitalStateTitles } from './getters';
import { ExpressionError } from './types';

export const keyCode = (s: string): number =>
  s.charCodeAt(0);

export const codeKey = (c: number): string =>
  String.fromCharCode(c);

export const digitalStart = keyCode('a');
export const digitalEnd = keyCode('z');
export const analogStart = keyCode('A');
export const analogEnd = keyCode('Z');

export const digitalIdx = (s: string): number =>
  keyCode(s) - digitalStart;

export const analogIdx = (s: string): number =>
  keyCode(s) - analogStart;

export const digitalKey = (c: number): string =>
  codeKey(c + digitalStart);

export const analogKey = (c: number): string =>
  codeKey(c + analogStart);

export const isDigital = (s: string): boolean =>
  digitalStart <= keyCode(s) && keyCode(s) <= digitalEnd;

export const isAnalog = (s: string): boolean =>
  analogStart <= keyCode(s) && keyCode(s) <= analogEnd;

export const isKey = (s: string): boolean =>
  isDigital(s) || isAnalog(s);

export const sanitize = (expression: string): string =>
  expression.replace(/[^a-zA-Z\(\)\^\|!&]/g, '');

const fmt = (index: number, message: string): ExpressionError => ({
  index,
  message,
  indicator: '-'.repeat(index) + '^',
});

export function syntaxCheck(expression: string): ExpressionError | null {
  // Check for ? characters before we use them as generic comparison character
  const questionIdx = expression.indexOf('?');
  if (questionIdx >= 0) {
    return fmt(questionIdx, 'Invalid character \'?\'');
  }

  const str = expression.replace(/[a-zA-Z]/g, '?');

  let balance = 0;
  let prev = ' ';

  for (let idx = 0; idx < str.length; idx++) {
    const s = str[idx];

    if (!'()&|^!?'.includes(s)) {
      return fmt(idx, `Invalid character '${s}'`);
    }

    if ('(' === s) {
      balance += 1;
      if ('?)'.includes(prev)) {
        return fmt(idx, 'Comparison followed by bracket');
      }
    }

    if (')' === s) {
      balance -= 1;
      if (balance < 0) {
        return fmt(idx, 'Too many closing brackets');
      }
      if ('('.includes(prev)) {
        return fmt(idx, 'Empty brackets');
      }
    }

    if ('|&^'.includes(s)) {
      if ('!'.includes(prev)) {
        return fmt(idx, '! character followed by an operator');
      }
      if ('|&^'.includes(prev)) {
        return fmt(idx, 'Multiple operators');
      }
      if (' '.includes(prev)) {
        return fmt(idx, 'First character can\'t be an operator');
      }
    }

    if ('!' === s) {
      if ('?)'.includes(prev)) {
        return fmt(idx, 'Comparison followed by ! character');
      }
    }

    if ('?' === s) {
      if ('?' === prev) {
        return fmt(idx, 'Multiple comparison characters');
      }
      if (')'.includes(prev)) {
        return fmt(idx, 'Closing bracket followed by comparison');
      }
    }

    prev = s;
  }

  if ('&|^!'.includes(prev)) {
    return fmt(str.length - 1, 'Invalid trailing character');
  }

  if (balance !== 0) {
    return fmt(str.length - 1, 'Missing closing bracket');
  }

  return null;
}

type ComparisonData = Pick<ActuatorLogicBlock['data'], 'expression' | 'digital' | 'analog'>;

export function comparisonCheck(data: ComparisonData): ExpressionError | null {
  const numDigital = data.digital.length;
  const numAnalog = data.analog.length;
  for (let idx = 0; idx < data.expression.length; idx++) {
    const s = data.expression[idx];
    if (isDigital(s) && digitalIdx(s) >= numDigital) {
      return fmt(idx, `Unknown digital comparison '${s}'`);
    }
    if (isAnalog(s) && analogIdx(s) >= numAnalog) {
      return fmt(idx, `Unknown analog comparison '${s}'`);
    }
  }
  return null;
}

/**
 * Whenever a comparison is removed from data.digital / data.analog,
 * all other comparisons are shifted down. This changes their comparison ref key.
 *
 * This function updates the expression to take this change into account.
 * All "later" refs are shifted one down. Eg. C -> B.
 *
 * All references to the removed key are replaced with the invalid character '?'.
 *
 * @param expression Logic operator expression
 * @param key Removed comparison
 * @returns the updated expression
 */
export function shiftRemainingComparisons(expression: string, key: string): string {
  if (!isKey(key)) {
    return expression;
  }
  const code = keyCode(key);
  const end = isDigital(key) ? digitalEnd : analogEnd;
  return expression
    .split('')
    .map(v => v === key ? '?' : v)
    .map(keyCode)
    .map(v => code < v && v <= end ? v - 1 : v)
    .map(codeKey)
    .join('');
}

export function prettyDigital(cmp: DigitalCompare): string {
  return `${digitalOpTitles[cmp.op]} ${digitalStateTitles[cmp.rhs]}`;
}

export function prettyAnalog(cmp: AnalogCompare, blockType: string | null, tempUnit: string): string {
  const rhs = isCompatible(blockType, BlockIntfType.SetpointSensorPairInterface)
    ? bloxQty(cmp.rhs, 'degC').to(tempUnit).toString()
    : `${cmp.rhs}%`;

  return `${analogOpTitles[cmp.op]} ${rhs}`;
}
