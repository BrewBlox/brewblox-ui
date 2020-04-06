import fromEntries from 'fromentries';
import Vue from 'vue';
// import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import { mutate, objReducer } from '@/helpers/functional';
import { deserialize } from '@/helpers/units/parseObject';
import { EventbusMessage } from '@/plugins/eventbus';
import store from '@/store';
import { dashboardStore } from '@/store/dashboards';
import { serviceStore } from '@/store/services';

import { GroupsBlock } from '../block-types';
import { sparkBlocksEvent, sparkStatusEvent, sparkType } from '../getters';
import {
  ApiSparkStatus,
  Block,
  BlockSpec,
  DataBlock,
  Limiters,
  RelationEdge,
  SparkConfig,
  SparkService,
  SparkStatus,
  StoredDataPreset,
  UserUnits,
} from '../types';
import * as api from './api';
import { asBlock, asServiceStatus, calculateDrivenChains, calculateLimiters, calculateRelations } from './helpers';
import presetsApi from './presets-api';

// Note: we're ignoring the system group (group 8)
const defaultGroupNames = [
  'Group1', 'Group2', 'Group3', 'Group4', 'Group5', 'Group6', 'Group7',
];

interface SparkServiceState {
  blocks: Mapped<Block>;
  discoveredBlocks: string[];
  units: UserUnits;
  status: SparkStatus | null;
  lastBlocks: Date | null;
  lastStatus: Date | null;
}

@Module
export class SparkModule extends VuexModule {
  private sparkCache: Mapped<SparkServiceState> = {};

  public specs: Mapped<BlockSpec> = {};
  public presets: Mapped<StoredDataPreset> = {};

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
    return Object.keys(this.sparkCache);
  }

  public get serviceAvailable(): (serviceId: string) => boolean {
    return serviceId => !!this.sparkCache[serviceId];
  }

  public get blockById(): <T extends Block>(serviceId: string, id: string, type?: string) => T {
    return <T extends Block>(serviceId: string, id: string, type?: string) => {
      const block = this.sparkCache[serviceId]?.blocks[id] as T;
      if (!block) {
        throw new Error(`Block ${id} not found in service ${serviceId}`);
      }
      if (block && type && block.type !== type) {
        throw new Error(`Invalid block ${id}: ${block.type} !== ${type}`);
      }
      return block;
    };
  }

  public get tryBlockById(): <T extends Block>(serviceId: string | null, id: string | null) => T | null {
    return <T extends Block>(serviceId: string | null, id: string | null) =>
      serviceId && id
        ? (this.sparkCache[serviceId]?.blocks[id] as T) ?? null
        : null;
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
    Vue.set(this.sparkCache, serviceId, state);
  }

  @Mutation
  public commitRemoveService(serviceId: string): void {
    Vue.delete(this.sparkCache, serviceId);
  }

  @Mutation
  public commitBlock(block: Block): void {
    Vue.set(this.sparkCache[block.serviceId].blocks, block.id, { ...block });
  }

  @Mutation
  public commitRemoveBlock(block: Block): void {
    Vue.delete(this.sparkCache[block.serviceId].blocks, block.id);
  }

  @Mutation
  public commitAllBlocks([serviceId, blocks]: [string, Block[]]): void {
    const service = this.sparkCache[serviceId];
    Vue.set(service, 'blocks', blocks.reduce(objReducer('id'), {}));
    Vue.set(service, 'lastBlocks', new Date());
  }

  @Mutation
  public invalidateBlocks(serviceId: string): void {
    const service = this.sparkCache[serviceId];
    Vue.set(service, 'blocks', []);
    Vue.set(service, 'lastBlocks', null);
  }

  @Mutation
  public commitUnits([serviceId, units]: [string, UserUnits]): void {
    Vue.set(this.sparkCache[serviceId], 'units', units);
  }

  @Mutation
  public commitDiscoveredBlocks([serviceId, ids]: [string, string[]]): void {
    Vue.set(this.sparkCache[serviceId], 'discoveredBlocks', ids);
  }

  @Mutation
  public commitStatus(status: SparkStatus): void {
    const service = this.sparkCache[status.serviceId];
    Vue.set(service, 'status', status);
    Vue.set(service, 'lastStatus', status.available ? new Date() : null);
  }

  @Action
  public async createPreset(preset: StoredDataPreset): Promise<void> {
    this.commitPreset(await presetsApi.create(preset));
  }

  @Action
  public async savePreset(preset: StoredDataPreset): Promise<void> {
    this.commitPreset(await presetsApi.persist(preset));
  }

  @Action
  public async removePreset(preset: StoredDataPreset): Promise<void> {
    await presetsApi.remove(preset);
    this.commitRemovePreset(preset);
  }

  @Action
  public async fetchBlock(block: Block): Promise<void> {
    const fetched = await api.fetchBlock(block);
    this.commitBlock(fetched);
  }

  @Action
  public async createBlock(block: Block): Promise<void> {
    const created = await api.createBlock(block);
    this.commitBlock(created);
  }

  @Action
  public async saveBlock(block: Block): Promise<void> {
    const persisted = await api.persistBlock(block);
    this.commitBlock(persisted);
  }

  @Action
  public async removeBlock(block: Block): Promise<void> {
    await api.deleteBlock(block);
    this.commitRemoveBlock(block);
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
    const blocks = await api.fetchBlocks(serviceId);
    this.commitAllBlocks([serviceId, blocks]);
  }

  @Action
  public async renameBlock([serviceId, currentId, newId]: [string, string, string]): Promise<void> {
    if (this.blockIds(serviceId).includes(newId)) {
      throw new Error(`Block ${newId} already exists`);
    }
    await api.renameBlock(serviceId, currentId, newId);
    await this.fetchBlocks(serviceId);
    dashboardStore.widgetValues
      .filter(item => item.config.serviceId === serviceId && item.config.blockId === currentId)
      .forEach(item => dashboardStore.commitWidget({ ...item, config: { ...item.config, blockId: newId } }));
  }

  @Action
  public async clearBlocks(serviceId: string): Promise<void> {
    await api.clearBlocks(serviceId);
    await this.fetchBlocks(serviceId);
  }

  @Action
  public async updateStatus(status: SparkStatus): Promise<void> {
    this.commitStatus(status);
    await serviceStore.updateStatus(asServiceStatus(status));
  }

  @Action
  public async fetchUnits(serviceId: string): Promise<void> {
    this.commitUnits([serviceId, await api.fetchUnits(serviceId)]);
  }

  @Action
  public async saveUnits([serviceId, units]: [string, UserUnits]): Promise<void> {
    this.commitUnits([serviceId, await api.persistUnits(serviceId, units)]);
  }

  @Action
  public async fetchDiscoveredBlocks(serviceId: string): Promise<void> {
    const newIds = await api.fetchDiscoveredBlocks(serviceId);
    this.commitDiscoveredBlocks([serviceId, [...this.sparkCache[serviceId].discoveredBlocks, ...newIds]]);
  }

  @Action
  public async clearDiscoveredBlocks(serviceId: string): Promise<void> {
    this.commitDiscoveredBlocks([serviceId, []]);
  }

  @Action
  public async cleanUnusedNames(serviceId: string): Promise<string[]> {
    return await api.cleanUnusedNames(serviceId);
  }

  @Action
  public async fetchAll(serviceId: string): Promise<boolean> {
    const status = await api.fetchSparkStatus(serviceId);
    await this.updateStatus(status);
    if (status.synchronize) {
      await Promise.all([
        this.fetchUnits(serviceId),
        this.fetchDiscoveredBlocks(serviceId),
        this.fetchBlocks(serviceId),
      ]);
    }
    return status.synchronize;
  }

  @Action
  public async validateService(serviceId: string): Promise<boolean> {
    return await api.validateService(serviceId);
  }

  @Action
  public async flashFirmware(serviceId: string): Promise<any> {
    return await api.flashFirmware(serviceId);
  }

  @Action
  public async serviceExport(serviceId: string): Promise<any> {
    return await api.serviceExport(serviceId);
  }

  @Action
  public async serviceImport([serviceId, exported]: [string, any]): Promise<string[]> {
    const importLog = await api.serviceImport(serviceId, exported);
    await this.fetchBlocks(serviceId);
    return importLog;
  }

  @Action
  public async addService(serviceId: string): Promise<void> {
    if (this.sparkCache[serviceId]) {
      throw new Error(`Service '${serviceId}' already exists`);
    }
    const state: SparkServiceState = {
      blocks: {},
      discoveredBlocks: [],
      units: {
        Temp: 'degC',
        Time: 'second',
        LongTime: 'hour',
      },
      status: null,
      lastBlocks: null,
      lastStatus: null,
    };
    this.commitService([serviceId, state]);

    // Listen for block updates
    Vue.$eventbus.addListener({
      id: `${sparkBlocksEvent}__${serviceId}`,
      filter: (key, type) => key === serviceId && type === sparkBlocksEvent,
      onmessage: (msg: EventbusMessage) => {
        const blocks: Block[] = msg.data
          .map(deserialize)
          .map((block: DataBlock) => asBlock(block, serviceId));
        this.commitAllBlocks([serviceId, blocks]);
      },
    });

    // Listen for status updates
    Vue.$eventbus.addListener({
      id: `${sparkStatusEvent}__${serviceId}`,
      filter: (key, type) => key === serviceId && type === sparkStatusEvent,
      onmessage: (msg: EventbusMessage) => {
        const status: ApiSparkStatus = msg.data;
        this.updateStatus({
          ...status,
          serviceId,
          available: true,
        });
      },
    });

    await this.fetchAll(serviceId)
      .catch(() => { });
  }

  @Action
  public async removeService(serviceId: string): Promise<void> {
    Vue.$eventbus.removeListener(`${sparkBlocksEvent}__${serviceId}`);
    Vue.$eventbus.removeListener(`${sparkStatusEvent}__${serviceId}`);
    this.commitRemoveService(serviceId);
  }

  @Action
  public async start(): Promise<void> {
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
    presetsApi.subscribe(onChange, onDelete);
  }
}

export const sparkStore = new SparkModule({ store, name: 'spark' });
