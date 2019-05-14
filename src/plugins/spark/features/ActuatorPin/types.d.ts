import { ConstraintsObj } from '@/plugins/spark/components/Constraints/types';
import { Block } from '@/plugins/spark/types';

export interface ActuatorPinBlock extends Block {
  data: {
    state: number;
    invert: boolean;
    constrainedBy: ConstraintsObj;
  };
}
