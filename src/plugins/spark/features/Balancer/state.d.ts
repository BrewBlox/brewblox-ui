import { Block } from '@/plugins/spark/state';
import { Link } from '@/helpers/units';

export interface BalancedActuator {
  id: Link;
  requested: number;
  granted: number;
}

export interface BalancerBlock extends Block {
  data: {
    clients: BalancedActuator[];
  };
}
