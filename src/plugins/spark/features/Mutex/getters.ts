import { blockValues, blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { MutexBlock } from './state';
import get from 'lodash/get';

export const typeName = 'Mutex';

export const getById =
  (store: RootStore, serviceId: string, id: string): MutexBlock =>
    blockById<MutexBlock>(store, serviceId, id, typeName);

export interface MutexBlocks {
  active: string;
  waiting: string[];
  idle: string[];
}

export const getMutexClients = (store: RootStore, serviceId: string, mutexId: string): MutexBlocks =>
  blockValues(store, serviceId)
    .reduce(
      (mutexed: MutexBlocks, block: any) => {
        const constraint = get(block, 'data.constrainedBy.constraints', [])
          .find(constraint => get(constraint, 'mutex.id') === mutexId);
        if (!constraint) {
          return mutexed;
        }
        if (block.data.state === 1) {
          return { ...mutexed, active: block.id };
        }
        if (constraint.limiting && constraint.mutex) {
          return { ...mutexed, waiting: [...mutexed.waiting, block.id] };
        }
        if (!constraint.limiting && constraint.mutex && block.data.state !== 1) {
          return { ...mutexed, idle: [...mutexed.idle, block.id] };
        }
      },
      {
        active: 'None',
        waiting: [],
        idle: [],
      },
    );
