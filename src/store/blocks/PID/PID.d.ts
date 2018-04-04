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
}

export interface PIDBlock extends PID {
  type: 'PID';
}
