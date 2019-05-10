import { Link } from '@/helpers/units';
import { ConstraintsObj } from '@/plugins/spark/components/Constraints/types';
import { Block } from '@/plugins/spark/types';

export interface ActuatorDS2413Block extends Block {
  data: {
    hwDevice: Link;
    channel: number;
    state: number;
    invert: boolean;
    constrainedBy: ConstraintsObj;
  };
}
