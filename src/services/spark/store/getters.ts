import { getStoreAccessors, GetterHandler, GetAccessor } from 'vuex-typescript';

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

// Returns a function that wraps getting and returning the store accessor
// Practical result: all getter calls must now supply store + serviceId
// old = isFetching(this.$store)
// new = isFetching(this.$store, this.serviceId)
function read<TResult>(handler: GetterHandler<BlocksState, RootState, TResult>) {
  return (store: RootStore, serviceId: string): TResult =>
    getStoreAccessors<BlocksState, RootState>(serviceId).read(handler)(store);
}

const getters = {
  blocks: (state: BlocksState): { [id: string]: Block } => state.blocks,
  blockIds: (state: BlocksState): string[] => Object.keys(state.blocks),
  blockValues: (state: BlocksState): Block[] => Object.values(state.blocks),
  isFetching: (state: BlocksState): boolean => state.fetching,
};

export default getters;

export const blocks = read(getters.blocks);
export const blockIds = read(getters.blockIds);
export const blockValues = read(getters.blockValues);
export const isFetching = read(getters.isFetching);

export function blockById<T extends Block>(
  store: RootStore,
  serviceId: string,
  id: string,
  type?: string,
): T {
  const block = blocks(store, serviceId)[id];
  if (!block) {
    throw new Error(`Block ${id} not found`);
  }
  if (block && type && block.type !== type) {
    throw new Error(`Invalid block: ${block.type} !== ${type}`);
  }
  return block as T;
}

export function allBlocks<T extends Block>(
  store: RootStore,
  serviceId: string,
  type?: string,
): T[] {
  return blockValues(store, serviceId)
    .filter(block => !type || block.type === type) as T[];
}

export const sparkServiceById = (store: RootStore, id: string) =>
  serviceById<spark>(store, id, typeName);

export const sparkConfigById = (store: RootStore, id: string) =>
  sparkServiceById(store, id).config || {};

export const profileNames = (store: RootStore, id: string) => {
  const configNames = sparkConfigById(store, id).profileNames || [];
  return [
    ...configNames.slice(0, defaultProfileNames.length),
    ...defaultProfileNames.slice(configNames.length),
  ];
};
