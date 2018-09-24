import { saveService } from '@/store/services/actions';
import { Service } from '@/store/services/state';
import { RootStore } from '@/store/state';

import { Block } from '../state';
import { BlocksContext } from './state';
import { dispatch } from '@/helpers/dynamic-store';

import {
  clearBlocks as clearBlocksInApi,
  createBlock as createBlockInApi,
  deleteBlock as deleteBlockInApi,
  fetchBlock as fetchBlockInApi,
  fetchBlocks as fetchBlocksInApi,
  persistBlock as persistBlockInApi,
} from './api';

import { sparkServiceById } from './getters';

import {
  addBlock as addBlockInStore,
  mutateBlock as mutateBlockInStore,
  mutateFetching as mutateFetchingInStore,
  removeBlock as removeBlockInStore,
  clearBlocks as clearBlocksInStore,
} from './mutations';

const actions = {
  async fetchBlock(context: BlocksContext, block: Block) {
    mutateBlockInStore(context, block.serviceId, { ...block, isLoading: true });
    const fetchedBlock = await fetchBlockInApi(block);
    mutateBlockInStore(context, block.serviceId, { ...fetchedBlock, isLoading: false });
  },

  async createBlock(context: BlocksContext, block: Block) {
    addBlockInStore(context, block.serviceId, { ...block, isLoading: true });
    const createdBlock = await createBlockInApi(block);
    mutateBlockInStore(context, block.serviceId, { ...createdBlock, isLoading: false });
    return createdBlock;
  },

  async saveBlock(context: BlocksContext, block: Block) {
    mutateBlockInStore(context, block.serviceId, { ...block, isLoading: true });
    const savedBlock = await persistBlockInApi(block);
    mutateBlockInStore(context, block.serviceId, { ...savedBlock, isLoading: false });
  },

  async removeBlock(context: BlocksContext, block: Block) {
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

export const fetchBlocks = async (store: RootStore, service: Service) => {
  mutateFetchingInStore(store, service.id, true);
  const fetched = await fetchBlocksInApi(service);
  clearBlocksInStore(store, service.id);
  fetched.forEach(block => addBlockInStore(store, service.id, block));
  mutateFetchingInStore(store, service.id, false);
};

export const clearBlocks = async (store: RootStore, service: Service) => {
  await clearBlocksInApi(service.id);
  await fetchBlocks(store, service);
};

export default actions;
