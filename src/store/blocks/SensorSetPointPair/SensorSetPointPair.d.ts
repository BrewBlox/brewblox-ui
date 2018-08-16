import Link from '@/core/units/Link';

import { Block } from '@/store/blocks/state';

export interface SensorSetPointPairBlock extends Block {
  type: 'SensorSetPointPair';
  data: {
    sensor: Link;
    setpoint: Link;
  }
}
