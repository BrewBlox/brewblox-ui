import Unit from '@/core/units/Unit';

import { Block } from '../state';

export interface SetPointSimpleBlock extends Block {
  type: 'SetPointSimple';
  data: {
    setting: Unit;
  }
}
