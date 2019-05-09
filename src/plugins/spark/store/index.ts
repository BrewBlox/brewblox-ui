import Vue from 'vue';
import store from '@/store';
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators';
import { Block, CompatibleBlocks, UnitAlternatives, UserUnits, SystemStatus, BlockLink } from '../state';
import { Link } from '@/helpers/units';
// import { registerService } from '@/helpers/dynamic-store';
// import { Service } from '@/store/services/state';
// import { RootStore } from '@/store/state';
// import { Module } from 'vuex';
// import { actions } from './actions';
// import { getters } from './getters';
// import { mutations } from './mutations';
// import { SparkState } from './state';

// const module: Module<SparkState, {}> = {
//   actions,
//   getters,
//   mutations,
//   namespaced: true,
//   state: () => ({
//     blocks: {},
//     units: {},
//     unitAlternatives: {},
//     compatibleBlocks: {},
//     discoveredBlocks: [],
//     updateSource: null,
//     lastStatus: null,
//   }),
// };

// export const register =
//   async (store: RootStore, service: Service): Promise<void> =>
//     registerService(store, service.id, module);

@Module({ store, namespaced: true, dynamic: true, name: 'spark' })
export class SparkModule extends VuexModule {
  public blocks: Record<string, Block> = {};
  public units: UserUnits = {};
  public unitAlternatives: UnitAlternatives = {};
  public compatibleBlocks: CompatibleBlocks = {};
  public discoveredBlocks: string[] = [];
  public updateSource: EventSource | null = null;
  public lastStatus: SystemStatus | null = null;

  public get blockIds(): string[] {
    return Object.keys(this.blocks);
  }

  public get blockValues(): Block[] {
    return Object.values(this.blocks);
  }

  public get drivenChains(): string[][] {
    const output: string[][] = [];

    const drivenBlocks: { [driven: string]: string[] } =
      this.blockValues
        .reduce(
          (acc, block: Block) => {
            Object.values(block.data)
              .filter((obj: any) => obj instanceof Link && obj.driven && obj.id)
              .forEach((obj: any) => {
                const existing = acc[obj.id] || [];
                acc[obj.id] = [...existing, block.id];
              });
            return acc;
          },
          {},
        );

    const generateChains =
      (chain: string[], latest: string): string[][] => {
        const additional: string[] = drivenBlocks[latest];
        if (!additional) {
          return [[...chain, latest]];
        }
        return additional
          .filter(id => !chain.includes(id))
          .reduce(
            (chains: string[][], id: string) => [...chains, ...generateChains([...chain, latest], id)],
            [],
          );
      };

    return Object.keys(drivenBlocks)
      .reduce((acc, k) => ([...acc, ...generateChains([], k)]), output);
  }

  public get blockLinks(): BlockLink[] {
    const linkArray = new Array<{ source: string; target: string; relation: string[] }>();
    const findRelations =
      (source: string, relation: string[], val: any): typeof linkArray => {
        if (val instanceof Link) {
          if (val.id === null || source === 'DisplaySettings') {
            return linkArray;
          }
          return [{
            source: source,
            target: val.toString(),
            relation: relation,
          }];
        }
        if (val instanceof Object) {
          return Object.entries(val)
            .reduce(
              (acc, child: Record<string, any>) => {
                if (child[0].startsWith('driven')) {
                  return acc;
                }
                return [...acc, ...findRelations(source, [...relation, child[0]], child[1])];
              },
              linkArray
            );
        }
        return linkArray;
      };

    const allLinks = this.blockValues
      .reduce(
        (rel, block: Block) => ([...rel, ...findRelations(block.id, [], block.data)]),
        linkArray);
    return allLinks;
  }

  public get blockById(): (serviceId: string, id: string, type?: string) => Block {
    return (serviceId: string, id: string, type?: string) => {
      const block = this.blocks[id];
      if (!block) {
        throw new Error(`Block ${id} not found in service ${serviceId}`);
      }
      if (block && type && block.type !== type) {
        throw new Error(`Invalid block ${id}: ${block.type} !== ${type}`);
      }
      return block;
    };
  }
}

export default getModule(SparkModule);
