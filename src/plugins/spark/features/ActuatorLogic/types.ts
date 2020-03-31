import { Link } from '@/helpers/units';
import { Block, DigitalState } from '@/plugins/spark/types';

export enum DigitalCompareOp {
  VALUE_IS = 0,
  VALUE_ISNOT = 1,
  DESIRED_IS = 10,
  DESIRED_ISNOT = 11,
}

export enum AnalogCompareOp {
  VALUE_LE = 0,
  VALUE_GE = 1,
  SETTING_LE = 10,
  SETTING_GE = 11,
}

export enum CombineOp {
  OR = 0,
  AND = 1,
  OR_NOT = 2,
  AND_NOT = 3,
  XOR = 4,
}

export enum EvalResult {
  FALSE = 0,
  TRUE = 1,
  INVALID_DIGITAL_OP = 2,
  INVALID_ANALOG_OP = 3,
  BLOCK_NOT_FOUND = 4,
  INVALID_EXPRESSION = 5,
  INVALID_DIG_COMPARE_IDX = 6,
  INVALID_ANA_COMPARE_IDX = 7,
  UNEXPECTED_END = 8,
  UNEXPECTED_CLOSING_BRACKET = 9,
  MISSING_CLOSING_BRACKET = 10,
  UNEXPECTED_OPENING_BRACKET = 11,
  UNEXPECTED_CHARACTER = 12,
  EMPTY = 13,
}

export interface DigitalCompare {
  op: DigitalCompareOp;
  result: EvalResult;
  id: Link;
  rhs: DigitalState;
}

export interface AnalogCompare {
  op: AnalogCompareOp;
  result: EvalResult;
  id: Link;
  rhs: number;
}

export interface ActuatorLogicData {
  enabled: boolean;
  result: EvalResult; // readonly
  errorPos: number;
  targetId: Link;
  digital: DigitalCompare[];
  analog: AnalogCompare[];
  expression: string; // a-zA-Z&|^!()
}

export interface ActuatorLogicBlock extends Block {
  data: ActuatorLogicData;
}