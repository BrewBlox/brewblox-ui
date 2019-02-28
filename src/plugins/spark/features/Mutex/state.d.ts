import { Block } from '@/plugins/spark/state';
import { Unit } from '@/helpers/units';

export interface MutexBlock extends Block {
  data: {
    differentActuatorWait: Unit;
  };
}
