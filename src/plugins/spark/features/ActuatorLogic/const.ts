import {
  AnalogCompareOp,
  DigitalCompareOp,
  DigitalState,
  LogicResult,
} from 'brewblox-proto/ts';

export const characterTitles = {
  '(': 'Sub-expression start',
  ')': 'Sub-expression end',
  '^': 'Logical XOR',
  '&': 'Logical AND',
  '|': 'Logical OR',
  '!': 'Logical NOT',
};

export const digitalStateTitles: Record<DigitalState, string> = {
  [DigitalState.STATE_ACTIVE]: 'ON',
  [DigitalState.STATE_INACTIVE]: 'OFF',
  [DigitalState.STATE_UNKNOWN]: 'UNKNOWN',
  [DigitalState.STATE_REVERSE]: 'REVERSED',
};

export const digitalOpTitles: Record<DigitalCompareOp, string> = {
  [DigitalCompareOp.OP_VALUE_IS]: 'Measured state ==',
  [DigitalCompareOp.OP_VALUE_IS_NOT]: 'Measured state !=',
  [DigitalCompareOp.OP_DESIRED_IS]: 'Desired state ==',
  [DigitalCompareOp.OP_DESIRED_IS_NOT]: 'Desired state !=',
};

export const analogOpTitles: Record<AnalogCompareOp, string> = {
  [AnalogCompareOp.OP_VALUE_LE]: 'Measured value <=',
  [AnalogCompareOp.OP_VALUE_GE]: 'Measured value >=',
  [AnalogCompareOp.OP_SETTING_LE]: 'Setting <=',
  [AnalogCompareOp.OP_SETTING_GE]: 'Setting >=',
};

export const logicResultTitles: Record<LogicResult, string> = {
  [LogicResult.RESULT_FALSE]: 'Result is OFF',
  [LogicResult.RESULT_TRUE]: 'Result is ON',
  [LogicResult.RESULT_EMPTY]: 'Expression empty: result is OFF',
  [LogicResult.RESULT_EMPTY_SUBSTRING]: 'Empty sub-expression',
  [LogicResult.RESULT_BLOCK_NOT_FOUND]: 'Block not found',
  [LogicResult.RESULT_INVALID_DIGITAL_OP]: 'Invalid operator',
  [LogicResult.RESULT_INVALID_ANALOG_OP]: 'Invalid operator',
  [LogicResult.RESULT_UNDEFINED_ANALOG_COMPARE]: 'Invalid analog comparison',
  [LogicResult.RESULT_UNDEFINED_DIGITAL_COMPARE]: 'Invalid digital comparison',
  [LogicResult.RESULT_UNEXPECTED_OPEN_BRACKET]: 'Unexpected opening bracket',
  [LogicResult.RESULT_UNEXPECTED_CLOSE_BRACKET]: 'Unexpected closing bracket',
  [LogicResult.RESULT_UNEXPECTED_CHARACTER]: 'Unexpected character',
  [LogicResult.RESULT_UNEXPECTED_COMPARISON]: 'Unexpected comparison',
  [LogicResult.RESULT_UNEXPECTED_OPERATOR]: 'Unexpected operator',
  [LogicResult.RESULT_MISSING_CLOSE_BRACKET]: 'Missing closing bracket',
};

export const nonErrorResults: LogicResult[] = [
  LogicResult.RESULT_EMPTY,
  LogicResult.RESULT_FALSE,
  LogicResult.RESULT_TRUE,
];
