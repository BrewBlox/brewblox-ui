import { Link } from '@/helpers/units';
import { Block } from '@/plugins/spark/state';

export interface ActuatorOffsetBlock extends Block {
  data: {
    targetId: Link;
    referenceId: Link;
    referenceSettingOrValue: number;
    setting: number;
    value: number;
    constrainedBy: any[];
  };
}
