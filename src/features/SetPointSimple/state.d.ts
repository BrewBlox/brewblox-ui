import Unit from '@/helpers/units/Unit';

import { Block } from '@/store/blocks/state';

export interface SetPointSimpleBlock extends Block {
  data: {
    setting: Unit;
  }
}
