import Vue from 'vue';
import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';
import type { RegisterOptions } from 'vuex-class-modules';

import { extendById, filterById, typeMatchFilter } from '@/helpers/functional';
import { EventbusMessage } from '@/plugins/eventbus';
import { deserialize } from '@/plugins/spark/parse-object';
import type {
  ApiSparkStatus,
  Block,
  BlockAddress,
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
import { asBlock } from '../helpers';
import * as api from './api';
import { asServiceStatus, calculateDrivenChains, calculateLimiters, calculateRelations } from './helpers';

@Module({ generateMutationSetters: true })
export class SparkServiceModule extends VuexModule {
  public readonly id: string; // serviceId

  public blocks: Block[] = [];
  public discoveredBlocks: string[] = [];
  public units: UserUnits = { Temp: 'degC' };
  public status: SparkStatus | null = null;
  public lastBlocks: Date | null = null;
  public lastStatus: Date | null = null;

  public constructor(serviceId: string, options: RegisterOptions) {
    super(options);
    this.id = serviceId;
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
    return serviceStore.serviceById(this.id)!;
  }

  @Mutation
  public setBlock(block: Block): void {
    this.blocks = extendById(this.blocks, block);
  }

  @Mutation
  public updateBlocks(blocks: Block[]): void {
    this.blocks = blocks;
    this.lastBlocks = new Date();
  }

  @Mutation
  public updateStatus(status: SparkStatus): void {
    this.status = status;
    this.lastStatus = new Date();
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

  public blockByAddress<T extends Block>(addr: BlockAddress | null): T | null {
    if (!addr || !addr.id || (addr.serviceId && addr.serviceId !== this.id)) { return null; }
    return this.blocks.find(v => v.id === addr.id && (!v.type || v.type === addr.type)) as T ?? null;
  }

  public blocksByType<T extends Block>(type: T['type']): T[] {
    return this.blocks.filter(typeMatchFilter<T>(type));
  }

  @Action
  public async fetchBlock(block: Block): Promise<void> {
    this.setBlock(await api.fetchBlock(block));
  }

  @Action
  public async createBlock(block: Block): Promise<void> {
    this.setBlock(await api.createBlock(block));
  }

  @Action
  public async saveBlock(block: Block): Promise<void> {
    this.setBlock(await api.persistBlock(block));
  }

  @Action
  public async removeBlock(block: Block): Promise<void> {
    await api.deleteBlock(block);
    this.blocks = filterById(this.blocks, block);
  }

  @Action
  public async fetchBlocks(): Promise<void> {
    this.updateBlocks(await api.fetchBlocks(this.id));
  }

  @Action
  public async renameBlock([currentId, newId]: [string, string]): Promise<void> {
    if (this.blockById(newId)) {
      throw new Error(`Block ${newId} already exists`);
    }
    await api.renameBlock(this.id, currentId, newId);
    await this.fetchBlocks();
    dashboardStore.widgets
      .filter(({ config }) => config.serviceId === this.id && config.blockId === currentId)
      .forEach(widget => {
        widget.config.blockId = newId;
        dashboardStore.saveWidget(widget);
      });
  }

  @Action
  public async clearBlocks(): Promise<void> {
    await api.clearBlocks(this.id);
    await this.fetchBlocks();
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
  public async saveAutoConnecting(enabled: boolean): Promise<void> {
    await api.persistAutoconnecting(this.id, enabled);
  }

  @Action
  public async fetchDiscoveredBlocks(): Promise<void> {
    const discovered = (await api.fetchDiscoveredBlocks(this.id)).map(v => v.id);
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
    this.updateStatus(status);
    serviceStore.updateStatus(asServiceStatus(status));
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
  public async reboot(): Promise<void> {
    await api.reboot(this.id);
  }

  @Action
  public async start(): Promise<void> {
    // Listen for block updates
    Vue.$eventbus.addListener({
      id: `${sparkBlocksEvent}__${this.id}`,
      filter: (key, type) => key === this.id && type === sparkBlocksEvent,
      onmessage: (msg: EventbusMessage) => {
        const blocks = msg.data
          .map(deserialize)
          .map((block: DataBlock) => asBlock(block, this.id));
        this.updateBlocks(blocks);
      },
    });

    // Listen for status updates
    Vue.$eventbus.addListener({
      id: `${sparkStatusEvent}__${this.id}`,
      filter: (key, type) => key === this.id && type === sparkStatusEvent,
      onmessage: (msg: EventbusMessage) => {
        const status: SparkStatus = {
          ...msg.data as ApiSparkStatus,
          serviceId: this.id,
          available: true,
        };
        this.updateStatus(status);
        serviceStore.updateStatus(asServiceStatus(status));
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
