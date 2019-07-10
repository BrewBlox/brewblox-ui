import { Link, Unit } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

export enum FilterChoice {
  FilterNoFiltering = 0,
  Filter15s = 1,
  Filter45s = 2,
  Filter90s = 3,
  Filter3m = 4,
  Filter10m = 5,
  Filter30m = 6,
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
