import { Unit } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

export interface MutexData {
  differentActuatorWait: Unit;
}

export interface MutexBlock extends Block {
  data: MutexData;
}
