import { BlockBase } from '../state';

import Link from '@/core/units/Link';

export interface PIDSettings {
  kp: number;
  ti: number;
  td: number;
}

export interface PIDState {
  inputValue: number;
  inputSetting: number;
  outputValue: number;
  outputSetting: number;

  p: number;
  i: number;
  d: number;

  derivative: number;
  integral: number;
  error: number;
}

export interface PIDLinks {
  input: Link;
  output: Link;
}

export interface PIDFiltering {
  input: number;
  derivative: number;
}

export interface PID extends BlockBase {
  settings: PIDSettings;
  links: PIDLinks;
  filtering: PIDFiltering;
  state: PIDState;
}

export interface PIDUpdate extends BlockBase {
  settings: PIDSettings;
  links: PIDLinks;
  filtering: PIDFiltering;
}

export interface PIDStateUpdate extends BlockBase {
  state: PIDState;
}

export interface PIDBlock extends PID {
  type: 'Pid';
}
