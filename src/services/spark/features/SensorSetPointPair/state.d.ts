import Link from '@/helpers/units/Link';

import { Block } from '@/services/spark/state';

export interface SensorSetPointPairBlock extends Block {
  data: {
    sensor: Link;
    setpoint: Link;
  };
}
