import { AnalogConstraintsObj, BlockBase } from '@/plugins/spark/types';
import { Link } from '@/plugins/spark/units';

export enum OffsetSettingOrValue {
  Setting = 0,
  Value = 1,
}

export interface ActuatorOffsetData {
  enabled: boolean;
  desiredSetting: number;
  referenceSettingOrValue: OffsetSettingOrValue;

  targetId: Link;
  drivenTargetId: Link;
  referenceId: Link;

  setting: number;
  value: number;

  constrainedBy: AnalogConstraintsObj;
};

export interface ActuatorOffsetBlock extends BlockBase {
  type: 'ActuatorOffset';
  data: ActuatorOffsetData;
}
