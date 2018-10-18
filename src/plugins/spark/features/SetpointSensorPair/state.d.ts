import { Unit, Link } from '@/helpers/units';
import { Block } from '@/plugins/spark/state';

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
