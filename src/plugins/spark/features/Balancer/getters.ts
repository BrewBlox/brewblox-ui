import { blockValues, blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { BalancerBlock } from './state';

export const typeName = 'Balancer';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<BalancerBlock>(store, serviceId, id, typeName);

export const getClients = (store: RootStore, serviceId: string, balancerId: string) => {
  const clientBlocks = blockValues(store, serviceId).filter( block => 
  (((block.data.constrainedBy || {}).constraints) || []).find( constraint => 
    ((constraint.balanced || {}).balancerId || {}).id === balancerId));
  let clientNames = {};
  clientBlocks.map( block => { 
    const constraint = block.data.constrainedBy.constraints.find(
      constraint => (constraint.balanced || {}).balancerId !== undefined );
      clientNames[constraint.balanced.id] = block.id;
  });      
  return clientNames;
};
