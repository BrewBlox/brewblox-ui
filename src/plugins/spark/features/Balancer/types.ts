import { BlockBase } from '@/plugins/spark/types';

export interface BalancedActuator {
  id: number;
  requested: number;
  granted: number;
}

export interface BalancerData {
  clients: BalancedActuator[];
}

export interface BalancerBlock extends BlockBase {
  type: 'Balancer';
  data: BalancerData;
}
