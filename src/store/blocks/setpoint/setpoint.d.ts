import { BlockBase } from '../state';

export interface SetPoint extends BlockBase {
  setting: number;
}

export interface SetPointBlock extends SetPoint {
  type: 'setpoint';
}
