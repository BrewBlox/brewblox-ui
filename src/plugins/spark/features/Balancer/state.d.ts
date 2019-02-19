import { Block } from '@/plugins/spark/state';

export interface BalancedActuator {
  id: number;
  requested: number;
  granted: number;
}

export interface BalancerBlock extends Block {
  data: {
    clients: BalancedActuator[];
  };
}
