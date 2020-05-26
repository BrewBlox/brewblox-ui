import { BlockBase, DigitalConstraintsObj, DigitalState } from '@/plugins/spark/types';
import { Link } from '@/plugins/spark/units';

export enum ValveState {
  Unknown = 0,
  Open = 1,
  Closed = 2,
  Opening = 3,
  Closing = 4,
  HalfOpenIdle = 5,
  InitIdle = 6,
}

export interface MotorValveData {
  hwDevice: Link;
  startChannel: number;
  desiredState: DigitalState;
  state: DigitalState;
  valveState: ValveState;
  constrainedBy: DigitalConstraintsObj;
}

export interface MotorValveBlock extends BlockBase {
  type: 'MotorValve';
  data: MotorValveData;
}
