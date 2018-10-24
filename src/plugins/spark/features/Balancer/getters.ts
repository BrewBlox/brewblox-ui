import { RootStore } from '@/store/state';
import { blockById } from '@/plugins/spark/store/getters';
import { BalancerBlock } from './state';

export const typeName = 'Balancer';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<BalancerBlock>(store, serviceId, id, typeName);
