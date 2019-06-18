import { Link, Unit } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

export interface SetpointSensorPairData {
  sensorId: Link;
  setting: Unit;
  value: Unit;
  settingEnabled: boolean;
  storedSetting: Unit;
}

export interface SetpointSensorPairBlock extends Block {
  data: SetpointSensorPairData;
}
