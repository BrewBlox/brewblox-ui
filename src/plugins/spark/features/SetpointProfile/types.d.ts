import { Unit, Link } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

export interface Setpoint {
  time: number;
  temperature: Unit;
}

export interface SetpointProfileBlock extends Block {
  data: {
    start: number;
    points: Setpoint[];
    enabled: boolean;
    targetId: Link;
    drivenTargetId: Link;
  };
}
