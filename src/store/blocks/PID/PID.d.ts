import { BlockBase } from '../state';

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

export interface PID extends BlockBase {
  settings: {
    kp: number,
    ti: number,
    td: number,
  };
  links: {
    input: string,
    output: string,
  };
  filtering: {
    input: number,
    derivative: number,
  };
  state: PIDState;
}

export interface PIDUpdate extends BlockBase {
  settings: {
    kp: number,
    ti: number,
    td: number,
  };
  links: {
    input: string,
    output: string,
  };
  filtering: {
    input: number,
    derivative: number,
  };
}

export interface PIDBlock extends PID {
  type: 'PID';
}
