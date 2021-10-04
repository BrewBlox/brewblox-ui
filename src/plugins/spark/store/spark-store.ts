import { defineStore } from 'pinia';
import { reactive } from 'vue';

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

interface ByService<T> {
  [serviceId: string]: T;
}

export const useSparkStore = defineStore('sparkStore', () => {
  const serviceIds = reactive<string[]>([]);
  const stateListenerIds = reactive<ByService<string>>({});
  const patchListenerIds = reactive<ByService<string>>({});
  const blocks = reactive<ByService<Block[]>>({});
  const volatileBlocks = reactive<ByService<Block[]>>({});
  const discoveredBlockIds = reactive<ByService<string[]>>({});
  const statuses = reactive<ByService<SparkStatus | null>>({});
  const relations = reactive<ByService<BlockRelation[]>>({});
  const driveChains = reactive<ByService<BlockDriveChain[]>>({});
  const lastBlocksAt = reactive<ByService<Date | null>>({});
  const lastStatusAt = reactive<ByService<Date | null>>({});
  const sessionConfigs = reactive<ByService<SparkSessionConfig>>({});

  function has(serviceId: Maybe<string>): serviceId is string {
    return serviceId != null && serviceIds.includes(serviceId);
  }

  function blocksByService(serviceId: Maybe<string>): Block[] {
    if (!serviceId) {
      return [];
    }
    return blocks[serviceId];
  }

  function blocksByType<T extends Block>(
    serviceId: Maybe<string>,
    type: T['type'],
  ): T[] {
    if (!serviceId) {
      return [];
    }
    return blocks[serviceId].filter(makeTypeFilter<T>(type));
  }

  function blockById<T extends Block>(
    serviceId: Maybe<string>,
    blockId: Maybe<string>,
  ): T | null {
    if (!serviceId || !blockId) {
      return null;
    }
    return (
      findBlockById(blocks[serviceId], blockId) ??
      findBlockById(volatileBlocks[serviceId], blockId)
    );
  }

  function blockByAddress<T extends Block>(
    addr: T | Maybe<BlockAddress>,
  ): T | null {
    const serviceId = addr?.serviceId;
    if (!serviceId) {
      return null;
    }
    return (
      findBlockByAddress(blocks[serviceId], addr) ??
      findBlockByAddress(volatileBlocks[serviceId], addr)
    );
  }

  function blockByLink<T extends Block>(
    serviceId: Maybe<string>,
    link: Maybe<Link>,
  ): T | null {
    const blockId = link?.id;
    if (!serviceId || !blockId) {
      return null;
    }
    return (
      findBlockById(blocks[serviceId], blockId) ??
      findBlockById(volatileBlocks[serviceId], blockId)
    );
  }

  function fieldByAddress(addr: Maybe<BlockFieldAddress>): any {
    const serviceId = addr?.serviceId;
    if (!serviceId) {
      return null;
    }
    return (
      findBlockFieldByAddress(blocks[serviceId], addr) ??
      findBlockFieldByAddress(volatileBlocks[serviceId], addr)
    );
  }

  function discoveredBlockIdsByService(serviceId: Maybe<string>): string[] {
    return has(serviceId) ? discoveredBlockIds[serviceId] : [];
  }

  function statusByService(serviceId: Maybe<string>): SparkStatus | null {
    return has(serviceId) ? statuses[serviceId] : null;
  }

  function relationsByService(serviceId: Maybe<string>): BlockRelation[] {
    return has(serviceId) ? relations[serviceId] : [];
  }

  function driveChainsByService(serviceId: Maybe<string>): BlockDriveChain[] {
    return has(serviceId) ? driveChains[serviceId] : [];
  }

  function lastBlocksAtByService(serviceId: Maybe<string>): Date | null {
    return has(serviceId) ? lastBlocksAt[serviceId] : null;
  }

  function lastStatusAtByService(serviceId: Maybe<string>): Date | null {
    return has(serviceId) ? lastStatusAt[serviceId] : null;
  }

  function sessionConfigByService(
    serviceId: Maybe<string>,
  ): SparkSessionConfig {
    return has(serviceId) ? sessionConfigs[serviceId] : defaultSessionConfig();
  }

  function setVolatileBlock(block: Block): void {
    const { serviceId } = block;
    if (!has(serviceId)) {
      throw new Error(`Service ${block.serviceId} does not exist in store`);
    }
    if (blocks[serviceId].some((v) => v.id === block.id)) {
      throw new Error(`Block ${block.id} already exists as persistent block`);
    }
    block.meta = block.meta ?? {};
    block.meta.volatile = true;
    volatileBlocks[serviceId] = concatById(
      volatileBlocks[serviceId],
      deepCopy(block),
    );
  }

  function removeVolatileBlock({ serviceId, id }: BlockAddress): void {
    if (!serviceId || !id) {
      return;
    }
    volatileBlocks[serviceId] = filterById(volatileBlocks[serviceId], { id });
  }

  async function createBlock(block: Block): Promise<void> {
    if (isBlockVolatile(block)) {
      throw new Error(`Block ${block.id} is volatile`);
    }
    await sparkApi.createBlock(block); // triggers patch event
  }

  async function saveBlock(block: Block): Promise<void> {
    if (isBlockVolatile(block)) {
      setVolatileBlock(block);
    } else {
      await sparkApi.persistBlock(block); // triggers patch event
    }
  }

  async function modifyBlock<T extends Block>(
    block: T,
    func: (actual: T) => Awaitable<unknown>,
  ): Promise<void> {
    const actual = deepCopy(blockByAddress<T>(block));
    if (actual) {
      await func(actual);
      return saveBlock(actual);
    }
  }

  async function renameBlock(
    serviceId: string,
    currentId: string,
    newId: string,
  ): Promise<void> {
    if (findBlockById(blocks[serviceId], newId)) {
      throw new Error(`Block ${newId} already exists`);
    }

    // Volatile blocks are updated in local data
    // No need to make API calls
    const volatile = findBlockById(volatileBlocks[serviceId], currentId);
    if (volatile) {
      volatileBlocks[serviceId] = [
        ...filterById(volatileBlocks[serviceId], volatile),
        { ...volatile, id: newId },
      ];
      return;
    }

    // Block was not volatile
    // Rename block in API
    const widgetStore = useWidgetStore();
    await sparkApi.renameBlock(serviceId, currentId, newId);
    await fetchBlocks(serviceId);

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
  }

  async function removeBlock(block: Block): Promise<void> {
    if (isBlockVolatile(block)) {
      const { serviceId } = block;
      volatileBlocks[serviceId] = filterById(volatileBlocks[serviceId], block);
    } else {
      await sparkApi.deleteBlock(block); // triggers patch event
    }
  }

  async function clearBlocks(serviceId: string): Promise<void> {
    await sparkApi.clearBlocks(serviceId);
    await fetchBlocks(serviceId);
  }

  function invalidateBlocks(serviceId: string): void {
    blocks[serviceId] = [];
    relations[serviceId] = [];
    driveChains[serviceId] = [];
    lastBlocksAt[serviceId] = null;
  }

  async function saveAutoConnecting(
    serviceId: string,
    enabled: boolean,
  ): Promise<void> {
    await sparkApi.persistAutoconnecting(serviceId, enabled);
  }

  async function clearDiscoveredBlocks(serviceId: string): Promise<void> {
    discoveredBlockIds[serviceId] = [];
  }

  async function cleanUnusedNames(serviceId: string): Promise<string[]> {
    return await sparkApi.cleanUnusedNames(serviceId);
  }

  async function fetchBlock(block: Block): Promise<void> {
    const fetched = await sparkApi.fetchBlock(block);
    if (!isBlockVolatile(block)) {
      blocks[block.serviceId] = concatById(blocks[block.serviceId], fetched);
    }
  }

  async function fetchStoredBlock(
    serviceId: string,
    nid: number,
  ): Promise<Block> {
    return await sparkApi.fetchStoredBlock(serviceId, nid);
  }

  async function fetchBlocks(serviceId: string): Promise<void> {
    updateBlocks(serviceId, await sparkApi.fetchBlocks(serviceId));
  }

  async function fetchDiscoveredBlocks(serviceId: string): Promise<string[]> {
    const discovered = (await sparkApi.fetchDiscoveredBlocks(serviceId)).map(
      (v) => v.id,
    );
    discoveredBlockIds[serviceId].push(...discovered);
    return discovered;
  }

  async function fetchAll(serviceId: string): Promise<boolean> {
    const serviceStore = useServiceStore();
    const status = await sparkApi.fetchSparkStatus(serviceId);
    updateStatus(status);
    serviceStore.updateStatus(asServiceStatus(status));
    if (status.isSynchronized) {
      await Promise.all([
        fetchDiscoveredBlocks(serviceId),
        fetchBlocks(serviceId),
      ]);
    }
    return !!status.isSynchronized;
  }

  async function serviceExport(serviceId: string): Promise<SparkExported> {
    return await sparkApi.serviceExport(serviceId);
  }

  async function serviceImport(
    serviceId: string,
    exported: SparkExported,
  ): Promise<string[]> {
    const importLog = await sparkApi.serviceImport(serviceId, exported);
    await fetchBlocks(serviceId);
    return importLog;
  }

  async function flashFirmware(serviceId: string): Promise<any> {
    return await sparkApi.flashFirmware(serviceId);
  }

  async function controllerReboot(serviceId: string): Promise<void> {
    await sparkApi.controllerReboot(serviceId);
  }

  async function serviceReboot(serviceId: string): Promise<void> {
    await sparkApi.serviceReboot(serviceId);
  }

  function storageKey(serviceId: string): string {
    return `storage__Spark__${serviceId}`;
  }

  function updateBlocks(serviceId: string, values: Block[]): void {
    blocks[serviceId] = values;
    lastBlocksAt[serviceId] = new Date();
  }

  function updateComputed(
    serviceId: string,
    newRelations: BlockRelation[],
    newDriveChains: BlockDriveChain[],
  ): void {
    relations[serviceId] = newRelations;
    driveChains[serviceId] = newDriveChains;
  }

  function patchBlocks(evt: SparkPatchEvent): void {
    const serviceId = evt.key;
    const { changed, deleted } = evt.data;
    const affected = [...changed.map((block) => block.id), ...deleted];
    blocks[serviceId] = [
      ...blocks[serviceId].filter((v) => !affected.includes(v.id)),
      ...changed.map(deserialize),
    ];
  }

  function updateStatus(status: SparkStatus): void {
    const { serviceId } = status;
    statuses[serviceId] = status;
    lastStatusAt[serviceId] = new Date();
  }

  async function loadSessionConfig(serviceId: string): Promise<void> {
    try {
      const rawConfig: string | null = sessionStorage.getItem(
        storageKey(serviceId),
      );
      sessionConfigs[serviceId] = rawConfig
        ? JSON.parse(rawConfig)
        : defaultSessionConfig();
    } catch (e) {
      sessionConfigs[serviceId] = defaultSessionConfig();
    }
  }

  async function updateSessionConfig(
    serviceId: string,
    updates: Partial<SparkSessionConfig>,
  ): Promise<void> {
    sessionConfigs[serviceId] = { ...sessionConfigs[serviceId], ...updates };
    try {
      sessionStorage.setItem(
        storageKey(serviceId),
        JSON.stringify(sessionConfigs[serviceId]),
      );
    } catch (e) {
      // ignore
    }
  }

  async function addService(serviceId: string): Promise<void> {
    if (serviceIds.includes(serviceId)) {
      throw new Error(`Spark service '${serviceId}' already exists`);
    }

    serviceIds.push(serviceId);
    blocks[serviceId] = [];
    volatileBlocks[serviceId] = [];
    discoveredBlockIds[serviceId] = [];
    statuses[serviceId] = null;
    relations[serviceId] = [];
    driveChains[serviceId] = [];
    lastBlocksAt[serviceId] = null;
    lastStatusAt[serviceId] = null;
    sessionConfigs[serviceId] = defaultSessionConfig();

    stateListenerIds[serviceId] = eventbus.addListener(
      `${STATE_TOPIC}/${serviceId}`,
      (_, evt) => {
        if (isSparkState(evt)) {
          const serviceStore = useServiceStore();
          const status = asSparkStatus(serviceId, evt.data.status);
          const blocks = evt.data.blocks.map(deserialize);

          updateBlocks(serviceId, blocks);
          updateStatus(status);
          updateComputed(serviceId, evt.data.relations, evt.data.drive_chains);
          serviceStore.updateStatus(asServiceStatus(status));
        }
      },
    );

    patchListenerIds[serviceId] = eventbus.addListener(
      `${STATE_TOPIC}/${serviceId}/patch`,
      (_, evt) => {
        if (isSparkPatch(evt)) {
          patchBlocks(evt);
        }
      },
    );

    await fetchAll(serviceId).catch(() => {});
    await loadSessionConfig(serviceId);
  }

  async function removeService(serviceId: string): Promise<void> {
    if (!serviceIds.includes(serviceId)) {
      return;
    }
    serviceIds.splice(serviceIds.indexOf(serviceId), 1);
    eventbus.removeListener(stateListenerIds[serviceId]);
    eventbus.removeListener(patchListenerIds[serviceId]);
    delete blocks[serviceId];
    delete volatileBlocks[serviceId];
    delete discoveredBlockIds[serviceId];
    delete statuses[serviceId];
    delete relations[serviceId];
    delete driveChains[serviceId];
    delete lastBlocksAt[serviceId];
    delete lastStatusAt[serviceId];
    delete sessionConfigs[serviceId];
  }

  return {
    serviceIds,
    has,

    blocksByService,
    blocksByType,
    blockById,
    blockByAddress,
    blockByLink,

    fieldByAddress,

    discoveredBlockIdsByService,
    statusByService,
    relationsByService,
    driveChainsByService,
    lastBlocksAtByService,
    lastStatusAtByService,
    sessionConfigByService,

    setVolatileBlock,
    removeVolatileBlock,

    createBlock,
    saveBlock,
    modifyBlock,
    renameBlock,
    removeBlock,

    clearBlocks,
    invalidateBlocks,
    saveAutoConnecting,
    clearDiscoveredBlocks,
    cleanUnusedNames,

    fetchBlock,
    fetchStoredBlock,
    fetchBlocks,
    fetchDiscoveredBlocks,
    fetchAll,

    serviceExport,
    serviceImport,

    flashFirmware,
    controllerReboot,
    serviceReboot,

    updateSessionConfig,
    addService,
    removeService,
  };
});
