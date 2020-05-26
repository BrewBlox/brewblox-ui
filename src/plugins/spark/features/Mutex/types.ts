import { BlockBase } from '@/plugins/spark/types';
import { Unit } from '@/plugins/spark/units';

export interface MutexData {
  differentActuatorWait: Unit;
  waitRemaining: Unit;
}

export interface MutexBlock extends BlockBase {
  type: 'Mutex';
  data: MutexData;
}
