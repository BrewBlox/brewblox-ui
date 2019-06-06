import { Unit } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

export interface MutexBlock extends Block {
  data: {
    differentActuatorWait: Unit;
  };
}
