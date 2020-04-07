import Vue from 'vue';
import { Action, Module, Mutation, RegisterOptions, VuexModule } from 'vuex-class-modules';

import { filterById } from '@/helpers/functional';
import { deserialize } from '@/helpers/units/parseObject';
import { EventbusMessage } from '@/plugins/eventbus';
import {
  ApiSparkStatus,
  Block,
  DataBlock,
  Limiters,
  RelationEdge,
  SparkExported,
  SparkService,
  SparkStatus,
  UserUnits,
} from '@/plugins/spark/types';
import { dashboardStore } from '@/store/dashboards';
import { serviceStore } from '@/store/services';

import { sparkBlocksEvent, sparkStatusEvent } from '../getters';
import * as api from './api';
import { asBlock, asServiceStatus, calculateDrivenChains, calculateLimiters, calculateRelations } from './helpers';

@Module({ generateMutationSetters: true })
export class SparkServiceModule extends VuexModule {
  public readonly id: string; // serviceId

  public blocks: Block[];
  public discoveredBlocks: string[];
  public units: UserUnits;
  public status: SparkStatus | null;
  public lastBlocks: Date | null;
  public lastStatus: Date | null;

  public constructor(serviceId: string, options: RegisterOptions) {
    super(options);
    this.id = serviceId;
    this.blocks = [];
    this.discoveredBlocks = [];
    this.units = {
      Temp: 'degC',
      Time: 'second',
      LongTime: 'hour',
    };
    this.status = null;
    this.lastBlocks = null;
    this.lastStatus = null;
  }

  public get blockIds(): string[] {
    return this.blocks.map(v => v.id);
  }

  public get drivenChains(): string[][] {
    return calculateDrivenChains(this.blocks);
  }

  public get drivenBlocks(): string[] {
    return this.drivenChains.map(c => c[0]);
  }

  public get relations(): RelationEdge[] {
    return calculateRelations(this.blocks);
  }

  public get limiters(): Limiters {
    return calculateLimiters(this.blocks);
  }

  public get service(): SparkService {
    return serviceStore.serviceById(this.id);
  }

  @Mutation
  public setBlock(block: Block): void {
    this.blocks = filterById(this.blocks, block, true);
  }

  @Mutation
  public invalidateBlocks(): void {
    this.blocks = [];
    this.lastBlocks = null;
  }

  public blockById<T extends Block>(blockId: string | null): T | null {
    if (!blockId) { return null; }
    return this.blocks.find(v => v.id === blockId) as T ?? null;
  }

  @Action
  public async fetchBlock(block: Block): Promise<void> {
    const fetched = await api.fetchBlock(block);
    this.setBlock(fetched);
  }

  @Action
  public async createBlock(block: Block): Promise<void> {
    const created = await api.createBlock(block);
    this.setBlock(created);
  }

  @Action
  public async saveBlock(block: Block): Promise<void> {
    const persisted = await api.persistBlock(block);
    this.setBlock(persisted);
  }

  @Action
  public async removeBlock(block: Block): Promise<void> {
    await api.deleteBlock(block);
    this.blocks = filterById(this.blocks, block);
  }

  @Action
  public async fetchBlocks(): Promise<void> {
    this.blocks = await api.fetchBlocks(this.id);
  }

  @Action
  public async renameBlock([currentId, newId]: [string, string]): Promise<void> {
    if (this.blocks.find(v => v.id === newId)) {
      throw new Error(`Block ${newId} already exists`);
    }
    await api.renameBlock(this.id, currentId, newId);
    await this.fetchBlocks();
    dashboardStore.widgets
      .filter(item => item.config.serviceId === this.id && item.config.blockId === currentId)
      .forEach(item => dashboardStore.saveWidget({ ...item, config: { ...item.config, blockId: newId } }));
  }

  @Action
  public async clearBlocks(): Promise<void> {
    await api.clearBlocks(this.id);
    await this.fetchBlocks();
  }

  @Action
  public async updateStatus(status: SparkStatus): Promise<void> {
    this.status = status;
    await serviceStore.updateStatus(asServiceStatus(status));
  }

  @Action
  public async fetchUnits(): Promise<void> {
    this.units = await api.fetchUnits(this.id);
  }

  @Action
  public async saveUnits(units: UserUnits): Promise<void> {
    this.units = await api.persistUnits(this.id, units);
  }

  @Action
  public async fetchDiscoveredBlocks(): Promise<void> {
    const discovered = await api.fetchDiscoveredBlocks(this.id);
    this.discoveredBlocks = [...this.discoveredBlocks, ...discovered];
  }

  @Action
  public async clearDiscoveredBlocks(): Promise<void> {
    this.discoveredBlocks = [];
  }

  @Action
  public async cleanUnusedNames(): Promise<string[]> {
    return await api.cleanUnusedNames(this.id);
  }

  @Action
  public async fetchAll(): Promise<boolean> {
    const status = await api.fetchSparkStatus(this.id);
    await this.updateStatus(status);
    if (status.synchronize) {
      await Promise.all([
        this.fetchUnits(),
        this.fetchDiscoveredBlocks(),
        this.fetchBlocks(),
      ]);
    }
    return status.synchronize;
  }

  @Action
  public async flashFirmware(): Promise<any> {
    return await api.flashFirmware(this.id);
  }

  @Action
  public async serviceExport(): Promise<SparkExported> {
    return await api.serviceExport(this.id);
  }

  @Action
  public async serviceImport(exported: SparkExported): Promise<string[]> {
    const importLog = await api.serviceImport(this.id, exported);
    await this.fetchBlocks();
    return importLog;
  }

  @Action
  public async start(): Promise<void> {
    // Listen for block updates
    Vue.$eventbus.addListener({
      id: `${sparkBlocksEvent}__${this.id}`,
      filter: (key, type) => key === this.id && type === sparkBlocksEvent,
      onmessage: (msg: EventbusMessage) => {
        this.blocks = msg.data
          .map(deserialize)
          .map((block: DataBlock) => asBlock(block, this.id));
      },
    });

    // Listen for status updates
    Vue.$eventbus.addListener({
      id: `${sparkStatusEvent}__${this.id}`,
      filter: (key, type) => key === this.id && type === sparkStatusEvent,
      onmessage: (msg: EventbusMessage) => {
        const status: ApiSparkStatus = msg.data;
        this.updateStatus({
          ...status,
          serviceId: this.id,
          available: true,
        });
      },
    });

    await this.fetchAll().catch(() => { });
  }

  @Action
  public async stop(): Promise<void> {
    Vue.$eventbus.removeListener(`${sparkBlocksEvent}__${this.id}`);
    Vue.$eventbus.removeListener(`${sparkStatusEvent}__${this.id}`);
  }
}
