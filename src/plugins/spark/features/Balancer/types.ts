import { Block } from '@/plugins/spark/types';

export interface BalancedActuator {
  id: number;
  requested: number;
  granted: number;
}

export interface BalancerData {
  clients: BalancedActuator[];
}

export interface BalancerBlock extends Block {
  data: BalancerData;
}
