import { isSparkPatch, isSparkState } from '../utils/info';
import * as sparkApi from './spark-api';
import {
  asServiceStatus,
  findBlockByAddress,
  findBlockById,
  findBlockFieldByAddress,
} from './utils';
import { STATE_TOPIC } from '@/const';
import { eventbus } from '@/eventbus';
import type {
  BlockAddress,
  BlockFieldAddress,
  BlockPatchArgs,
  SparkBackup,
  SparkSessionConfig,
} from '@/plugins/spark/types';
import { useServiceStore } from '@/store/services';
import { useWidgetStore } from '@/store/widgets';
import { concatById } from '@/utils/collections';
import { makeTypeFilter } from '@/utils/functional';
import { deserialize } from '@/utils/parsing';
import {
  Block,
  BlockClaim,
  BlockRelation,
  Link,
  SparkPatchEvent,
  SparkStatusDescription,
} from 'brewblox-proto/ts';
import { defineStore } from 'pinia';

const defaultSessionConfig = (): SparkSessionConfig => ({
  pageMode: 'Relations',
  sorting: 'name',
  expanded: [],
});

function storageKey(serviceId: string): string {
  return `storage__Spark__${serviceId}`;
}

interface ByService<T> {
  [serviceId: string]: T;
}

interface SparkStoreState {
  serviceIds: string[];
  stateListenerIds: ByService<string>;
  patchListenerIds: ByService<string>;
  blocks: ByService<Block[]>;
  discoveredBlockIds: ByService<string[]>;
  statuses: ByService<SparkStatusDescription | null>;
  relations: ByService<BlockRelation[]>;
  claims: ByService<BlockClaim[]>;
  lastBlocksAt: ByService<Date | null>;
  lastStatusAt: ByService<Date | null>;
  sessionConfigs: ByService<SparkSessionConfig>;
}

export const useSparkStore = defineStore('sparkStore', {
  state: (): SparkStoreState => ({
    serviceIds: [],
    stateListenerIds: {},
    patchListenerIds: {},
    blocks: {},
    discoveredBlockIds: {},
    statuses: {},
    relations: {},
    claims: {},
    lastBlocksAt: {},
    lastStatusAt: {},
    sessionConfigs: {},
  }),
  actions: {
    has(serviceId: Maybe<string>): serviceId is string {
      return serviceId != null && this.serviceIds.includes(serviceId);
    },

    blocksByService(serviceId: Maybe<string>): Block[] {
      if (!this.has(serviceId)) {
        return [];
      }
      return this.blocks[serviceId];
    },

    blocksByType<T extends Block>(
      serviceId: Maybe<string>,
      type: T['type'],
    ): T[] {
      if (!this.has(serviceId)) {
        return [];
      }
      return this.blocks[serviceId].filter(makeTypeFilter<T>(type));
    },

    blockById<T extends Block>(
      serviceId: Maybe<string>,
      blockId: Maybe<string>,
    ): T | null {
      if (!this.has(serviceId) || !blockId) {
        return null;
      }
      return findBlockById(this.blocks[serviceId], blockId);
    },

    blockByAddress<T extends Block>(addr: T | Maybe<BlockAddress>): T | null {
      const serviceId = addr?.serviceId;
      if (!this.has(serviceId)) {
        return null;
      }
      return findBlockByAddress(this.blocks[serviceId], addr);
    },

    blockByLink<T extends Block>(
      serviceId: Maybe<string>,
      link: Maybe<Link>,
    ): T | null {
      const blockId = link?.id;
      if (!this.has(serviceId) || !blockId) {
        return null;
      }
      return findBlockById(this.blocks[serviceId], blockId);
    },

    fieldByAddress(addr: Maybe<BlockFieldAddress>): any {
      const serviceId = addr?.serviceId;
      if (!this.has(serviceId)) {
        return null;
      }
      return findBlockFieldByAddress(this.blocks[serviceId], addr);
    },

    discoveredBlockIdsByService(serviceId: Maybe<string>): string[] {
      return this.has(serviceId) ? this.discoveredBlockIds[serviceId] : [];
    },

    statusByService(serviceId: Maybe<string>): SparkStatusDescription | null {
      return this.has(serviceId) ? this.statuses[serviceId] : null;
    },

    relationsByService(serviceId: Maybe<string>): BlockRelation[] {
      return this.has(serviceId) ? this.relations[serviceId] : [];
    },

    claimsByService(serviceId: Maybe<string>): BlockClaim[] {
      return this.has(serviceId) ? this.claims[serviceId] : [];
    },

    lastBlocksAtByService(serviceId: Maybe<string>): Date | null {
      return this.has(serviceId) ? this.lastBlocksAt[serviceId] : null;
    },

    lastStatusAtByService(serviceId: Maybe<string>): Date | null {
      return this.has(serviceId) ? this.lastStatusAt[serviceId] : null;
    },

    sessionConfigByService(serviceId: Maybe<string>): SparkSessionConfig {
      return this.has(serviceId)
        ? this.sessionConfigs[serviceId]
        : defaultSessionConfig();
    },

    async createBlock(block: Block): Promise<void> {
      await sparkApi.createBlock(block); // triggers patch event
    },

    async saveBlock(block: Block): Promise<void> {
      await sparkApi.persistBlock(block); // triggers patch event
    },

    async patchBlock<T extends Block>(
      block: Maybe<T>,
      data: Partial<T['data']>,
    ): Promise<void> {
      if (block) {
        await sparkApi.patchBlock(block, data); // triggers patch event
      }
    },

    async removeBlock(block: Block): Promise<void> {
      await sparkApi.deleteBlock(block); // triggers patch event
    },

    async batchCreateBlocks(blocks: Block[]): Promise<void> {
      await sparkApi.batchCreateBlocks(blocks); // triggers patch event
    },

    async batchSaveBlocks(blocks: Block[]): Promise<void> {
      await sparkApi.batchPersistBlocks(blocks); // triggers patch event
    },

    async batchPatchBlocks(args: BlockPatchArgs<Block>[]): Promise<void> {
      await sparkApi.batchPatchBlocks(args); // triggers patch event
    },

    async batchRemoveBlocks(blocks: Block[]): Promise<void> {
      await sparkApi.batchDeleteBlocks(blocks); // triggers patch event
    },

    async renameBlock(
      serviceId: string,
      currentId: string,
      newId: string,
    ): Promise<void> {
      if (!this.has(serviceId)) {
        throw new Error(`Unknown service: '${serviceId}'`);
      }

      if (findBlockById(this.blocks[serviceId], newId)) {
        throw new Error(`Block ${newId} already exists`);
      }

      const widgetStore = useWidgetStore();
      await sparkApi.renameBlock(serviceId, currentId, newId);
      await this.fetchBlocks(serviceId);

      // Update all block widgets linked to this block
      widgetStore.widgets
        .filter(
          ({ config }) =>
            config.serviceId === serviceId && config.blockId === currentId,
        )
        .forEach((widget) => {
          widget.config.blockId = newId;
          widget.title = newId;
          widgetStore.saveWidget(widget);
        });
    },

    async clearBlocks(serviceId: string): Promise<void> {
      await sparkApi.clearBlocks(serviceId);
      await this.fetchBlocks(serviceId);
    },

    invalidateBlocks(serviceId: string): void {
      this.blocks[serviceId] = [];
      this.relations[serviceId] = [];
      this.claims[serviceId] = [];
      this.lastBlocksAt[serviceId] = null;
    },

    async saveAutoConnecting(
      serviceId: string,
      enabled: boolean,
    ): Promise<void> {
      await sparkApi.persistAutoconnecting(serviceId, enabled);
    },

    async clearDiscoveredBlocks(serviceId: string): Promise<void> {
      this.discoveredBlockIds[serviceId] = [];
    },

    async cleanUnusedNames(serviceId: string): Promise<string[]> {
      return await sparkApi.cleanUnusedNames(serviceId);
    },

    async fetchBlock(block: Maybe<Block>): Promise<void> {
      if (block) {
        const fetched = await sparkApi.fetchBlock(block);

        this.blocks[block.serviceId] = concatById(
          this.blocks[block.serviceId],
          fetched,
        );
      }
    },

    async fetchStoredBlock(serviceId: string, nid: number): Promise<Block> {
      return await sparkApi.fetchStoredBlock(serviceId, nid);
    },

    async fetchBlocks(serviceId: string): Promise<void> {
      this.updateBlocks(serviceId, await sparkApi.fetchBlocks(serviceId));
    },

    async fetchDiscoveredBlocks(serviceId: string): Promise<string[]> {
      const discovered = (await sparkApi.fetchDiscoveredBlocks(serviceId)).map(
        (v) => v.id,
      );
      this.discoveredBlockIds[serviceId].push(...discovered);
      return discovered;
    },

    async fetchAll(serviceId: string): Promise<boolean> {
      const serviceStore = useServiceStore();
      const status = await sparkApi.fetchSparkStatus(serviceId);
      this.updateStatus(serviceId, status);
      serviceStore.updateStatus(asServiceStatus(serviceId, status));
      const synchronized = status?.connection_status === 'SYNCHRONIZED';
      if (synchronized) {
        await Promise.all([
          this.fetchDiscoveredBlocks(serviceId),
          this.fetchBlocks(serviceId),
        ]);
      }
      return synchronized;
    },

    async serviceExport(serviceId: string): Promise<SparkBackup> {
      return await sparkApi.serviceExport(serviceId);
    },

    async serviceImport(
      serviceId: string,
      data: SparkBackup,
    ): Promise<string[]> {
      const messages = await sparkApi.serviceImport(serviceId, data);
      await this.fetchBlocks(serviceId);
      return messages;
    },

    async allStoredBackup(serviceId: string): Promise<string[]> {
      return await sparkApi.allStoredBackup(serviceId);
    },

    async saveStoredBackup(
      serviceId: string,
      name: string,
    ): Promise<SparkBackup> {
      return await sparkApi.saveStoredBackup(serviceId, name);
    },

    async loadStoredBackup(serviceId: string, name: string): Promise<string[]> {
      const messages = await sparkApi.loadStoredBackup(serviceId, name);
      await this.fetchBlocks(serviceId);
      return messages;
    },

    async uploadStoredBackup(
      serviceId: string,
      data: SparkBackup,
    ): Promise<SparkBackup> {
      return await sparkApi.uploadStoredBackup(serviceId, data);
    },

    async downloadStoredBackup(
      serviceId: string,
      name: string,
    ): Promise<SparkBackup> {
      return await sparkApi.downloadStoredBackup(serviceId, name);
    },

    async flashFirmware(serviceId: string): Promise<any> {
      return await sparkApi.flashFirmware(serviceId);
    },

    async controllerReboot(serviceId: string): Promise<void> {
      await sparkApi.controllerReboot(serviceId);
    },

    async serviceReboot(serviceId: string): Promise<void> {
      await sparkApi.serviceReboot(serviceId);
    },

    updateBlocks(serviceId: string, values: Block[]): void {
      this.blocks[serviceId] = values;
      this.lastBlocksAt[serviceId] = new Date();
    },

    updateComputed(
      serviceId: string,
      relations: BlockRelation[],
      claims: BlockClaim[],
    ): void {
      this.relations[serviceId] = relations;
      this.claims[serviceId] = claims;
    },

    patchBlocks(evt: SparkPatchEvent): void {
      const serviceId = evt.key;
      const { changed, deleted } = evt.data;
      const affected = [...changed.map((block) => block.id), ...deleted];
      this.blocks[serviceId] = [
        ...this.blocks[serviceId].filter((v) => !affected.includes(v.id)),
        ...changed.map(deserialize),
      ];
    },

    updateStatus(
      serviceId: string,
      status: SparkStatusDescription | null,
    ): void {
      this.statuses[serviceId] = status;
      this.lastStatusAt[serviceId] = new Date();
    },

    async loadSessionConfig(serviceId: string): Promise<void> {
      try {
        const rawConfig: string | null = sessionStorage.getItem(
          storageKey(serviceId),
        );
        this.sessionConfigs[serviceId] = rawConfig
          ? JSON.parse(rawConfig)
          : defaultSessionConfig();
      } catch (e) {
        this.sessionConfigs[serviceId] = defaultSessionConfig();
      }
    },

    async updateSessionConfig(
      serviceId: string,
      updates: Partial<SparkSessionConfig>,
    ): Promise<void> {
      this.sessionConfigs[serviceId] = {
        ...this.sessionConfigs[serviceId],
        ...updates,
      };
      try {
        sessionStorage.setItem(
          storageKey(serviceId),
          JSON.stringify(this.sessionConfigs[serviceId]),
        );
      } catch (e) {
        // ignore
      }
    },

    async addService(serviceId: string): Promise<void> {
      if (this.has(serviceId)) {
        throw new Error(`Spark service '${serviceId}' already exists`);
      }

      this.serviceIds.push(serviceId);
      this.blocks[serviceId] = [];
      this.discoveredBlockIds[serviceId] = [];
      this.statuses[serviceId] = null;
      this.relations[serviceId] = [];
      this.claims[serviceId] = [];
      this.lastBlocksAt[serviceId] = null;
      this.lastStatusAt[serviceId] = null;
      this.sessionConfigs[serviceId] = defaultSessionConfig();

      this.stateListenerIds[serviceId] = eventbus.addListener(
        `${STATE_TOPIC}/${serviceId}`,
        (_, evt) => {
          if (isSparkState(evt)) {
            const serviceStore = useServiceStore();
            if (evt.data) {
              const blocks = evt.data.blocks.map(deserialize);
              const { status, relations, claims } = evt.data;

              this.updateBlocks(serviceId, blocks);
              this.updateStatus(serviceId, status);
              this.updateComputed(serviceId, relations, claims);
              serviceStore.updateStatus(asServiceStatus(serviceId, status));
            } else {
              this.updateBlocks(serviceId, []);
              this.updateStatus(serviceId, null);
              this.updateComputed(serviceId, [], []);
              serviceStore.updateStatus(asServiceStatus(serviceId, null));
            }
          }
        },
      );

      this.patchListenerIds[serviceId] = eventbus.addListener(
        `${STATE_TOPIC}/${serviceId}/patch`,
        (_, evt) => {
          if (isSparkPatch(evt)) {
            this.patchBlocks(evt);
          }
        },
      );

      await this.fetchAll(serviceId).catch(() => {});
      await this.loadSessionConfig(serviceId);
    },

    async removeService(serviceId: string): Promise<void> {
      if (!this.has(serviceId)) {
        return;
      }
      this.serviceIds.splice(this.serviceIds.indexOf(serviceId), 1);
      eventbus.removeListener(this.stateListenerIds[serviceId]);
      eventbus.removeListener(this.patchListenerIds[serviceId]);
      delete this.stateListenerIds[serviceId];
      delete this.patchListenerIds[serviceId];
      delete this.blocks[serviceId];
      delete this.discoveredBlockIds[serviceId];
      delete this.statuses[serviceId];
      delete this.relations[serviceId];
      delete this.claims[serviceId];
      delete this.lastBlocksAt[serviceId];
      delete this.lastStatusAt[serviceId];
      delete this.sessionConfigs[serviceId];
    },
  },
});
