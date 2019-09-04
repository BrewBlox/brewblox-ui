import { Unit } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

export interface TempSensorMockData {
  value: Unit;
  connected: boolean;
}

export interface TempSensorMockBlock extends Block {
  data: TempSensorMockData;
}
