import { Link, Unit } from '@/helpers/units';
import { ConstraintsObj } from '@/plugins/spark/components/Constraints/ConstraintsBase';
import { Block } from '@/plugins/spark/types';

export interface ActuatorPwmData {
  actuatorId: Link;
  drivenActuatorId: Link;

  setting: number;
  desiredSetting: number;

  period: Unit;
  value: number;
  enabled: boolean;

  constrainedBy: ConstraintsObj;
}

export interface ActuatorPwmBlock extends Block {
  data: ActuatorPwmData;
}
