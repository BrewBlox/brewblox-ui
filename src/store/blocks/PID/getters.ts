import { allBlockFromService } from '../getters';

import { PIDBlock } from './PID';

import { RootStore } from '../../state';

export function getAll(store: RootStore, serviceId: string): PIDBlock[] {
  return allBlockFromService(store, serviceId)
    .filter(block => block.type === 'PID') as PIDBlock[];
}
