import { Block } from '@/services/Spark/state';

export interface ActuatorAnalogMockBlock extends Block {
  data: {
    valid: boolean;
    setting: number;
    minSetting: number;
    maxSetting: number;
    value: number;
    minValue: number;
    maxValue: number;
  };
}
