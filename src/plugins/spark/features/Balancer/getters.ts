import { blockValues, blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { BalancerBlock } from './state';
import get from 'lodash/get';

export const typeName = 'Balancer';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<BalancerBlock>(store, serviceId, id, typeName);

export const getClients = (store: RootStore, serviceId: string, balancerId: string) =>
  blockValues(store, serviceId)
    .reduce(
      (clientNames, block) => {
        const constraint = get(block, 'data.constrainedBy.constraints', [])
          .find(constraint => get(constraint, 'balanced.balancerId.id') === balancerId);
        return constraint
          ? { ...clientNames, [constraint.balanced.id]: block.id }
          : clientNames;
      },
      {},
    );
