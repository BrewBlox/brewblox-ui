import { Link } from '@/helpers/units';
import { ConstraintsObj } from '@/plugins/spark/components/Constraints/ConstraintsBase';
import { Block } from '@/plugins/spark/types';

export interface ActuatorOffsetBlock extends Block {
  data: {
    targetId: Link;
    drivenTargetId: Link;
    referenceId: Link;
    referenceSettingOrValue: number;
    setting: number;
    value: number;
    constrainedBy: ConstraintsObj;
    enabled: boolean;
  };
}
