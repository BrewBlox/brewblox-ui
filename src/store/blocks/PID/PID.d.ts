import { BlockBase } from '../state';

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
  state: {
    inputValue: number,
    inputSetting: number,
    outputValue: number,
    outputSetting: number,

    p: number,
    i: number,
    d: number,

    derivative: number,
    integral: number,
    error: number,
  };
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
