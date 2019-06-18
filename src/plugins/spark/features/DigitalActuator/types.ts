import { Link } from '@/helpers/units';
import { ConstraintsObj } from '@/plugins/spark/components/Constraints/ConstraintsBase';
import { Block, DigitalState } from '@/plugins/spark/types';

export interface DigitalActuatorData {
  hwDevice: Link;
  channel: number;
  desiredState: DigitalState;
  state: DigitalState;
  invert: boolean;
  constrainedBy: ConstraintsObj;
}

export interface DigitalActuatorBlock extends Block {
  data: DigitalActuatorData;
}
