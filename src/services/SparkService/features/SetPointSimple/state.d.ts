import Unit from '@/helpers/units/Unit';

import { Block } from '@/services/SparkService/state';

export interface SetPointSimpleBlock extends Block {
  data: {
    setting: Unit;
  };
}
