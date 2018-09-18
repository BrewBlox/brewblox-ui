import Unit from '@/helpers/units/Unit';

import { Block } from '@/services/spark/state';

export interface SetPointSimpleBlock extends Block {
  data: {
    setting: Unit;
  };
}
