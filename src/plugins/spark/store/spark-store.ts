import {
  Block,
  BlockClaim,
  BlockRelation,
  Link,
  SparkPatchEvent,
  SparkStatusDescription,
} from 'brewblox-proto/ts';
import { defineStore } from 'pinia';
import { ref } from 'vue';
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
import { isSparkPatch, isSparkState } from '../utils/info';
import * as sparkApi from './spark-api';
import {
  asServiceStatus,
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

export const useSparkStore = defineStore('sparkStore', () => {
  const serviceIds = ref<string[]>([]);
  const stateListenerIds = ref<ByService<string>>({});
  const patchListenerIds = ref<ByService<string>>({});
  const blocks = ref<ByService<Block[]>>({});
  const discoveredBlockIds = ref<ByService<string[]>>({});
  const statuses = ref<ByService<SparkStatusDescription | null>>({});
  const relations = ref<ByService<BlockRelation[]>>({});
  const claims = ref<ByService<BlockClaim[]>>({});
  const lastBlocksAt = ref<ByService<Date | null>>({});
  const lastStatusAt = ref<ByService<Date | null>>({});
  const sessionConfigs = ref<ByService<SparkSessionConfig>>({});

  function has(serviceId: Maybe<string>): serviceId is string {
    return serviceId != null && serviceIds.value.includes(serviceId);
  }

  function blocksByService(serviceId: Maybe<string>): Block[] {
    if (!has(serviceId)) {
      return [];
    }
    return blocks.value[serviceId];
  }

  function blocksByType<T extends Block>(
    serviceId: Maybe<string>,
    type: T['type'],
  ): T[] {
    if (!has(serviceId)) {
      return [];
    }
    return blocks.value[serviceId].filter(makeTypeFilter<T>(type));
  }

  function blockById<T extends Block>(
    serviceId: Maybe<string>,
    blockId: Maybe<string>,
  ): T | null {
    if (!has(serviceId) || !blockId) {
      return null;
    }
    return findBlockById(blocks.value[serviceId], blockId);
  }

  function blockByAddress<T extends Block>(
    addr: T | Maybe<BlockAddress>,
  ): T | null {
    const serviceId = addr?.serviceId;
    if (!has(serviceId)) {
      return null;
    }
    return findBlockByAddress(blocks.value[serviceId], addr);
  }

  function blockByLink<T extends Block>(
    serviceId: Maybe<string>,
    link: Maybe<Link>,
  ): T | null {
    const blockId = link?.id;
    if (!has(serviceId) || !blockId) {
      return null;
    }
    return findBlockById(blocks.value[serviceId], blockId);
  }

  function fieldByAddress(addr: Maybe<BlockFieldAddress>): any {
    const serviceId = addr?.serviceId;
    if (!has(serviceId)) {
      return null;
    }
    return findBlockFieldByAddress(blocks.value[serviceId], addr);
  }

  function discoveredBlockIdsByService(serviceId: Maybe<string>): string[] {
    return has(serviceId) ? discoveredBlockIds.value[serviceId] : [];
  }

  function statusByService(
    serviceId: Maybe<string>,
  ): SparkStatusDescription | null {
    return has(serviceId) ? statuses.value[serviceId] : null;
  }

  function relationsByService(serviceId: Maybe<string>): BlockRelation[] {
    return has(serviceId) ? relations.value[serviceId] : [];
  }

  function claimsByService(serviceId: Maybe<string>): BlockClaim[] {
    return has(serviceId) ? claims.value[serviceId] : [];
  }

  function lastBlocksAtByService(serviceId: Maybe<string>): Date | null {
    return has(serviceId) ? lastBlocksAt.value[serviceId] : null;
  }

  function lastStatusAtByService(serviceId: Maybe<string>): Date | null {
    return has(serviceId) ? lastStatusAt.value[serviceId] : null;
  }

  function sessionConfigByService(
    serviceId: Maybe<string>,
  ): SparkSessionConfig {
    return has(serviceId)
      ? sessionConfigs.value[serviceId]
      : defaultSessionConfig();
  }

  async function createBlock(block: Block): Promise<void> {
    await sparkApi.createBlock(block); // triggers patch event
  }

  async function saveBlock(block: Block): Promise<void> {
    await sparkApi.persistBlock(block); // triggers patch event
  }

  async function patchBlock<T extends Block>(
    block: Maybe<T>,
    data: Partial<T['data']>,
  ): Promise<void> {
    if (block) {
      await sparkApi.patchBlock(block, data); // triggers patch event
    }
  }

  async function removeBlock(block: Block): Promise<void> {
    await sparkApi.deleteBlock(block); // triggers patch event
  }

  async function batchCreateBlocks(blocks: Block[]): Promise<void> {
    await sparkApi.batchCreateBlocks(blocks); // triggers patch event
  }

  async function batchSaveBlocks(blocks: Block[]): Promise<void> {
    await sparkApi.batchPersistBlocks(blocks); // triggers patch event
  }

  async function batchPatchBlocks(
    args: BlockPatchArgs<Block>[],
  ): Promise<void> {
    await sparkApi.batchPatchBlocks(args); // triggers patch event
  }

  async function batchRemoveBlocks(blocks: Block[]): Promise<void> {
    await sparkApi.batchDeleteBlocks(blocks); // triggers patch event
  }

  async function renameBlock(
    serviceId: string,
    currentId: string,
    newId: string,
  ): Promise<void> {
    if (!has(serviceId)) {
      throw new Error(`Unknown service: '${serviceId}'`);
    }

    if (findBlockById(blocks.value[serviceId], newId)) {
      throw new Error(`Block ${newId} already exists`);
    }

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

  async function clearBlocks(serviceId: string): Promise<void> {
    await sparkApi.clearBlocks(serviceId);
    await fetchBlocks(serviceId);
  }

  function invalidateBlocks(serviceId: string): void {
    blocks.value[serviceId] = [];
    relations.value[serviceId] = [];
    claims.value[serviceId] = [];
    lastBlocksAt.value[serviceId] = null;
  }

  async function saveAutoConnecting(
    serviceId: string,
    enabled: boolean,
  ): Promise<void> {
    await sparkApi.persistAutoconnecting(serviceId, enabled);
  }

  async function clearDiscoveredBlocks(serviceId: string): Promise<void> {
    discoveredBlockIds.value[serviceId] = [];
  }

  async function cleanUnusedNames(serviceId: string): Promise<string[]> {
    return await sparkApi.cleanUnusedNames(serviceId);
  }

  async function fetchBlock(block: Maybe<Block>): Promise<void> {
    if (block) {
      const fetched = await sparkApi.fetchBlock(block);

      blocks.value[block.serviceId] = concatById(
        blocks.value[block.serviceId],
        fetched,
      );
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
    discoveredBlockIds.value[serviceId].push(...discovered);
    return discovered;
  }

  async function fetchAll(serviceId: string): Promise<boolean> {
    const serviceStore = useServiceStore();
    const status = await sparkApi.fetchSparkStatus(serviceId);
    updateStatus(serviceId, status);
    serviceStore.updateStatus(asServiceStatus(serviceId, status));
    const synchronized = status?.connection_status === 'SYNCHRONIZED';
    if (synchronized) {
      await Promise.all([
        fetchDiscoveredBlocks(serviceId),
        fetchBlocks(serviceId),
      ]);
    }
    return synchronized;
  }

  async function serviceExport(serviceId: string): Promise<SparkBackup> {
    return await sparkApi.serviceExport(serviceId);
  }

  async function serviceImport(
    serviceId: string,
    data: SparkBackup,
  ): Promise<string[]> {
    const messages = await sparkApi.serviceImport(serviceId, data);
    await fetchBlocks(serviceId);
    return messages;
  }

  async function allStoredBackup(serviceId: string): Promise<string[]> {
    return await sparkApi.allStoredBackup(serviceId);
  }

  async function saveStoredBackup(
    serviceId: string,
    name: string,
  ): Promise<SparkBackup> {
    return await sparkApi.saveStoredBackup(serviceId, name);
  }

  async function loadStoredBackup(
    serviceId: string,
    name: string,
  ): Promise<string[]> {
    const messages = await sparkApi.loadStoredBackup(serviceId, name);
    await fetchBlocks(serviceId);
    return messages;
  }

  async function uploadStoredBackup(
    serviceId: string,
    data: SparkBackup,
  ): Promise<SparkBackup> {
    return await sparkApi.uploadStoredBackup(serviceId, data);
  }

  async function downloadStoredBackup(
    serviceId: string,
    name: string,
  ): Promise<SparkBackup> {
    return await sparkApi.downloadStoredBackup(serviceId, name);
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

  function updateBlocks(serviceId: string, values: Block[]): void {
    blocks.value[serviceId] = values;
    lastBlocksAt.value[serviceId] = new Date();
  }

  function updateComputed(
    serviceId: string,
    relationValues: BlockRelation[],
    claimValues: BlockClaim[],
  ): void {
    relations.value[serviceId] = relationValues;
    claims.value[serviceId] = claimValues;
  }

  function patchBlocks(evt: SparkPatchEvent): void {
    const serviceId = evt.key;
    const { changed, deleted } = evt.data;
    const affected = [...changed.map((block) => block.id), ...deleted];
    blocks.value[serviceId] = [
      ...blocks.value[serviceId].filter((v) => !affected.includes(v.id)),
      ...changed.map(deserialize),
    ];
  }

  function updateStatus(
    serviceId: string,
    status: SparkStatusDescription | null,
  ): void {
    statuses.value[serviceId] = status;
    lastStatusAt.value[serviceId] = new Date();
  }

  async function loadSessionConfig(serviceId: string): Promise<void> {
    try {
      const rawConfig: string | null = sessionStorage.getItem(
        storageKey(serviceId),
      );
      sessionConfigs.value[serviceId] = rawConfig
        ? JSON.parse(rawConfig)
        : defaultSessionConfig();
    } catch (e) {
      sessionConfigs.value[serviceId] = defaultSessionConfig();
    }
  }

  async function updateSessionConfig(
    serviceId: string,
    updates: Partial<SparkSessionConfig>,
  ): Promise<void> {
    sessionConfigs.value[serviceId] = {
      ...sessionConfigs.value[serviceId],
      ...updates,
    };
    try {
      sessionStorage.setItem(
        storageKey(serviceId),
        JSON.stringify(sessionConfigs.value[serviceId]),
      );
    } catch (e) {
      // ignore
    }
  }

  async function addService(serviceId: string): Promise<void> {
    if (has(serviceId)) {
      throw new Error(`Spark service '${serviceId}' already exists`);
    }

    serviceIds.value.push(serviceId);
    blocks.value[serviceId] = [];
    discoveredBlockIds.value[serviceId] = [];
    statuses.value[serviceId] = null;
    relations.value[serviceId] = [];
    claims.value[serviceId] = [];
    lastBlocksAt.value[serviceId] = null;
    lastStatusAt.value[serviceId] = null;
    sessionConfigs.value[serviceId] = defaultSessionConfig();

    stateListenerIds.value[serviceId] = eventbus.addListener(
      `${STATE_TOPIC}/${serviceId}`,
      (_, evt) => {
        if (isSparkState(evt)) {
          const serviceStore = useServiceStore();
          if (evt.data) {
            const blocks = evt.data.blocks.map(deserialize);
            const { status, relations, claims } = evt.data;

            updateBlocks(serviceId, blocks);
            updateStatus(serviceId, status);
            updateComputed(serviceId, relations, claims);
            serviceStore.updateStatus(asServiceStatus(serviceId, status));
          } else {
            updateBlocks(serviceId, []);
            updateStatus(serviceId, null);
            updateComputed(serviceId, [], []);
            serviceStore.updateStatus(asServiceStatus(serviceId, null));
          }
        }
      },
    );

    patchListenerIds.value[serviceId] = eventbus.addListener(
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
    if (!has(serviceId)) {
      return;
    }
    serviceIds.value.splice(serviceIds.value.indexOf(serviceId), 1);
    eventbus.removeListener(stateListenerIds.value[serviceId]);
    eventbus.removeListener(patchListenerIds.value[serviceId]);
    delete stateListenerIds.value[serviceId];
    delete patchListenerIds.value[serviceId];
    delete blocks.value[serviceId];
    delete discoveredBlockIds.value[serviceId];
    delete statuses.value[serviceId];
    delete relations.value[serviceId];
    delete claims.value[serviceId];
    delete lastBlocksAt.value[serviceId];
    delete lastStatusAt.value[serviceId];
    delete sessionConfigs.value[serviceId];
  }

  return {
    serviceIds,
    stateListenerIds,
    patchListenerIds,
    blocks,
    discoveredBlockIds,
    statuses,
    relations,
    claims,
    lastBlocksAt,
    lastStatusAt,
    sessionConfigs,

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
    claimsByService,
    lastBlocksAtByService,
    lastStatusAtByService,
    sessionConfigByService,
    createBlock,
    saveBlock,
    patchBlock,
    removeBlock,
    batchCreateBlocks,
    batchSaveBlocks,
    batchPatchBlocks,
    batchRemoveBlocks,
    renameBlock,
    clearBlocks,
    invalidateBlocks,
    saveAutoConnecting,
    clearDiscoveredBlocks,
    cleanUnusedNames,
    fetchBlock,
    fetchStoredBlock,
    serviceExport,
    serviceImport,
    allStoredBackup,
    saveStoredBackup,
    loadStoredBackup,
    uploadStoredBackup,
    downloadStoredBackup,
    flashFirmware,
    controllerReboot,
    serviceReboot,
    loadSessionConfig,
    updateSessionConfig,
    addService,
    removeService,
  };
});
