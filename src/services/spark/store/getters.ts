import { map } from 'lodash';

import { getStoreAccessors } from 'vuex-typescript';

import { State as RootState, RootStore } from '@/store/state';
import { serviceById } from '@/store/services/getters';

import { BlocksState, BlocksContext } from './state';
import { spark, Block } from '../state';

const defaultProfileNames = [
  'P1',
  'P2',
  'P3',
  'P4',
  'P5',
  'P6',
  'P7',
  'P8',
];

export const typeName: string = 'spark';

const { read } = getStoreAccessors<BlocksState, RootState>(typeName);

const getters = {
  blocks: (state: BlocksState): { [id: string]: Block } => state.blocks,

  blockIds(state: BlocksState): string[] {
    return map(state.blocks, (_: Block, key: string) => key);
  },

  allBlocks(state: BlocksState): Block[] {
    return map(state.blocks, (block: Block) => block);
  },

  isFetching(state: BlocksState): boolean {
    return state.fetching;
  },
};

const blocksById = read(getters.blocks);

export const blockIds = read(getters.blockIds);
export const allBlocks = read(getters.allBlocks);
export const isFetching = read(getters.isFetching);

export function blockById<T extends Block>(store: RootStore, id: string, type?: string): T {
  const block = blocksById(store)[id];
  if (!block) {
    throw new Error(`Block ${id} not found`);
  }
  if (block && type && block.type !== type) {
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

export const getById = (store: RootStore, id: string) =>
  serviceById<spark>(store, id, typeName);

export const getConfigById = (store: RootStore, id: string) =>
  getById(store, id).config || {};

export const profileNames = (store: RootStore, id: string) => {
  const configNames = getConfigById(store, id).profileNames || [];
  return [
    ...configNames.slice(0, defaultProfileNames.length),
    ...defaultProfileNames.slice(configNames.length),
  ];
};
