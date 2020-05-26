import { BlockBase } from '@/plugins/spark/types';
import { Unit } from '@/plugins/spark/units';

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

export interface TempSensorMockBlock extends BlockBase {
  type: 'TempSensorMock';
  data: TempSensorMockData;
}
