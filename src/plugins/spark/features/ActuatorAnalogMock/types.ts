import { AnalogConstraintsObj, BlockBase } from '@/plugins/spark/types';

export interface ActuatorAnalogMockData {
  setting: number;
  desiredSetting: number;
  minSetting: number;
  maxSetting: number;
  value: number;
  minValue: number;
  maxValue: number;
  constrainedBy: AnalogConstraintsObj;
}

export interface ActuatorAnalogMockBlock extends BlockBase {
  type: 'ActuatorAnalogMock';
  data: ActuatorAnalogMockData;
}
