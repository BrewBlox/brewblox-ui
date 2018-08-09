import Unit from '@/core/units/Unit';

import { BlockBase } from '../state';

export interface SetPointSimple extends BlockBase {
  setting: Unit;
}

export interface SetPointSimpleBlock extends SetPointSimple {
  type: 'SetPointSimple';
}
