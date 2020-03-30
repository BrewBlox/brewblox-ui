
// const fmt = (idx: number, msg: string): string => `pos ${idx + 1}: ${msg}`;

const pretty = {
  '(': '(',
  ')': ')',
  '^': 'XOR',
  '&': 'AND',
  '|': 'OR',
  '!': 'NOT',
};

export const prettifySingle = (s: string): string | undefined => pretty[s];

export const sanitize = (expression: string): string =>
  expression.replace(/[^a-zA-Z\(\)\^\|!&]/g, '');


export interface ExpressionError {
  index: number;
  message: string;
}

const fmt = (index: number, message: string): ExpressionError => ({
  index,
  message,
});

export function syntaxCheck(expression: string): ExpressionError | null {
  const str = expression.replace(/[a-zA-Z]/g, '?');

  let balance = 0;
  let prev = ' ';

  for (let idx = 0; idx <= str.length; idx++) {
    const s = str[idx];

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
      if ('?'.includes(prev)) {
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

  if (balance !== 0) {
    return fmt(str.length - 1, 'Missing closing bracket');
  }

  return null;
}
