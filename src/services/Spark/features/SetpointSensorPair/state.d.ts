import Link from '@/helpers/units/Link';
import { Unit } from '@/helpers/units';

import { Block } from '@/services/Spark/state';

export interface SetpointSensorPairBlock extends Block {
  data: {
    setpointId: Link;
    sensorId: Link;

    setpointValid: boolean;
    sensorValid: boolean;

    setpointValue: Unit;
    sensorValue: Unit;
  };
}
