import { Unit } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

export interface TempSensorOneWireData {
  value: Unit;
  offset: Unit;
  address: string;
}

export interface TempSensorOneWireBlock extends Block {
  data: TempSensorOneWireData;
}
