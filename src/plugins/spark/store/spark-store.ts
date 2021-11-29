import { defineStore } from 'pinia';

import { STATE_TOPIC } from '@/const';
import { eventbus } from '@/eventbus';
import {
  BlockDriveChain,
  BlockRelation,
  Link,
  SparkPatchEvent,
} from '@/shared-types';
import { useServiceStore } from '@/store/services';
import { useWidgetStore } from '@/store/widgets';
import { concatById, filterById } from '@/utils/collections';
import { makeTypeFilter } from '@/utils/functional';
import { deepCopy } from '@/utils/objects';
import { deserialize } from '@/utils/parsing';

import type {
  BlockAddress,
  SparkExported,
  SparkSessionConfig,
  SparkStatus,
} from '../types';
import type { Block, BlockFieldAddress } from '../types';
import { isBlockVolatile, isSparkPatch, isSparkState } from '../utils';
import * as sparkApi from './spark-api';
import {
  asServiceStatus,
  asSparkStatus,
  findBlockByAddress,
  findBlockById,
  findBlockFieldByAddress,
} from './utils';

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
  volatileBlocks: ByService<Block[]>;
  discoveredBlockIds: ByService<string[]>;
  statuses: ByService<SparkStatus | null>;
  relations: ByService<BlockRelation[]>;
  driveChains: ByService<BlockDriveChain[]>;
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
    volatileBlocks: {},
    discoveredBlockIds: {},
    statuses: {},
    relations: {},
    driveChains: {},
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
      return (
        findBlockById(this.blocks[serviceId], blockId) ??
        findBlockById(this.volatileBlocks[serviceId], blockId)
      );
    },

    blockByAddress<T extends Block>(addr: T | Maybe<BlockAddress>): T | null {
      const serviceId = addr?.serviceId;
      if (!this.has(serviceId)) {
        return null;
      }
      return (
        findBlockByAddress(this.blocks[serviceId], addr) ??
        findBlockByAddress(this.volatileBlocks[serviceId], addr)
      );
    },

    blockByLink<T extends Block>(
      serviceId: Maybe<string>,
      link: Maybe<Link>,
    ): T | null {
      const blockId = link?.id;
      if (!this.has(serviceId) || !blockId) {
        return null;
      }
      return (
        findBlockById(this.blocks[serviceId], blockId) ??
        findBlockById(this.volatileBlocks[serviceId], blockId)
      );
    },

    fieldByAddress(addr: Maybe<BlockFieldAddress>): any {
      const serviceId = addr?.serviceId;
      if (!this.has(serviceId)) {
        return null;
      }
      return (
        findBlockFieldByAddress(this.blocks[serviceId], addr) ??
        findBlockFieldByAddress(this.volatileBlocks[serviceId], addr)
      );
    },

    discoveredBlockIdsByService(serviceId: Maybe<string>): string[] {
      return this.has(serviceId) ? this.discoveredBlockIds[serviceId] : [];
    },

    statusByService(serviceId: Maybe<string>): SparkStatus | null {
      return this.has(serviceId) ? this.statuses[serviceId] : null;
    },

    relationsByService(serviceId: Maybe<string>): BlockRelation[] {
      return this.has(serviceId) ? this.relations[serviceId] : [];
    },

    driveChainsByService(serviceId: Maybe<string>): BlockDriveChain[] {
      return this.has(serviceId) ? this.driveChains[serviceId] : [];
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

    setVolatileBlock(block: Block): void {
      const { serviceId } = block;
      if (!this.has(serviceId)) {
        throw new Error(`Service ${block.serviceId} does not exist in store`);
      }
      if (this.blocks[serviceId].some((v) => v.id === block.id)) {
        throw new Error(`Block ${block.id} already exists as persistent block`);
      }
      block.meta = block.meta ?? {};
      block.meta.volatile = true;
      this.volatileBlocks[serviceId] = concatById(
        this.volatileBlocks[serviceId],
        deepCopy(block),
      );
    },

    removeVolatileBlock({ serviceId, id }: BlockAddress): void {
      if (!this.has(serviceId) || !id) {
        return;
      }
      this.volatileBlocks[serviceId] = filterById(
        this.volatileBlocks[serviceId],
        { id },
      );
    },

    async createBlock(block: Block): Promise<void> {
      if (isBlockVolatile(block)) {
        throw new Error(`Block ${block.id} is volatile`);
      }
      await sparkApi.createBlock(block); // triggers patch event
    },

    async saveBlock(block: Block): Promise<void> {
      if (isBlockVolatile(block)) {
        this.setVolatileBlock(block);
      } else {
        await sparkApi.persistBlock(block); // triggers patch event
      }
    },

    async modifyBlock<T extends Block>(
      block: T,
      func: (actual: T) => Awaitable<unknown>,
    ): Promise<void> {
      const actual = deepCopy(this.blockByAddress<T>(block));
      if (actual) {
        await func(actual);
        return this.saveBlock(actual);
      }
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

      // Volatile blocks are updated in local data
      // No need to make API calls
      const volatile = findBlockById(this.volatileBlocks[serviceId], currentId);
      if (volatile) {
        this.volatileBlocks[serviceId] = [
          ...filterById(this.volatileBlocks[serviceId], volatile),
          { ...volatile, id: newId },
        ];
        return;
      }

      // Block was not volatile
      // Rename block in API
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

    async removeBlock(block: Block): Promise<void> {
      if (isBlockVolatile(block)) {
        const { serviceId } = block;
        this.volatileBlocks[serviceId] = filterById(
          this.volatileBlocks[serviceId],
          block,
        );
      } else {
        await sparkApi.deleteBlock(block); // triggers patch event
      }
    },

    async clearBlocks(serviceId: string): Promise<void> {
      await sparkApi.clearBlocks(serviceId);
      await this.fetchBlocks(serviceId);
    },

    invalidateBlocks(serviceId: string): void {
      this.blocks[serviceId] = [];
      this.relations[serviceId] = [];
      this.driveChains[serviceId] = [];
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

    async fetchBlock(block: Block): Promise<void> {
      const fetched = await sparkApi.fetchBlock(block);
      if (!isBlockVolatile(block)) {
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
      this.updateStatus(status);
      serviceStore.updateStatus(asServiceStatus(status));
      if (status.isSynchronized) {
        await Promise.all([
          this.fetchDiscoveredBlocks(serviceId),
          this.fetchBlocks(serviceId),
        ]);
      }
      return !!status.isSynchronized;
    },

    async serviceExport(serviceId: string): Promise<SparkExported> {
      return await sparkApi.serviceExport(serviceId);
    },

    async serviceImport(
      serviceId: string,
      exported: SparkExported,
    ): Promise<string[]> {
      const importLog = await sparkApi.serviceImport(serviceId, exported);
      await this.fetchBlocks(serviceId);
      return importLog;
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
      newRelations: BlockRelation[],
      newDriveChains: BlockDriveChain[],
    ): void {
      this.relations[serviceId] = newRelations;
      this.driveChains[serviceId] = newDriveChains;
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

    updateStatus(status: SparkStatus): void {
      const { serviceId } = status;
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
      this.volatileBlocks[serviceId] = [];
      this.discoveredBlockIds[serviceId] = [];
      this.statuses[serviceId] = null;
      this.relations[serviceId] = [];
      this.driveChains[serviceId] = [];
      this.lastBlocksAt[serviceId] = null;
      this.lastStatusAt[serviceId] = null;
      this.sessionConfigs[serviceId] = defaultSessionConfig();

      this.stateListenerIds[serviceId] = eventbus.addListener(
        `${STATE_TOPIC}/${serviceId}`,
        (_, evt) => {
          if (isSparkState(evt)) {
            const serviceStore = useServiceStore();
            const status = asSparkStatus(serviceId, evt.data.status);
            const blocks = evt.data.blocks.map(deserialize);

            this.updateBlocks(serviceId, blocks);
            this.updateStatus(status);
            this.updateComputed(
              serviceId,
              evt.data.relations,
              evt.data.drive_chains,
            );
            serviceStore.updateStatus(asServiceStatus(status));
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
      delete this.volatileBlocks[serviceId];
      delete this.discoveredBlockIds[serviceId];
      delete this.statuses[serviceId];
      delete this.relations[serviceId];
      delete this.driveChains[serviceId];
      delete this.lastBlocksAt[serviceId];
      delete this.lastStatusAt[serviceId];
      delete this.sessionConfigs[serviceId];
    },
  },
});
