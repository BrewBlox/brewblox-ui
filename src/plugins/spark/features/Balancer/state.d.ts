import { Link } from '@/helpers/units';
import { Block } from '@/plugins/spark/state';

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
