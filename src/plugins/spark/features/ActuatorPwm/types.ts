import { AnalogConstraintsObj, BlockBase } from '@/plugins/spark/types';
import { Link, Unit } from '@/plugins/spark/units';

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

export interface ActuatorPwmBlock extends BlockBase {
  type: 'ActuatorPwm';
  data: ActuatorPwmData;
}
