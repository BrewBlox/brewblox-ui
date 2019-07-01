import { Link, Unit } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

export enum FilterChoice {
  Filter30s = 0,
  Filter1m = 1,
  Filter3m = 2,
  Filter5m = 3,
  Filter10m = 4,
  Filter20m = 5,
  Filter45m = 6,
}

export interface SetpointSensorPairData {
  sensorId: Link;

  value: Unit;
  valueUnfiltered: Unit;

  setting: Unit;
  storedSetting: Unit;
  settingEnabled: boolean;

  filter: FilterChoice;
  filterThreshold: Unit;
  resetFilter: boolean;
}

export interface SetpointSensorPairBlock extends Block {
  data: SetpointSensorPairData;
}
