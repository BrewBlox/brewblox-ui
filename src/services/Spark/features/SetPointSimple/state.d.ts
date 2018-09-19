import Unit from '@/helpers/units/Unit';

import { Block } from '@/services/Spark/state';

export interface SetPointSimpleBlock extends Block {
  data: {
    setting: Unit;
  };
}
