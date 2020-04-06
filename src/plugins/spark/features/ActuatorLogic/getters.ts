import { DigitalState } from '../../types';
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

export const digitalStateTitles: Record<DigitalState, string> = {
  [DigitalState.Active]: 'ON',
  [DigitalState.Inactive]: 'OFF',
  [DigitalState.Unknown]: 'UNKNOWN',
};

export const digitalOpTitles: Record<DigitalCompareOp, string> = {
  [DigitalCompareOp.VALUE_IS]: 'Measured state ==',
  [DigitalCompareOp.VALUE_ISNOT]: 'Measured state !=',
  [DigitalCompareOp.DESIRED_IS]: 'Desired state ==',
  [DigitalCompareOp.DESIRED_ISNOT]: 'Desired state !=',
};

export const analogOpTitles: Record<AnalogCompareOp, string> = {
  [AnalogCompareOp.VALUE_LE]: 'Measured value <=',
  [AnalogCompareOp.VALUE_GE]: 'Measured value >=',
  [AnalogCompareOp.SETTING_LE]: 'Setting <=',
  [AnalogCompareOp.SETTING_GE]: 'Setting >=',
};

export const evalResultTitles: Record<EvalResult, string> = {
  [EvalResult.FALSE]: 'Result is OFF',
  [EvalResult.TRUE]: 'Result is ON',
  [EvalResult.EMPTY]: 'Expression empty: result is OFF',
  [EvalResult.EMPTY_SUBSTRING]: 'Empty sub-expression',
  [EvalResult.INVALID_DIGITAL_OP]: 'Invalid operator',
  [EvalResult.INVALID_ANALOG_OP]: 'Invalid operator',
  [EvalResult.BLOCK_NOT_FOUND]: 'Block not found',
  [EvalResult.INVALID_ANA_COMPARE_IDX]: 'Invalid analog comparison',
  [EvalResult.INVALID_DIG_COMPARE_IDX]: 'Invalid digital comparison',
  [EvalResult.UNEXPECTED_CLOSING_BRACKET]: 'Unexpected closing bracket',
  [EvalResult.MISSING_CLOSING_BRACKET]: 'Missing closing bracket',
  [EvalResult.UNEXPECTED_OPENING_BRACKET]: 'Unexpected opening bracket',
  [EvalResult.UNEXPECTED_CHARACTER]: 'Unexpected character',
  [EvalResult.UNEXPECTED_COMPARISON]: 'Unexpected comparison',
  [EvalResult.UNEXPECTED_OPERATOR]: 'Unexpected operator',
};

export const nonErrorResults: EvalResult[] = [
  EvalResult.EMPTY,
  EvalResult.FALSE,
  EvalResult.TRUE,
];
