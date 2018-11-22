import { Link } from '@/helpers/units';
import { Block } from '@/plugins/spark/state';

export interface ActuatorOffsetBlock extends Block {
  data: {
    targetId: Link;
    targetValid: boolean;
    referenceId: Link;
    referenceValid: boolean;
    referenceSettingOrValue: number;
    setting: number;
    value: number;
    constrainedBy: any[];
  };
}
