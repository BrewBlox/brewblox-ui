import get from 'lodash/get';

import { sparkStore } from '@/plugins/spark/store';

export const typeName = 'Balancer';

export const getClients =
  (serviceId: string, balancerId: string): { [balanceId: string]: string } =>
    sparkStore.blockValues(serviceId)
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
