import { read } from '@/helpers/dynamic-store';
import { RootStore } from '@/store/state';
import { serviceById } from '@/store/services/getters';

import { SparkState } from './state';
import { Spark, Block, UserUnits } from '../state';

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

export const typeName: string = 'Spark';

const getters = {
  isFetching: (state: SparkState): boolean => state.fetching,
  blocks: (state: SparkState): { [id: string]: Block } => state.blocks,
  blockIds: (state: SparkState): string[] => Object.keys(state.blocks),
  blockValues: (state: SparkState): Block[] => Object.values(state.blocks),
  units: (state: SparkState): UserUnits => state.units,
};

export default getters;

export const isFetching = read(getters.isFetching);
export const blocks = read(getters.blocks);
export const blockIds = read(getters.blockIds);
export const blockValues = read(getters.blockValues);
export const units = read(getters.units);

export function blockById<T extends Block>(
  store: RootStore,
  serviceId: string,
  id: string,
  type?: string,
): T {
  const block = blocks(store, serviceId)[id];
  if (!block) {
    throw new Error(`Block ${id} not found in service ${serviceId}`);
  }
  if (block && type && block.type !== type) {
    throw new Error(`Invalid block ${id}: ${block.type} !== ${type}`);
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
