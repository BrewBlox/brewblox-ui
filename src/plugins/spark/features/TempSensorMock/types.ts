import { Unit } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

export interface Fluctuation {
  amplitude: Unit; // DeltaTemp
  period: Unit; // Time
}

export interface TempSensorMockData {
  value: Unit; // readonly Temp
  connected: boolean;
  setting: Unit; // Temp
  fluctuations: Fluctuation[];
}

export interface TempSensorMockBlock extends Block {
  data: TempSensorMockData;
}
