import Unit from '@/helpers/units/Unit';

import { Block } from '@/services/Spark/state';

export interface SetpointSimpleBlock extends Block {
  data: {
    setting: Unit;
  };
}
