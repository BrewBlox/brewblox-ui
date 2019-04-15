import { Unit, Link } from '@/helpers/units';
import { Block } from '@/plugins/spark/state';

export interface Setpoint {
  time: number;
  temperature: Unit;
}

export interface SetpointProfileBlock extends Block {
  data: {
    points: Setpoint[];
    enabled: boolean;
    targetId: Link;
  };
}
