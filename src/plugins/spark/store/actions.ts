import { saveService } from '@/store/services/actions';
import { Service } from '@/store/services/state';
import { RootStore } from '@/store/state';
import { Block, UserUnits } from '../state';
import { BlocksContext } from './state';
import { dispatch } from '@/helpers/dynamic-store';
import {
  clearBlocks as clearBlocksInApi,
  createBlock as createBlockInApi,
  deleteBlock as deleteBlockInApi,
  fetchBlock as fetchBlockInApi,
  fetchBlocks as fetchBlocksInApi,
  persistBlock as persistBlockInApi,
  fetchUnits as fetchUnitsInApi,
  persistUnits as persistUnitsInApi,
  fetchUnitAlternatives as fetchUnitAlternativesInApi,
  fetchCompatibleBlocks as fetchCompatibleBlocksInApi,
  validateService as validateServiceInApi,
  fetchDiscoveredBlocks as fetchDiscoveredBlocksInApi,
} from './api';
import {
  sparkServiceById,
  discoveredBlocks,
} from './getters';
import {
  addBlock as addBlockInStore,
  mutateBlock as mutateBlockInStore,
  removeBlock as removeBlockInStore,
  setUnits as setUnitsInStore,
  setUnitAlternatives as setUnitAlternativesInStore,
  setCompatibleBlocks as setCompatibleBlocksInStore,
  setDiscoveredBlocks as setDiscoveredBlocksInStore,
  setBlocks as setBlocksInStore,
} from './mutations';

const actions = {
  fetchBlock: async (context: BlocksContext, block: Block) => {
    mutateBlockInStore(context, block.serviceId, { ...block, isLoading: true });
    const fetchedBlock = await fetchBlockInApi(block);
    mutateBlockInStore(context, block.serviceId, { ...fetchedBlock, isLoading: false });
  },

  createBlock: async (context: BlocksContext, block: Block) => {
    addBlockInStore(context, block.serviceId, { ...block, isLoading: true });
    const createdBlock = await createBlockInApi(block);
    mutateBlockInStore(context, block.serviceId, { ...createdBlock, isLoading: false });
  },

  saveBlock: async (context: BlocksContext, block: Block) => {
    mutateBlockInStore(context, block.serviceId, { ...block, isLoading: true });
    const savedBlock = await persistBlockInApi(block);
    mutateBlockInStore(context, block.serviceId, { ...savedBlock, isLoading: false });
  },

  removeBlock: async (context: BlocksContext, block: Block) => {
    mutateBlockInStore(context, block.serviceId, { ...block, isLoading: true });
    await deleteBlockInApi(block);
    removeBlockInStore(context, block.serviceId, block.id);
  },
};

export const fetchBlock = dispatch(actions.fetchBlock);
export const createBlock = dispatch(actions.createBlock);
export const saveBlock = dispatch(actions.saveBlock);
export const removeBlock = dispatch(actions.removeBlock);

export const updateProfileNames = (store: RootStore, id: string, names: string[]) => {
  const existing = sparkServiceById(store, id);
  saveService(store, {
    ...existing,
    config: {
      ...existing.config,
      profileNames: names,
    },
  });
};

export const fetchBlocks = async (store: RootStore, serviceId: string) =>
  setBlocksInStore(store, serviceId, await fetchBlocksInApi(serviceId));

export const clearBlocks = async (store: RootStore, service: Service) => {
  await clearBlocksInApi(service.id);
  await fetchBlocks(store, service.id);
};

export const fetchUnits = async (store: RootStore, serviceId: string) =>
  setUnitsInStore(store, serviceId, await fetchUnitsInApi(serviceId));

export const saveUnits = async (store: RootStore, serviceId: string, units: UserUnits) =>
  setUnitsInStore(store, serviceId, await persistUnitsInApi(serviceId, units));

export const fetchUnitAlternatives = async (store: RootStore, serviceId: string) =>
  setUnitAlternativesInStore(store, serviceId, await fetchUnitAlternativesInApi(serviceId));

export const fetchCompatibleBlocks = async (store: RootStore, serviceId: string, type: string) =>
  setCompatibleBlocksInStore(
    store,
    serviceId,
    { type, ids: await fetchCompatibleBlocksInApi(serviceId, type) },
  );

export const fetchDiscoveredBlocks = async (store: RootStore, serviceId: string) => {
  const newIds = await fetchDiscoveredBlocksInApi(serviceId);
  setDiscoveredBlocksInStore(store, serviceId, [...discoveredBlocks(store, serviceId), ...newIds]);
};

export const clearDiscoveredBlocks = async (store: RootStore, serviceId: string) =>
  setDiscoveredBlocksInStore(store, serviceId, []);

export const fetchAll = async (store: RootStore, service: Service) =>
  Promise.all([
    fetchDiscoveredBlocks(store, service.id),
    fetchBlocks(store, service.id),
    fetchUnits(store, service.id),
    fetchUnitAlternatives(store, service.id),
  ]);

export const update = async (store: RootStore, service: Service) =>
  Promise.all([
    fetchDiscoveredBlocks(store, service.id),
    fetchBlocks(store, service.id),
  ]);

export const validateService = async (serviceId: string) =>
  validateServiceInApi(serviceId);

export default actions;
