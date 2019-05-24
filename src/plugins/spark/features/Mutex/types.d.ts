import { Block } from '@/plugins/spark/types';
import { Unit } from '@/helpers/units';

export interface MutexBlock extends Block {
  data: {
    differentActuatorWait: Unit;
  };
}
