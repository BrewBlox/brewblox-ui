import { map } from 'lodash';

import { getStoreAccessors } from 'vuex-typescript';

import { Block, BlocksState, BlocksContext } from './state';
import { State as RootState, RootStore } from '../state';

const { read } = getStoreAccessors<BlocksState, RootState>('blocks');

const getters = {
  blocksById: (state: BlocksState): { [id: string]: Block } => state.byId,

  blockIds(state: BlocksState): string[] {
    return map(state.byId, (_: Block, key: string) => key);
  },

  allBlocks(state: BlocksState): Block[] {
    return map(state.byId, (block: Block) => block);
  },

  isFetching(state: BlocksState): boolean {
    return state.fetching;
  },
};

const blocksById = read(getters.blocksById);

export const blockIds = read(getters.blockIds);
export const allBlocks = read(getters.allBlocks);
export const isFetching = read(getters.isFetching);

export function blockById<T extends Block>(store: RootStore, id: string, type?: string): T {
  const block = blocksById(store)[id];
  if (!block) {
    throw new Error(`Block ${id} not found`);
  }
  if (type && block.type !== type) {
    throw new Error(`Invalid block: ${block.type} !== ${type}`);
  }
  return block as T;
}

export function allBlocksFromService<T extends Block>(
  store: RootStore | BlocksContext,
  serviceId: string,
  type?: string,
): T[] {
  return allBlocks(store)
    .filter(block => block.serviceId === serviceId)
    .filter(block => !type || block.type === type) as T[];
}

export default getters;
