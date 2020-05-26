import { BlockBase } from '@/plugins/spark/types';
import { Unit } from '@/plugins/spark/units';

export interface TempSensorOneWireData {
  value: Unit;
  offset: Unit;
  address: string;
}

export interface TempSensorOneWireBlock extends BlockBase {
  type: 'TempSensorOneWire';
  data: TempSensorOneWireData;
}
