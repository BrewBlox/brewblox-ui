import { AnalogCompareOp, DigitalCompareOp, DigitalState, EvalResult } from '@/plugins/spark/types';

export const characterTitles = {
  '(': 'Sub-expression start',
  ')': 'Sub-expression end',
  '^': 'Logical XOR',
  '&': 'Logical AND',
  '|': 'Logical OR',
  '!': 'Logical NOT',
};

export const digitalStateTitles: Record<DigitalState, string> = {
  ['Active']: 'ON',
  ['Inactive']: 'OFF',
  ['Unknown']: 'UNKNOWN',
};

export const digitalOpTitles: Record<DigitalCompareOp, string> = {
  ['VALUE_IS']: 'Measured state ==',
  ['VALUE_ISNOT']: 'Measured state !=',
  ['DESIRED_IS']: 'Desired state ==',
  ['DESIRED_ISNOT']: 'Desired state !=',
};

export const analogOpTitles: Record<AnalogCompareOp, string> = {
  ['VALUE_LE']: 'Measured value <=',
  ['VALUE_GE']: 'Measured value >=',
  ['SETTING_LE']: 'Setting <=',
  ['SETTING_GE']: 'Setting >=',
};

export const evalResultTitles: Record<EvalResult, string> = {
  ['FALSE']: 'Result is OFF',
  ['TRUE']: 'Result is ON',
  ['EMPTY']: 'Expression empty: result is OFF',
  ['EMPTY_SUBSTRING']: 'Empty sub-expression',
  ['INVALID_DIGITAL_OP']: 'Invalid operator',
  ['INVALID_ANALOG_OP']: 'Invalid operator',
  ['BLOCK_NOT_FOUND']: 'Block not found',
  ['INVALID_ANA_COMPARE_IDX']: 'Invalid analog comparison',
  ['INVALID_DIG_COMPARE_IDX']: 'Invalid digital comparison',
  ['UNEXPECTED_CLOSING_BRACKET']: 'Unexpected closing bracket',
  ['MISSING_CLOSING_BRACKET']: 'Missing closing bracket',
  ['UNEXPECTED_OPENING_BRACKET']: 'Unexpected opening bracket',
  ['UNEXPECTED_CHARACTER']: 'Unexpected character',
  ['UNEXPECTED_COMPARISON']: 'Unexpected comparison',
  ['UNEXPECTED_OPERATOR']: 'Unexpected operator',
};

export const nonErrorResults: EvalResult[] = [
  'EMPTY',
  'FALSE',
  'TRUE',
];
