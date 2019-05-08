import { dispatch } from '@/helpers/dynamic-store';
import dashboardStore from '@/store/dashboards';
import serviceStore from '@/store/services';
import { Service } from '@/store/services/state';
import { RootStore } from '@/store/state';
import { ActionTree } from 'vuex';
import { Block, UserUnits } from '../state';
import {
  clearBlocks as clearBlocksInApi,
  createBlock as createBlockInApi,
  deleteBlock as deleteBlockInApi,
  fetchBlock as fetchBlockInApi,
  fetchBlocks as fetchBlocksInApi,
  fetchCompatibleBlocks as fetchCompatibleBlocksInApi,
  fetchDiscoveredBlocks as fetchDiscoveredBlocksInApi,
  fetchUnitAlternatives as fetchUnitAlternativesInApi,
  fetchUnits as fetchUnitsInApi,
  fetchUpdateSource as fetchUpdateSourceInApi,
  persistBlock as persistBlockInApi,
  persistUnits as persistUnitsInApi,
  renameBlock as renameBlockInApi,
  validateService as validateServiceInApi,
  fetchSystemStatus as fetchSystemStatusInApi,
  serviceExport as serviceExportInApi,
  serviceImport as serviceImportInApi,
} from './api';
import {
  blockIds,
  discoveredBlocks,
  sparkServiceById,
} from './getters';
import {
  addBlock as addBlockInStore,
  mutateBlock as mutateBlockInStore,
  removeBlock as removeBlockInStore,
  setBlocks as setBlocksInStore,
  setCompatibleBlocks as setCompatibleBlocksInStore,
  setDiscoveredBlocks as setDiscoveredBlocksInStore,
  setUnitAlternatives as setUnitAlternativesInStore,
  setUnits as setUnitsInStore,
  setUpdateSource as setUpdateSourceInStore,
  setLastStatus as setLastStatusInStore,
} from './mutations';
import { BlocksContext, SparkState } from './state';

export const actions: ActionTree<SparkState, {}> = {
  fetchBlock: async (context: BlocksContext, block: Block) =>
    mutateBlockInStore(context, block.serviceId, await fetchBlockInApi(block)),

  createBlock: async (context: BlocksContext, block: Block) =>
    addBlockInStore(context, block.serviceId, await createBlockInApi(block)),

  saveBlock: async (context: BlocksContext, block: Block) =>
    mutateBlockInStore(context, block.serviceId, await persistBlockInApi(block)),

  removeBlock: async (context: BlocksContext, block: Block) => {
    await deleteBlockInApi(block);
    removeBlockInStore(context, block.serviceId, block.id);
  },
};

export const fetchBlock = dispatch(actions.fetchBlock);
export const createBlock = dispatch(actions.createBlock);
export const saveBlock = dispatch(actions.saveBlock);
export const removeBlock = dispatch(actions.removeBlock);

export const updateGroupNames =
  (store: RootStore, id: string, names: string[]): void => {
    const existing = sparkServiceById(store, id);
    serviceStore.saveService({
      ...existing,
      config: {
        ...existing.config,
        groupNames: names,
      },
    });
  };

export const fetchBlocks =
  async (store: RootStore, serviceId: string): Promise<void> =>
    setBlocksInStore(store, serviceId, await fetchBlocksInApi(serviceId));

export const renameBlock =
  async (store: RootStore, serviceId: string, currentId: string, newId: string): Promise<void> => {
    if (blockIds(store, serviceId).includes(newId)) {
      throw new Error(`Block ${newId} already exists`);
    }
    await renameBlockInApi(serviceId, currentId, newId);
    await fetchBlocks(store, serviceId);
    dashboardStore.itemValues
      .filter(item => item.config.serviceId === serviceId && item.config.blockId === currentId)
      .forEach(item => dashboardStore.commitDashboardItem({ ...item, config: { ...item.config, blockId: newId } }));
  };

export const clearBlocks =
  async (store: RootStore, service: Service): Promise<void> => {
    await clearBlocksInApi(service.id);
    await fetchBlocks(store, service.id);
  };

export const fetchServiceStatus =
  async (store: RootStore, serviceId: string): Promise<void> =>
    setLastStatusInStore(store, serviceId, await fetchSystemStatusInApi(serviceId));

export const fetchUnits =
  async (store: RootStore, serviceId: string): Promise<void> =>
    setUnitsInStore(store, serviceId, await fetchUnitsInApi(serviceId));

export const saveUnits =
  async (store: RootStore, serviceId: string, units: UserUnits): Promise<void> =>
    setUnitsInStore(store, serviceId, await persistUnitsInApi(serviceId, units));

export const fetchUnitAlternatives =
  async (store: RootStore, serviceId: string): Promise<void> =>
    setUnitAlternativesInStore(store, serviceId, await fetchUnitAlternativesInApi(serviceId));

export const fetchCompatibleBlocks =
  async (store: RootStore, serviceId: string, type: string): Promise<void> =>
    setCompatibleBlocksInStore(
      store,
      serviceId,
      { type, ids: await fetchCompatibleBlocksInApi(serviceId, type) },
    );

export const fetchDiscoveredBlocks =
  async (store: RootStore, serviceId: string): Promise<void> => {
    const newIds = await fetchDiscoveredBlocksInApi(serviceId);
    setDiscoveredBlocksInStore(store, serviceId, [...discoveredBlocks(store, serviceId), ...newIds]);
  };

export const clearDiscoveredBlocks =
  async (store: RootStore, serviceId: string): Promise<void> =>
    setDiscoveredBlocksInStore(store, serviceId, []);

export const fetchAll =
  async (store: RootStore, service: Service): Promise<void> => {
    const status = await fetchSystemStatusInApi(service.id);
    setLastStatusInStore(store, service.id, status);
    if (status.synchronized) {
      Promise.all([
        fetchUnits(store, service.id),
        fetchUnitAlternatives(store, service.id),
      ]);
    }
  };

export const createUpdateSource =
  async (store: RootStore, serviceId: string): Promise<void> =>
    setUpdateSourceInStore(
      store,
      serviceId,
      await fetchUpdateSourceInApi(
        serviceId,
        blocks => setBlocksInStore(store, serviceId, blocks),
        () => setUpdateSourceInStore(store, serviceId, null),
      ),
    );

export const validateService =
  async (serviceId: string): Promise<boolean> => validateServiceInApi(serviceId);

export const serviceExport =
  async (store: RootStore, service: Service): Promise<any> =>
    serviceExportInApi(service.id);

export const serviceImport =
  async (store: RootStore, service: Service, exported: any): Promise<string[]> => {
    const importLog = await serviceImportInApi(service.id, exported);
    await fetchBlocks(store, service.id);
    return importLog;
  };
