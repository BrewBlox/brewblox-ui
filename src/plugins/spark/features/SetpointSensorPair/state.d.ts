import { Link, Unit } from '@/helpers/units';
import { Block } from '@/plugins/spark/state';

export interface SetpointSensorPairBlock extends Block {
  data: {
    sensorId: Link;
    setting: Unit;
    value: Unit;
    settingEnabled: boolean;
  };
}
