import { BlockBase, DigitalConstraintsObj, DigitalState } from '@/plugins/spark/types';
import { Link } from '@/plugins/spark/units';

export interface DigitalActuatorData {
  hwDevice: Link;
  channel: number;
  desiredState: DigitalState;
  state: DigitalState;
  invert: boolean;
  constrainedBy: DigitalConstraintsObj;
}

export interface DigitalActuatorBlock extends BlockBase {
  type: 'DigitalActuator';
  data: DigitalActuatorData;
}
