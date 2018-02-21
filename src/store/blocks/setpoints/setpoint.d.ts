import { BlockBase } from '../state';

export interface SetPoint extends BlockBase {
  value: number;
}

export interface SetPointBlock extends SetPoint {
  type: 'setpoint';
}
