import { Block } from '@/plugins/spark/state';
import { Unit } from '@/helpers/units';

export interface Setpoint {
  time: number;
  temperature: Unit;
}

export interface SetpointProfileBlock extends Block {
  data: {
    points: Setpoint[];
  };
}
