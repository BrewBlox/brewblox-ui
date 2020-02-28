import { Link, Unit } from '@/helpers/units';
import { AnalogConstraintsObj, Block } from '@/plugins/spark/types';

export interface ActuatorPwmData {
  actuatorId: Link;
  drivenActuatorId: Link;

  setting: number;
  desiredSetting: number;

  period: Unit;
  value: number;
  enabled: boolean;

  constrainedBy: AnalogConstraintsObj;
}

export interface ActuatorPwmBlock extends Block {
  data: ActuatorPwmData;
}
