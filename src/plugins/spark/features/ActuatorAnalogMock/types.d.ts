import { Block } from '@/plugins/spark/types';

export interface ActuatorAnalogMockData {
  setting: number;
  desiredSetting: number;
  minSetting: number;
  maxSetting: number;
  value: number;
  minValue: number;
  maxValue: number;
}

export interface ActuatorAnalogMockBlock extends Block {
  data: ActuatorAnalogMockData;
}
