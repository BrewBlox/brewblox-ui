import Unit from '@/core/units/Unit';

import { BlockBase } from '../state';

export interface SetPointSimpleBlock extends BlockBase {
  type: 'SetPointSimple';
  setting: Unit;
}
