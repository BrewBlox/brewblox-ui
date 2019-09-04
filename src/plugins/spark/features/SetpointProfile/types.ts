import { Link, Unit } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

export interface Setpoint {
  time: number;
  temperature: Unit;
}

export interface SetpointProfileData {
  start: number;
  points: Setpoint[];
  enabled: boolean;
  targetId: Link;
  drivenTargetId: Link;
}

export interface SetpointProfileBlock extends Block {
  data: SetpointProfileData;
}
