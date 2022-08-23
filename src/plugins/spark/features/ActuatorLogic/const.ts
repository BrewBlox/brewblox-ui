import { LogicResult } from 'brewblox-proto/ts';

export const characterTitles = {
  '(': 'Sub-expression start',
  ')': 'Sub-expression end',
  '^': 'Logical XOR',
  '&': 'Logical AND',
  '|': 'Logical OR',
  '!': 'Logical NOT',
};

export const nonErrorResults: LogicResult[] = [
  LogicResult.RESULT_EMPTY,
  LogicResult.RESULT_FALSE,
  LogicResult.RESULT_TRUE,
];
