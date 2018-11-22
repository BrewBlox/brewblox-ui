import { ConstraintsObj } from '@/plugins/spark/components/Constraints/state';
import { Block } from '@/plugins/spark/state';

export interface ActuatorPinBlock extends Block {
  data: {
    state: number;
    invert: boolean;
    constrainedBy: ConstraintsObj;
  };
}
