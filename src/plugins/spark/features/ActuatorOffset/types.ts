import { Link } from '@/helpers/units';
import { AnalogConstraintsObj, Block } from '@/plugins/spark/types';

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

export interface ActuatorOffsetBlock extends Block {
  data: ActuatorOffsetData;
}
