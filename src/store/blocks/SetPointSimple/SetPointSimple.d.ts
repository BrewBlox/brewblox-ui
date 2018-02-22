import { BlockBase } from '../state';

export interface SetPointSimple extends BlockBase {
  setting: number;
}

export interface SetPointSimpleBlock extends SetPointSimple {
  type: 'setpoint';
}
