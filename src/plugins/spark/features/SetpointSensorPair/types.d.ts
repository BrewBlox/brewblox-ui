import { Link, Unit } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

export interface SetpointSensorPairBlock extends Block {
  data: {
    sensorId: Link;
    setting: Unit;
    value: Unit;
    settingEnabled: boolean;
    storedSetting: Unit;
  };
}
