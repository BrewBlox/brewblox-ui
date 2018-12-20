import { Link, Unit } from '@/helpers/units';
import { Block } from '@/plugins/spark/state';

export interface SetpointSensorPairBlock extends Block {
  data: {
    setpointId: Link;
    sensorId: Link;
    setpointValue: Unit;
    sensorValue: Unit;
  };
}
