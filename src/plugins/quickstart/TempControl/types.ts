import { Link } from '@/shared-types';
import { Widget } from '@/store/dashboards';

import { PidConfig } from '../types';

export interface TempControlMode {
  id: string;
  title: string;
  setpoint: Link;
  coolConfig: PidConfig;
  heatConfig: PidConfig;
}

export interface TempControlConfig {
  serviceId: string | null;
  coolPid: Link | null;
  heatPid: Link | null;
  profile: Link;
  modes: TempControlMode[];
  activeMode: string | null;
}

export type TempControlWidget = Widget<TempControlConfig>;
