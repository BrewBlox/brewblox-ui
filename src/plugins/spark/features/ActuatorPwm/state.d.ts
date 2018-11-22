import { Link } from '@/helpers/units';
import { ConstraintsObj } from '@/plugins/spark/components/Constraints/state';
import { Block } from '@/plugins/spark/state';

export interface ActuatorPwmBlock extends Block {
  data: {
    actuatorId: Link;
    actuatorValid: boolean;
    period: number;
    setting: number;
    value: number;
    constrainedBy: ConstraintsObj;
  };
}
