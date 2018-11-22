import { Block } from '@/plugins/spark/state';
import { ConstraintsObj } from '@/plugins/spark/components/Constraints/Constraints';

export interface ActuatorPinBlock extends Block {
  data: {
    state: number;
    invert: boolean;
    constrainedBy: ConstraintsObj;
  };
}
