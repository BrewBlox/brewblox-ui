import { Block } from '@/plugins/spark/state';

export interface ActuatorPinBlock extends Block {
  data: {
    state: number;
    pin: number;
    invert: boolean;
    constrainedBy: any[];
  };
}
