import { read } from '@/helpers/dynamic-store';
import { serviceById } from '@/store/services/getters';
import { RootState, RootStore } from '@/store/state';
import { GetterTree } from 'vuex';
import { Block, CompatibleBlocks, Spark, UnitAlternatives, UserUnits, SystemStatus } from '../state';
import { SparkState } from './state';

const defaultGroupNames = [
  'Group1',
  'Group2',
  'Group3',
  'Group4',
  'Group5',
  'Group6',
  'Group7',
  // Ignore system block
];

export const typeName: string = 'Spark';

export const getters: GetterTree<SparkState, RootState> = {
  blocks: (state: SparkState): { [id: string]: Block } => state.blocks,
  blockIds: (state: SparkState): string[] => Object.keys(state.blocks),
  blockValues: (state: SparkState): Block[] => Object.values(state.blocks),
  units: (state: SparkState): UserUnits => state.units,
  unitAlternatives: (state: SparkState): UnitAlternatives => state.unitAlternatives,
  compatibleBlocks: (state: SparkState): CompatibleBlocks => state.compatibleBlocks,
  discoveredBlocks: (state: SparkState): string[] => state.discoveredBlocks,
  savepoints: (state: SparkState): string[] => state.savepoints,
  updateSource: (state: SparkState): EventSource | null => state.updateSource,
  lastStatus: (state: SparkState): SystemStatus | null => state.lastStatus,
};

export const blocks = read(getters.blocks);
export const blockIds = read(getters.blockIds);
export const blockValues = read(getters.blockValues);
export const units = read(getters.units);
export const unitAlternatives = read(getters.unitAlternatives);
export const compatibleBlocks = read(getters.compatibleBlocks);
export const discoveredBlocks = read(getters.discoveredBlocks);
export const savepoints = read(getters.savepoints);
export const updateSource = read(getters.updateSource);
export const lastStatus = read(getters.lastStatus);

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
    .filter((block: Block) => !type || block.type === type) as T[];
}

export const sparkServiceById = (store: RootStore, id: string) =>
  serviceById<Spark>(store, id, typeName);

export const sparkConfigById = (store: RootStore, id: string): any =>
  sparkServiceById(store, id).config || {};

export const groupNames = (store: RootStore, id: string) => {
  const configNames = sparkConfigById(store, id).groupNames || [];
  return [
    ...configNames.slice(0, defaultGroupNames.length),
    ...defaultGroupNames.slice(configNames.length),
  ];
};
