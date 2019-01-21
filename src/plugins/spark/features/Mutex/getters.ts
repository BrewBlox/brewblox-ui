import { blockValues, blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { MutexBlock } from './state';

export const typeName = 'Mutex';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<MutexBlock>(store, serviceId, id, typeName);

export const getMutexHolder = (store: RootStore, serviceId: string, mutexId: string) => {
  const mutexBlocks = blockValues(store, serviceId).filter(block =>
    (((block.data.constrainedBy || {}).constraints) || []).find(constraint =>
      (constraint.mutex || {}).id === mutexId));

  const activeBlock = mutexBlocks.find(block => block.data.state == 1);
  const waitingBlocks = mutexBlocks.filter(block => block.data.constrainedBy.constraints.find(
    constraint => constraint.limiting === true && constraint.mutex !== undefined));
  const idleBlocks = mutexBlocks.filter(block => block.data.constrainedBy.constraints.find(
    constraint => constraint.limiting === false
      && constraint.mutex !== undefined)
    && block.data.state !== 1);
  return {
    active: (activeBlock || {}).id || 'None',
    waiting: waitingBlocks.map(block => block.id),
    idle: idleBlocks.map(block => block.id),
  };
};
