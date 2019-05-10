import { Block } from '@/plugins/spark/types';

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
