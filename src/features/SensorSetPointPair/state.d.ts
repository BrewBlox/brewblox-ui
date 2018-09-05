import Link from '@/helpers/units/Link';

import { Block } from '@/store/blocks/state';

export interface SensorSetPointPairBlock extends Block {
  data: {
    sensor: Link;
    setpoint: Link;
  };
}
