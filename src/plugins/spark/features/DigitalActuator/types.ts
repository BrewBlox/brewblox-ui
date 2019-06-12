import { Link } from '@/helpers/units';
import { ConstraintsObj } from '@/plugins/spark/components/Constraints/ConstraintsBase';
import { Block, DigitalState } from '@/plugins/spark/types';

export interface DigitalActuatorBlock extends Block {
  data: {
    hwDevice: Link;
    channel: number;
    state: DigitalState;
    invert: boolean;
    constrainedBy: ConstraintsObj;
  };
}
