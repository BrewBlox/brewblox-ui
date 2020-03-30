import { Link } from '@/helpers/units';
import { Block, DigitalState } from '@/plugins/spark/types';

export enum DigitalCompareOp {
  VALUE_IS = 0,
  VALUE_ISNOT = 1,
  DESIRED_IS = 2,
  DESIRED_ISNOT = 3,
}

export enum AnalogCompareOp {
  VALUE_LE = 0,
  VALUE_GE = 1,
  VALUE_LT = 2,
  VALUE_GT = 3,
  SETTING_LE = 10,
  SETTING_GE = 11,
  SETTING_LT = 12,
  SETTING_GT = 13,
}

export enum CombineOp {
  OR = 0,
  AND = 1,
  OR_NOT = 2,
  AND_NOT = 3,
  XOR = 4,
}

export interface DigitalCompare {
  op: DigitalCompareOp;
  id: Link;
  rhs: DigitalState;
}

export interface AnalogCompare {
  op: AnalogCompareOp;
  id: Link;
  threshold: number;
  rhs: number;
}

export interface ActuatorLogicData {
  enabled: boolean;
  result: boolean; // readonly
  targetId: Link;
  digital: DigitalCompare[];
  analog: AnalogCompare[];
  expression: string; // a-zA-Z&|^!()
}

export interface ActuatorLogicBlock extends Block {
  data: ActuatorLogicData;
}
