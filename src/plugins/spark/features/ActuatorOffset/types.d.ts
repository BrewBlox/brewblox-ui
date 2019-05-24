import { Link } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';
import { ConstraintsObj } from '../../components/Constraints/types';

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
