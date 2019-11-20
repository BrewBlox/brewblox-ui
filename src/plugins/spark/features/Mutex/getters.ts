import get from 'lodash/get';

import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

export const typeName = 'Mutex';

export interface MutexBlocks {
  active: string[];
  waiting: string[];
  idle: string[];
}

export const getMutexClients = (serviceId: string, mutexId: string): MutexBlocks =>
  sparkStore.blockValues(serviceId)
    .reduce(
      (mutexed: MutexBlocks, block: Block) => {
        const constraint = get(block, 'data.constrainedBy.constraints', [])
          .find(constraint => get(constraint, 'mutex.id') === mutexId);
        if (!constraint) {
          return mutexed;
        }
        if (block.data.state === 1) {
          mutexed.active.push(block.id);
        }
        else if (constraint.limiting && constraint.mutex) {
          mutexed.waiting.push(block.id);
        }
        else if (!constraint.limiting && constraint.mutex && block.data.state !== 1) {
          mutexed.idle.push(block.id);
        }
        return mutexed;
      },
      {
        active: [],
        waiting: [],
        idle: [],
      },
    );
