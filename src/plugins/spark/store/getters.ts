import { read } from '@/helpers/dynamic-store';
import { Link } from '@/helpers/units';
import { serviceById } from '@/store/services/getters';
import { RootState, RootStore } from '@/store/state';
import forEach from 'lodash/forEach';
import { GetterTree } from 'vuex';

import { Block, CompatibleBlocks, Spark, SystemStatus, UnitAlternatives, UserUnits } from '../state';

import { SparkState } from './state';

const defaultGroupNames = [
  'Group1', 'Group2', 'Group3', 'Group4', 'Group5', 'Group6', 'Group7',
  // Ignore system block
];

export const typeName: string = 'Spark';

export const getters: GetterTree<SparkState, RootState> = {
  blocks: (state: SparkState): { [id: string]: Block } => state.blocks,
  blockIds: (state: SparkState): string[] => Object.keys(state.blocks),
  blockValues: (state: SparkState): Block[] => Object.values(state.blocks),
  units: (state: SparkState): UserUnits => state.units,
  unitAlternatives: (state: SparkState): UnitAlternatives =>
    state.unitAlternatives,
  compatibleBlocks: (state: SparkState): CompatibleBlocks =>
    state.compatibleBlocks,
  discoveredBlocks: (state: SparkState): string[] => state.discoveredBlocks,
  savepoints: (state: SparkState): string[] => state.savepoints,
  updateSource: (state: SparkState): EventSource | null => state.updateSource,
  lastStatus: (state: SparkState): SystemStatus | null => state.lastStatus,
  drivenChains: (state: SparkState): string[][] => {
    const drivenBlocks: { [driven: string]: string[] } =
      Object.values(state.blocks)
        .reduce(
          (acc, block: Block) => {
            Object.values(block.data)
              .filter(
                (obj: any) =>
                  obj instanceof Link && obj.driven && obj.id)
              .forEach((obj: any) => {
                const existing = acc[obj.id] || [];
                acc[obj.id] = [...existing, block.id];
              });
            return acc;
          },
          {},
        );
    const generateChains = (chain: string[], latest: string): string[][] => {
      const additional: string[] = drivenBlocks[latest];
      if (!additional) {
        return [[...chain, latest]];
      }
      return additional.filter(id => !chain.includes(id))
        .reduce(
          (chains: string[][], id: string) =>
            [...chains, ...generateChains([...chain, latest], id)],
          [],
        );
    };
    const output: string[][] = [];
    return Object.keys(drivenBlocks)
      .reduce((acc, k) => ([...acc, ...generateChains([], k)]), output);
  },
  blockLinks: (state: SparkState) => {
    const empty =  new Array<{ source: string, target: string, relation: string[] }>();
    const findRelations = (source: string, relation: string[], val: any) => {
      if (val instanceof Link) {
        if(val.id === null || source === "DisplaySettings"){
          return empty;
        }
        return [{
          source: source,
          target: val.toString(),
          relation: relation,
        }];
      }
      if (val instanceof Object){
        return Object.entries(val).reduce(
          (acc, child: Object) => {
            if(child[0].startsWith("driven")){
              return acc;
            }
            return [...acc, ...findRelations(source, [...relation, child[0]], child[1])];
          },
          empty
        );
      }
      return empty;
    };

    const allLinks = Object.values(state.blocks).reduce((rel, block: Block) => {
        return [...rel, ...findRelations(block.id, [], block.data) ];
      }, 
      empty
    );
    return allLinks;
  },
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
export const drivenChains = read(getters.drivenChains);
export const blockLinks = read(getters.blockLinks);

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
