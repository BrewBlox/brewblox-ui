import fromEntries from 'fromentries';
import get from 'lodash/get';
import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { mutate, objReducer } from '@/helpers/functional';
import { deserialize } from '@/helpers/units/parseObject';
import { EventMessage } from '@/plugins/eventbus';
import store from '@/store';
import { dashboardStore } from '@/store/dashboards';
import { serviceStore } from '@/store/services';

import { GroupsBlock } from '../block-types';
import {
  Block,
  BlockSpec,
  CompatibleTypes,
  DataBlock,
  Limiters,
  RelationEdge,
  Spark,
  SparkConfig,
  StoredDataPreset,
  SystemStatus,
  UnitAlternatives,
  UserUnits,
} from '../types';
import * as api from './api';
import { asBlock, calculateDrivenChains, calculateLimiters, calculateRelations } from './helpers';
import presetsApi from './presets-api';

const rawError = true;

// Note: we're ignoring the system group (group 8)
const defaultGroupNames = [
  'Group1', 'Group2', 'Group3', 'Group4', 'Group5', 'Group6', 'Group7',
];

interface SparkServiceState {
  blocks: Mapped<Block>;
  units: UserUnits;
  unitAlternatives: UnitAlternatives;
  compatibleTypes: Mapped<string[]>;
  discoveredBlocks: string[];
  status: SystemStatus | null;
  lastUpdate: Date | null;
}

@Module({ store, namespaced: true, dynamic: true, name: 'spark' })
export class SparkModule extends VuexModule {
  private services: Mapped<SparkServiceState> = {};

  public specs: Mapped<BlockSpec> = {};
  public presets: Mapped<StoredDataPreset> = {};

  private get allBlockIds(): Mapped<string[]> {
    return Object.entries(this.services)
      .reduce((acc, [k, v]) => mutate(acc, k, Object.keys(v.blocks)), {});
  }

  private get allBlockValues(): Mapped<Block[]> {
    return Object.entries(this.services)
      .reduce((acc, [k, v]) => mutate(acc, k, Object.values(v.blocks)), {});
  }

  private get allDrivenChains(): Mapped<string[][]> {
    return Object.keys(this.services)
      .reduce((acc, id) => mutate(acc, id, calculateDrivenChains(this.allBlockValues[id])), {});
  }

  private get allRelations(): Mapped<RelationEdge[]> {
    return Object.keys(this.services)
      .reduce((acc, id) => mutate(acc, id, calculateRelations(this.allBlockValues[id])), {});
  }

  private get allLimiters(): Mapped<Limiters> {
    return Object.keys(this.services)
      .reduce((acc, id) => mutate(acc, id, calculateLimiters(this.allBlockValues[id])), {});
  }

  public get presetIds(): string[] {
    return Object.keys(this.presets);
  }

  public get presetValues(): StoredDataPreset[] {
    return Object.values(this.presets);
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

  public get blocks(): (serviceId: string) => Mapped<Block> {
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

  public get status(): (serviceId: string) => SystemStatus | null {
    return serviceId => this.services[serviceId].status;
  }

  public get lastUpdate(): (serviceId: string) => Date | null {
    return serviceId => this.services[serviceId].lastUpdate;
  }

  public get drivenChains(): (serviceId: string) => string[][] {
    return serviceId => this.allDrivenChains[serviceId];
  }

  public get relations(): (serviceId: string) => RelationEdge[] {
    return serviceId => this.allRelations[serviceId];
  }

  public get limiters(): (serviceId: string) => Limiters {
    return serviceId => this.allLimiters[serviceId];
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

  public get tryBlockById(): (serviceId: string, id: string | null) => Block | null {
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

  private get allGroupNames(): Mapped<string[]> {
    return Object.keys(this.services)
      .reduce(
        (acc, key) => {
          const configNames = this.sparkConfigById(key).groupNames || [];
          acc[key] = [
            ...configNames.slice(0, defaultGroupNames.length),
            ...defaultGroupNames.slice(configNames.length),
          ];
          return acc;
        },
        {}
      );
  }

  public get groupState(): Mapped<[string, boolean][]> {
    const entries = Object.entries(this.allGroupNames)
      .map(([serviceId, names]) => {
        const block: GroupsBlock | undefined =
          this.blockValues(serviceId)
            .find(block => block.type === 'Groups');
        const active = block ? block.data.active : [];
        return [serviceId, names.map((name, idx) => ([name, active.includes(idx)]))];
      });
    return fromEntries(entries);
  }

  public get groupNames(): (serviceId: string) => string[] {
    return serviceId => this.allGroupNames[serviceId];
  }

  @Mutation
  public commitPreset(preset: StoredDataPreset): void {
    Vue.set(this.presets, preset.id, preset);
  }

  @Mutation
  public commitAllPresets(presets: StoredDataPreset[]): void {
    Vue.set(this, 'presets', presets.reduce(objReducer('id'), {}));
  }

  @Mutation
  public commitRemovePreset(preset: StoredDataPreset): void {
    Vue.delete(this.presets, preset.id);
  }

  @Mutation
  public commitAllSpecs(specs: BlockSpec[]): void {
    Vue.set(this, 'specs', specs.reduce(objReducer('id'), {}));
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
    const service = this.services[serviceId];
    Vue.set(service, 'blocks', blocks.reduce(objReducer('id'), {}));
    Vue.set(service, 'lastUpdate', new Date());
  }

  @Mutation
  public invalidateBlocks(serviceId: string): void {
    const service = this.services[serviceId];
    Vue.set(service, 'blocks', []);
    Vue.set(service, 'lastUpdate', null);
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
  public commitStatus([serviceId, status]: [string, SystemStatus]): void {
    const service = this.services[serviceId];
    Vue.set(service, 'status', status);
  }

  @Action({ rawError })
  public async createPreset(preset: StoredDataPreset): Promise<void> {
    this.commitPreset(await presetsApi.create(preset));
  }

  @Action({ rawError })
  public async savePreset(preset: StoredDataPreset): Promise<void> {
    this.commitPreset(await presetsApi.persist(preset));
  }

  @Action({ rawError })
  public async removePreset(preset: StoredDataPreset): Promise<void> {
    await presetsApi.remove(preset);
    this.commitRemovePreset(preset);
  }

  @Action({ rawError })
  public async addService(serviceId: string): Promise<void> {
    if (this.services[serviceId]) {
      throw new Error(`Service '${serviceId}' already exists`);
    }
    const empty: SparkServiceState = {
      blocks: {},
      units: {},
      unitAlternatives: {},
      compatibleTypes: {},
      discoveredBlocks: [],
      status: null,
      lastUpdate: null,
    };
    this.commitService([serviceId, empty]);

    Vue.$eventbus.addListener(serviceId, (msg: EventMessage) => {
      const blocks: Block[] = msg.data
        .map(deserialize)
        .map((block: DataBlock) => asBlock(block, serviceId));
      this.commitAllBlocks([serviceId, blocks]);
    });

    await this.fetchServiceStatus(serviceId);
    await this.fetchDiscoveredBlocks(serviceId)
      .catch(() => { });
  }

  @Action({ rawError })
  public async removeService(serviceId: string): Promise<void> {
    Vue.$eventbus.removeListener(serviceId);
    this.commitRemoveService(serviceId);
  }

  @Action({ rawError })
  public async fetchBlock([serviceId, block]: [string, Block]): Promise<void> {
    const fetched = await api.fetchBlock(block);
    this.commitBlock([serviceId, fetched]);
  }

  @Action({ rawError })
  public async createBlock([serviceId, block]: [string, Block]): Promise<void> {
    const created = await api.createBlock(block);
    this.commitBlock([serviceId, created]);
  }

  @Action({ rawError })
  public async saveBlock([serviceId, block]: [string, Block]): Promise<void> {
    const persisted = await api.persistBlock(block);
    this.commitBlock([serviceId, persisted]);
  }

  @Action({ rawError })
  public async removeBlock([serviceId, block]: [string, Block]): Promise<void> {
    await api.deleteBlock(block);
    this.commitRemoveBlock([serviceId, block]);
  }

  @Action({ rawError })
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

  @Action({ rawError })
  public async fetchBlocks(serviceId: string): Promise<void> {
    const blocks = await api.fetchBlocks(serviceId);
    this.commitAllBlocks([serviceId, blocks]);
  }

  @Action({ rawError })
  public async renameBlock([serviceId, currentId, newId]: [string, string, string]): Promise<void> {
    if (this.blockIds(serviceId).includes(newId)) {
      throw new Error(`Block ${newId} already exists`);
    }
    await api.renameBlock(serviceId, currentId, newId);
    await this.fetchBlocks(serviceId);
    dashboardStore.widgetValues
      .filter(item => item.config.serviceId === serviceId && item.config.blockId === currentId)
      .forEach(item => dashboardStore.commitPersistentWidget({ ...item, config: { ...item.config, blockId: newId } }));
  }

  @Action({ rawError })
  public async clearBlocks(serviceId: string): Promise<void> {
    await api.clearBlocks(serviceId);
    await this.fetchBlocks(serviceId);
  }

  @Action({ rawError })
  public async fetchServiceStatus(serviceId: string): Promise<SystemStatus> {
    const status = await api.fetchSystemStatus(serviceId);
    this.commitStatus([serviceId, status]);
    return status;
  }

  @Action({ rawError })
  public async fetchUnits(serviceId: string): Promise<void> {
    this.commitUnits([serviceId, await api.fetchUnits(serviceId)]);
  }

  @Action({ rawError })
  public async saveUnits([serviceId, units]: [string, UserUnits]): Promise<void> {
    this.commitUnits([serviceId, await api.persistUnits(serviceId, units)]);
  }

  @Action({ rawError })
  public async fetchUnitAlternatives(serviceId: string): Promise<void> {
    this.commitUnitAlternatives([serviceId, await api.fetchUnitAlternatives(serviceId)]);
  }

  @Action({ rawError })
  public async fetchCompatibleTypes(serviceId: string): Promise<void> {
    this.commitCompatibleTypes([serviceId, await api.fetchCompatibleTypes(serviceId)]);
  }

  @Action({ rawError })
  public async fetchDiscoveredBlocks(serviceId: string): Promise<void> {
    const newIds = await api.fetchDiscoveredBlocks(serviceId);
    this.commitDiscoveredBlocks([serviceId, [...this.services[serviceId].discoveredBlocks, ...newIds]]);
  }

  @Action({ rawError })
  public async clearDiscoveredBlocks(serviceId: string): Promise<void> {
    this.commitDiscoveredBlocks([serviceId, []]);
  }

  @Action({ rawError })
  public async cleanUnusedNames(serviceId: string): Promise<string[]> {
    return await api.cleanUnusedNames(serviceId);
  }

  @Action({ rawError })
  public async fetchSettings(serviceId: string): Promise<void> {
    const status = await this.fetchServiceStatus(serviceId);
    if (status.synchronize) {
      await Promise.all([
        this.fetchUnits(serviceId),
        this.fetchUnitAlternatives(serviceId),
        this.fetchCompatibleTypes(serviceId),
      ]);
    }
  }

  @Action({ rawError })
  public async validateService(serviceId: string): Promise<boolean> {
    return await api.validateService(serviceId);
  }

  @Action({ rawError })
  public async flashFirmware(serviceId: string): Promise<any> {
    return await api.flashFirmware(serviceId);
  }

  @Action({ rawError })
  public async serviceExport(serviceId: string): Promise<any> {
    return await api.serviceExport(serviceId);
  }

  @Action({ rawError })
  public async serviceImport([serviceId, exported]: [string, any]): Promise<string[]> {
    const importLog = await api.serviceImport(serviceId, exported);
    await this.fetchBlocks(serviceId);
    return importLog;
  }

  @Action({ rawError })
  public async setup(): Promise<void> {
    const onChange = async (preset: StoredDataPreset): Promise<void> => {
      const existing = this.presets[preset.id];
      if (!existing || existing._rev !== preset._rev) {
        this.commitPreset(preset);
      }
    };
    const onDelete = (id: string): void => {
      const existing = this.presets[id];
      if (existing) {
        this.removePreset(existing);
      }
    };
    this.commitAllPresets(await presetsApi.fetch());
    presetsApi.setup(onChange, onDelete);
  }
}

export const sparkStore = getModule(SparkModule);
