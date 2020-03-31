import { AnalogCompareOp, DigitalCompareOp, EvalResult } from './types';

export const typeName = 'ActuatorLogic';

export const characterTitles = {
  '(': 'Sub-expression start',
  ')': 'Sub-expression end',
  '^': 'Logical XOR',
  '&': 'Logical AND',
  '|': 'Logical OR',
  '!': 'Logical NOT',
};

export const digitalOpTitles: Record<DigitalCompareOp, string> = {
  [DigitalCompareOp.VALUE_IS]: '== State',
  [DigitalCompareOp.VALUE_ISNOT]: '!= State',
  [DigitalCompareOp.DESIRED_IS]: '== Desired',
  [DigitalCompareOp.DESIRED_ISNOT]: '!= Desired',
};

export const analogOpTitles: Record<AnalogCompareOp, string> = {
  [AnalogCompareOp.VALUE_LE]: '<= Value',
  [AnalogCompareOp.VALUE_GE]: '>= Value',
  [AnalogCompareOp.SETTING_LE]: '<= Setting',
  [AnalogCompareOp.SETTING_GE]: '>= Setting',
};

export const evalResultTitles: Record<EvalResult, string> = {
  [EvalResult.FALSE]: 'Output is Inactive',
  [EvalResult.TRUE]: 'Output is Active',
  [EvalResult.INVALID_DIGITAL_OP]: 'Invalid operator',
  [EvalResult.INVALID_ANALOG_OP]: 'Invalid operator',
  [EvalResult.BLOCK_NOT_FOUND]: 'Block not found',
  [EvalResult.INVALID_EXPRESSION]: 'Invalid expression',
  [EvalResult.INVALID_DIG_COMPARE_IDX]: 'Invalid digital comparison',
  [EvalResult.INVALID_ANA_COMPARE_IDX]: 'Invalid analog comparison',
  [EvalResult.UNEXPECTED_END]: 'Unexpected end of expression',
  [EvalResult.UNEXPECTED_CLOSING_BRACKET]: 'Unexpected closing bracket',
  [EvalResult.MISSING_CLOSING_BRACKET]: 'Missing closing bracket',
  [EvalResult.UNEXPECTED_OPENING_BRACKET]: 'Unexpected opening bracket',
  [EvalResult.UNEXPECTED_CHARACTER]: 'Unexpected character',
  [EvalResult.EMPTY]: 'Expression empty: output is Inactive',
};

export const nonErrorResults: EvalResult[] = [
  EvalResult.EMPTY,
  EvalResult.FALSE,
  EvalResult.TRUE,
];
