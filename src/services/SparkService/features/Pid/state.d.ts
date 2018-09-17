import { Block } from '@/services/SparkService/state';

import Link from '@/helpers/units/Link';

export interface PidSettings {
  kp: number;
  ti: number;
  td: number;
}

export interface PidState {
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

export interface PidLinks {
  input: Link;
  output: Link;
}

export interface PidFiltering {
  input: number;
  derivative: number;
}

export interface PidBlock extends Block {
  data: {
    settings: PidSettings;
    links: PidLinks;
    filtering: PidFiltering;
    state: PidState;
  };
}
