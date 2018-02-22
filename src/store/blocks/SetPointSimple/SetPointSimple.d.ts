import { BlockBase } from '../state';

export interface SetPointSimple extends BlockBase {
  settings: {
    value: number,
  },
}

export interface SetPointSimpleBlock extends SetPointSimple {
  type: 'SetPointSimple';
}
