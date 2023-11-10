import { Link } from 'brewblox-proto/ts';
import { Widget } from '@/store/widgets';
import { PidConfig } from '../types';

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
