import { Block } from '@/plugins/spark/types';

export interface ActuatorAnalogMockBlock extends Block {
  data: {
    setting: number;
    minSetting: number;
    maxSetting: number;
    value: number;
    minValue: number;
    maxValue: number;
  };
}
