import { Block } from '@/plugins/spark/state';

export interface ActuatorPinBlock extends Block {
  data: {
    state: number;
    invert: boolean;
    constrainedBy: any[];
  };
}
