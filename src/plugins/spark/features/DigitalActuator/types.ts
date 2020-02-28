import { Link } from '@/helpers/units';
import { Block, DigitalConstraintsObj, DigitalState } from '@/plugins/spark/types';

export interface DigitalActuatorData {
  hwDevice: Link;
  channel: number;
  desiredState: DigitalState;
  state: DigitalState;
  invert: boolean;
  constrainedBy: DigitalConstraintsObj;
}

export interface DigitalActuatorBlock extends Block {
  data: DigitalActuatorData;
}
