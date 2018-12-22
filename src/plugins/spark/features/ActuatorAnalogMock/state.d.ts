import { Block } from '@/plugins/spark/state';

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
