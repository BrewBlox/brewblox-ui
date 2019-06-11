import { Link } from '@/helpers/units';
import { ConstraintsObj } from '@/plugins/spark/components/Constraints/ConstraintsBase';
import { ActuatorState,Block } from '@/plugins/spark/types';

export interface DigitalActuatorBlock extends Block {
  data: {
    hwDevice: Link;
    channel: number;
    state: ActuatorState;
    invert: boolean;
    constrainedBy: ConstraintsObj;
  };
}
