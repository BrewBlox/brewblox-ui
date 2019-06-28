import get from 'lodash/get';
import Vue from 'vue';
import { Action, Module, Mutation, VuexModule, getModule } from 'vuex-module-decorators';

import { Link } from '@/helpers/units';
import store from '@/store';
import dashboardStore from '@/store/dashboards';
import serviceStore from '@/store/services';

import {
  Block,
  BlockLink,
  BlockSpec,
  CompatibleTypes,
  Spark,
  SparkConfig,
  SystemStatus,
  UnitAlternatives,
  UserUnits,
} from '../types';
import {
  cleanUnusedNames as cleanUnusedNamesInApi,
  clearBlocks as clearBlocksInApi,
  createBlock as createBlockInApi,
  deleteBlock as deleteBlockInApi,
  fetchBlock as fetchBlockInApi,
  fetchBlocks as fetchBlocksInApi,
  fetchCompatibleTypes as fetchCompatibleTypesInApi,
  fetchDiscoveredBlocks as fetchDiscoveredBlocksInApi,
  fetchSystemStatus as fetchSystemStatusInApi,
  fetchUnitAlternatives as fetchUnitAlternativesInApi,
  fetchUnits as fetchUnitsInApi,
  fetchUpdateSource as fetchUpdateSourceInApi,
  persistBlock as persistBlockInApi,
  persistUnits as persistUnitsInApi,
  renameBlock as renameBlockInApi,
  serviceExport as serviceExportInApi,
  serviceImport as serviceImportInApi,
  validateService as validateServiceInApi,
} from './api';

// Note: we're ignoring the system group (group 8)
const defaultGroupNames = [
  'Group1', 'Group2', 'Group3', 'Group4', 'Group5', 'Group6', 'Group7',
];

const calculateDrivenChains = (blocks: Block[]): string[][] => {
  const output: string[][] = [];

  const drivenBlocks: { [driven: string]: string[] } =
    blocks
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
};

const calculateBlockLinks = (blocks: Block[]): BlockLink[] => {
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

  const allLinks = blocks
    .reduce(
      (rel, block: Block) => ([...rel, ...findRelations(block.id, [], block.data)]),
      linkArray);
  return allLinks;
};

interface SparkServiceState {
  blocks: Record<string, Block>;
  units: UserUnits;
  unitAlternatives: UnitAlternatives;
  compatibleTypes: Record<string, string[]>;
  discoveredBlocks: string[];
  updateSource: EventSource | null;
  lastStatus: SystemStatus | null;
}

@Module({ store, namespaced: true, dynamic: true, name: 'spark' })
export class SparkModule extends VuexModule {
  private services: Record<string, SparkServiceState> = {};

  public specs: Record<string, BlockSpec> = {};

  private get allBlockIds(): Record<string, string[]> {
    return Object.entries(this.services)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: Object.keys(v.blocks) }), {});
  }

  private get allBlockValues(): Record<string, Block[]> {
    return Object.entries(this.services)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: Object.values(v.blocks) }), {});
  }

  private get allDrivenChains(): Record<string, string[][]> {
    return Object.keys(this.services)
      .reduce((acc, id) => ({ ...acc, [id]: calculateDrivenChains(this.allBlockValues[id]) }), {});
  }

  private get allBlockLinks(): Record<string, BlockLink[]> {
    return Object.keys(this.services)
      .reduce((acc, id) => ({ ...acc, [id]: calculateBlockLinks(this.allBlockValues[id]) }), {});
  }

  public get specIds(): string[] {
    return Object.keys(this.specs);
  }

  public get specValues(): BlockSpec[] {
    return Object.values(this.specs);
  }

  public get serviceIds(): string[] {
    return Object.keys(this.services);
  }

  public get serviceAvailable(): (serviceId: string) => boolean {
    return serviceId => !!this.services[serviceId];
  }

  public get blocks(): (serviceId: string) => Record<string, Block> {
    return serviceId => this.services[serviceId].blocks;
  }

  public get blockIds(): (serviceId: string) => string[] {
    return serviceId => this.allBlockIds[serviceId];
  }

  public get blockValues(): (serviceId: string) => Block[] {
    return serviceId => this.allBlockValues[serviceId];
  }

  public get units(): (serviceId: string) => UserUnits {
    return serviceId => this.services[serviceId].units;
  }

  public get unitAlternatives(): (serviceId: string) => UnitAlternatives {
    return serviceId => this.services[serviceId].unitAlternatives;
  }

  public get compatibleTypes(): (serviceId: string) => CompatibleTypes {
    return serviceId => this.services[serviceId].compatibleTypes;
  }

  public get discoveredBlocks(): (serviceId: string) => string[] {
    return serviceId => this.services[serviceId].discoveredBlocks;
  }

  public get updateSource(): (serviceId: string) => EventSource | null {
    return serviceId => this.services[serviceId].updateSource;
  }

  public get lastStatus(): (serviceId: string) => SystemStatus | null {
    return serviceId => this.services[serviceId].lastStatus;
  }

  public get drivenChains(): (serviceId: string) => string[][] {
    return serviceId => this.allDrivenChains[serviceId];
  }

  public get blockLinks(): (serviceId: string) => BlockLink[] {
    return serviceId => this.allBlockLinks[serviceId];
  }

  public get blockById(): (serviceId: string, id: string, type?: string) => Block {
    return (serviceId: string, id: string, type?: string) => {
      const block = get(this.services, [serviceId, 'blocks', id]);
      if (!block) {
        throw new Error(`Block ${id} not found in service ${serviceId}`);
      }
      if (block && type && block.type !== type) {
        throw new Error(`Invalid block ${id}: ${block.type} !== ${type}`);
      }
      return block;
    };
  }

  public get tryBlockById(): (serviceId: string, id: string | null) => Block {
    return (serviceId: string, id: string | null) => {
      return id === null
        ? null
        : get(this.services, [serviceId, 'blocks', id], null);
    };
  }

  public get blocksByType(): (serviceId: string, type: string) => Block[] {
    return (serviceId: string, type: string) =>
      this.blockValues(serviceId).filter(block => block.type === type);
  }

  public get sparkServiceById(): (serviceId: string) => Spark {
    return serviceId => serviceStore.serviceById(serviceId, 'Spark') as Spark;
  }

  public get sparkConfigById(): (serviceId: string) => SparkConfig {
    return serviceId => this.sparkServiceById(serviceId).config;
  }

  private get allGroupNames(): Record<string, string[]> {
    return Object.keys(this.services)
      .reduce(
        (acc, key) => {
          const configNames = this.sparkConfigById(key).groupNames || [];
          const names = [
            ...configNames.slice(0, defaultGroupNames.length),
            ...defaultGroupNames.slice(configNames.length),
          ];
          return { ...acc, [key]: names };
        },
        {}
      );
  }

  public get groupNames(): (serviceId: string) => string[] {
    return serviceId => this.allGroupNames[serviceId];
  }

  @Mutation
  public commitAllSpecs(specs: BlockSpec[]): void {
    Vue.set(this, 'specs', specs.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}));
  }

  @Mutation
  public commitService([serviceId, state]: [string, SparkServiceState]): void {
    Vue.set(this.services, serviceId, state);
  }

  @Mutation
  public commitRemoveService(serviceId: string): void {
    Vue.delete(this.services, serviceId);
  }

  @Mutation
  public commitBlock([serviceId, block]: [string, Block]): void {
    Vue.set(this.services[serviceId].blocks, block.id, { ...block });
  }

  @Mutation
  public commitRemoveBlock([serviceId, block]: [string, Block]): void {
    Vue.delete(this.services[serviceId].blocks, block.id);
  }

  @Mutation
  public commitAllBlocks([serviceId, blocks]: [string, Block[]]): void {
    Vue.set(
      this.services[serviceId],
      'blocks',
      blocks.reduce((acc, block) => ({ ...acc, [block.id]: block }), {}));
  }

  @Mutation
  public commitUnits([serviceId, units]: [string, UserUnits]): void {
    Vue.set(this.services[serviceId], 'units', units);
  }

  @Mutation
  public commitUnitAlternatives([serviceId, alts]: [string, UnitAlternatives]): void {
    Vue.set(this.services[serviceId], 'unitAlternatives', alts);
  }

  @Mutation
  public commitCompatibleTypes([serviceId, types]: [string, CompatibleTypes]): void {
    Vue.set(this.services[serviceId], 'compatibleTypes', types);
  }

  @Mutation
  public commitDiscoveredBlocks([serviceId, ids]: [string, string[]]): void {
    Vue.set(this.services[serviceId], 'discoveredBlocks', ids);
  }

  @Mutation
  public commitUpdateSource([serviceId, source]: [string, EventSource | null]): void {
    Vue.set(this.services[serviceId], 'updateSource', source);
  }

  @Mutation
  public commitLastStatus([serviceId, status]: [string, SystemStatus]): void {
    Vue.set(this.services[serviceId], 'lastStatus', status);
  }

  @Action
  public async addService(serviceId: string): Promise<void> {
    if (this.services[serviceId]) {
      throw new Error(`Service ${serviceId} already exists`);
    }
    const empty: SparkServiceState = {
      blocks: {},
      units: {},
      unitAlternatives: {},
      compatibleTypes: {},
      discoveredBlocks: [],
      updateSource: null,
      lastStatus: null,
    };
    this.commitService([serviceId, empty]);
  }

  @Action
  public async removeService(serviceId: string): Promise<void> {
    this.commitRemoveService(serviceId);
  }

  @Action
  public async fetchBlock([serviceId, block]: [string, Block]): Promise<void> {
    const fetched = await fetchBlockInApi(block);
    this.commitBlock([serviceId, fetched]);
  }

  @Action
  public async createBlock([serviceId, block]: [string, Block]): Promise<void> {
    const created = await createBlockInApi(block);
    this.commitBlock([serviceId, created]);
  }

  @Action
  public async saveBlock([serviceId, block]: [string, Block]): Promise<void> {
    const persisted = await persistBlockInApi(block);
    this.commitBlock([serviceId, persisted]);
  }

  @Action
  public async removeBlock([serviceId, block]: [string, Block]): Promise<void> {
    await deleteBlockInApi(block);
    this.commitRemoveBlock([serviceId, block]);
  }

  @Action
  public async updateGroupNames([serviceId, names]: [string, string[]]): Promise<void> {
    const existing = this.sparkServiceById(serviceId);
    await serviceStore.saveService({
      ...existing,
      config: {
        ...existing.config,
        groupNames: names,
      },
    });
  }

  @Action
  public async fetchBlocks(serviceId: string): Promise<void> {
    const blocks = await fetchBlocksInApi(serviceId);
    this.commitAllBlocks([serviceId, blocks]);
  }

  @Action
  public async renameBlock([serviceId, currentId, newId]: [string, string, string]): Promise<void> {
    if (this.blockIds(serviceId).includes(newId)) {
      throw new Error(`Block ${newId} already exists`);
    }
    await renameBlockInApi(serviceId, currentId, newId);
    await this.fetchBlocks(serviceId);
    dashboardStore.itemValues
      .filter(item => item.config.serviceId === serviceId && item.config.blockId === currentId)
      .forEach(item => dashboardStore.commitDashboardItem({ ...item, config: { ...item.config, blockId: newId } }));
  }

  @Action
  public async clearBlocks(serviceId: string): Promise<void> {
    await clearBlocksInApi(serviceId);
    await this.fetchBlocks(serviceId);
  }

  @Action
  public async fetchServiceStatus(serviceId: string): Promise<void> {
    this.commitLastStatus([serviceId, await fetchSystemStatusInApi(serviceId)]);
  }

  @Action
  public async fetchUnits(serviceId: string): Promise<void> {
    this.commitUnits([serviceId, await fetchUnitsInApi(serviceId)]);
  }

  @Action
  public async saveUnits([serviceId, units]: [string, UserUnits]): Promise<void> {
    this.commitUnits([serviceId, await persistUnitsInApi(serviceId, units)]);
  }

  @Action
  public async fetchUnitAlternatives(serviceId: string): Promise<void> {
    this.commitUnitAlternatives([serviceId, await fetchUnitAlternativesInApi(serviceId)]);
  }

  @Action
  public async fetchCompatibleTypes(serviceId: string): Promise<void> {
    this.commitCompatibleTypes([serviceId, await fetchCompatibleTypesInApi(serviceId)]);
  }

  @Action
  public async fetchDiscoveredBlocks(serviceId: string): Promise<void> {
    const newIds = await fetchDiscoveredBlocksInApi(serviceId);
    this.commitDiscoveredBlocks([serviceId, [...this.services[serviceId].discoveredBlocks, ...newIds]]);
  }

  @Action
  public async clearDiscoveredBlocks(serviceId: string): Promise<void> {
    this.commitDiscoveredBlocks([serviceId, []]);
  }

  @Action
  public async cleanUnusedNames(serviceId: string): Promise<string[]> {
    return await cleanUnusedNamesInApi(serviceId);
  }

  @Action
  public async fetchAll(serviceId: string): Promise<void> {
    const status = await fetchSystemStatusInApi(serviceId);
    this.commitLastStatus([serviceId, status]);
    if (status.synchronize) {
      await Promise.all([
        this.fetchUnits(serviceId),
        this.fetchUnitAlternatives(serviceId),
        this.fetchCompatibleTypes(serviceId),
      ]);
    }
  }

  @Action
  public async createUpdateSource(serviceId: string): Promise<void> {
    this.commitUpdateSource([
      serviceId,
      await fetchUpdateSourceInApi(
        serviceId,
        blocks => this.commitAllBlocks([serviceId, blocks]),
        () => this.commitUpdateSource([serviceId, null]),
      ),
    ]);
  }

  @Action
  public async validateService(serviceId: string): Promise<boolean> {
    return await validateServiceInApi(serviceId);
  }

  @Action
  public async serviceExport(serviceId: string): Promise<any> {
    return await serviceExportInApi(serviceId);
  }

  @Action
  public async serviceImport([serviceId, exported]: [string, any]): Promise<string[]> {
    const importLog = await serviceImportInApi(serviceId, exported);
    await this.fetchBlocks(serviceId);
    return importLog;
  }
}

export default getModule(SparkModule);
