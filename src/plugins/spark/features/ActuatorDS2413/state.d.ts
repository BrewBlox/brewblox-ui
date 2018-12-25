import { Link } from '@/helpers/units';
import { ConstraintsObj } from '@/plugins/spark/components/Constraints/state';
import { Block } from '@/plugins/spark/state';

export interface ActuatorDS2413Block extends Block {
  data: {
    hwDevice: Link;
    channel: number;
    state: number;
    invert: boolean;
    constrainedBy: ConstraintsObj;
  };
}
