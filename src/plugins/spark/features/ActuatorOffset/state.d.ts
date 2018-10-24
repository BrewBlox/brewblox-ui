import { Block } from '@/plugins/spark/state';
import { Link } from '@/helpers/units';

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
