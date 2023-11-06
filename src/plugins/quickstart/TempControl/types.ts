import { PidConfig } from '../types';
import { Widget } from '@/store/widgets';
import { Link } from 'brewblox-proto/ts';

export interface TempControlMode {
  id: string;
  title: string;
  setpoint: Link;
  coolConfig: PidConfig | null;
  heatConfig: PidConfig | null;
}

export interface TempControlConfig {
  serviceId: string | null;
  coolPid: Link;
  heatPid: Link;
  profile: Link;
  modes: TempControlMode[];
  activeMode: string | null;
}

export type TempControlWidget = Widget<TempControlConfig>;
