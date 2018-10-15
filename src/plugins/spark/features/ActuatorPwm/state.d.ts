import { Block } from '@/plugins/spark/state';
import Link from '@/helpers/units/Link';

export interface ActuatorPwmBlock extends Block {
  data: {
    actuatorId: Link;
    actuatorValid: boolean;
    period: number;
    setting: number;
    value: number;
    constrainedBy: any[];
  };
}
