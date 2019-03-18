import { Link } from '@/helpers/units';
import { Block } from '@/plugins/spark/state';
import { ConstraintsObj } from '../../components/Constraints/state';

export interface ActuatorOffsetBlock extends Block {
  data: {
    targetId: Link;
    referenceId: Link;
    referenceSettingOrValue: number;
    setting: number;
    value: number;
    constrainedBy: ConstraintsObj;
    enabled: boolean;
  };
}
