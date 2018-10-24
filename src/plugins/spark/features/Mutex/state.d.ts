import { Block } from '@/plugins/spark/state';

export interface MutexBlock extends Block {
  data: {
    differentActuatorWait: number;
  };
}
