import { getStoreAccessors } from 'vuex-typescript';

import { Block, BlocksState } from './state';
import { State as RootState, RootStore } from '../state';

const { read } = getStoreAccessors<BlocksState, RootState>('blocks');

const getters = {
  blocksById: (state: BlocksState): { [id: string]: Block } => state.byId,

  blockIds(state: BlocksState): string[] {
    return state.allIds;
  },

  allBlocks(state: BlocksState): Block[] {
    return state.allIds.map(id => state.byId[id]);
  },

  isFetching(state: BlocksState): boolean {
    return state.fetching;
  },
};

// exported getter accessors
export const allBlocks = read(getters.allBlocks);
export const blockIds = read(getters.blockIds);
const blocksById = read(getters.blocksById);
export const isFetching = read(getters.isFetching);
export const allBlockFromService = (store: RootStore, serviceId: string): Block[] =>
  allBlocks(store).filter(block => block.serviceId === serviceId);

export function blockById(store: RootStore, id: string, type?: string) {
  const block = blocksById(store)[id];
  if (!block) {
    throw new Error(`Block ${id} not found`);
  }
  if (type && block.type !== type) {
    throw new Error(`Invalid block: ${block.type} !== ${type}`);
  }
  return block;
};

export default getters;
