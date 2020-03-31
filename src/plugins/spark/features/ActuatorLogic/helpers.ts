import { ActuatorLogicBlock, AnalogCompareOp, DigitalCompareOp } from './types';


export interface ExpressionError {
  index: number;
  message: string;
  indicator: string;
}

const prettyClause = {
  '(': '(',
  ')': ')',
  '^': 'XOR',
  '&': 'AND',
  '|': 'OR',
  '!': 'NOT',
};

const digitalPrettyOp: Record<DigitalCompareOp, string> = {
  [DigitalCompareOp.VALUE_IS]: 'state ==',
  [DigitalCompareOp.VALUE_ISNOT]: 'state !=',
  [DigitalCompareOp.DESIRED_IS]: 'desired ==',
  [DigitalCompareOp.DESIRED_ISNOT]: 'desired !=',
};

const analogPrettyOp: Record<AnalogCompareOp, string> = {
  [AnalogCompareOp.VALUE_LE]: 'value <=',
  [AnalogCompareOp.VALUE_GE]: 'value >=',
  [AnalogCompareOp.SETTING_LE]: 'setting <=',
  [AnalogCompareOp.SETTING_GE]: 'setting >=',
};

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

export const prettifyClause = (s: string): string =>
  prettyClause[s] ?? s;

export const prettifyDigitalOp = (op: DigitalCompareOp): string =>
  digitalPrettyOp[op];

export const prettifyAnalogOp = (op: AnalogCompareOp): string =>
  analogPrettyOp[op];

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
        return fmt(idx, 'Value followed by bracket');
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
        return fmt(idx, 'NOT clause followed by an operator');
      }
      if ('|&^'.includes(prev)) {
        return fmt(idx, 'Multiple operators');
      }
      if (' '.includes(prev)) {
        return fmt(idx, 'First symbol can\'t be an operator');
      }
    }

    if ('!' === s) {
      if ('?)'.includes(prev)) {
        return fmt(idx, 'Comparison followed by NOT');
      }
    }

    if ('?' === s) {
      if ('?' === prev) {
        return fmt(idx, 'Multiple comparison statements');
      }
      if (')'.includes(prev)) {
        return fmt(idx, 'Closing bracket followed by comparison');
      }
    }

    prev = s;
  }

  const lastIdx = str.length - 1;

  if ('&|^!'.includes(prev)) {
    return fmt(lastIdx, 'Invalid trailing character');
  }

  if (balance !== 0) {
    return fmt(lastIdx, 'Missing closing bracket');
  }

  return null;
}

export function comparisonCheck(expr: string, block: ActuatorLogicBlock): ExpressionError | null {
  const numDigital = block.data.digital.length;
  const numAnalog = block.data.analog.length;
  for (let idx = 0; idx < expr.length; idx++) {
    const s = expr[idx];
    if (isDigital(s) && digitalIdx(s) >= numDigital) {
      return fmt(idx, `Unknown digital comparison '${s}'`);
    }
    if (isAnalog(s) && analogIdx(s) >= numAnalog) {
      return fmt(idx, `Unknown analog comparison '${s}'`);
    }
  }
  return null;
}
