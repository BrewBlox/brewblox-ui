import { read } from '@/helpers/dynamic-store';
import { RootStore } from '@/store/state';
import { serviceById } from '@/store/services/getters';

import { BlocksState } from './state';
import { Spark, Block } from '../state';

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
  serviceById<Spark>(store, id, typeName);

export const sparkConfigById = (store: RootStore, id: string) =>
  sparkServiceById(store, id).config || {};

export const profileNames = (store: RootStore, id: string) => {
  const configNames = sparkConfigById(store, id).profileNames || [];
  return [
    ...configNames.slice(0, defaultProfileNames.length),
    ...defaultProfileNames.slice(configNames.length),
  ];
};
