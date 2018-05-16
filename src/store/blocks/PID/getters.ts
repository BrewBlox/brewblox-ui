import { allBlocks } from '../getters';

import { PIDBlock } from './PID';

import { RootStore } from '../../state';

export function getAll(store: RootStore, serviceId: string): PIDBlock[] {
  return allBlocks(store)
    .filter(block => block.type === 'PID' &&
      block.serviceId === serviceId) as PIDBlock[];
}
