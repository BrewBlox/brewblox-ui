import { Link, Unit } from '@/helpers/units';
import { ConstraintsObj } from '@/plugins/spark/components/Constraints/state';
import { Block } from '@/plugins/spark/state';

export interface ActuatorPwmBlock extends Block {
  data: {
    actuatorId: Link;
    period: Unit;
    setting: number;
    value: number;
    constrainedBy: ConstraintsObj;
    enabled: boolean;
  };
}
