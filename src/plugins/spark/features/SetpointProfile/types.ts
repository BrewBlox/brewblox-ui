import { BlockBase } from '@/plugins/spark/types';
import { Link, Unit } from '@/plugins/spark/units';

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

export interface SetpointProfileBlock extends BlockBase {
  type: 'SetpointProfile';
  data: SetpointProfileData;
}
