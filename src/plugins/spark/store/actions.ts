import { dispatch } from '@/helpers/dynamic-store';
import { allDashboardItems } from '@/store/dashboards/getters';
import { setDashboardItem } from '@/store/dashboards/mutations';
import { saveService } from '@/store/services/actions';
import { Service } from '@/store/services/state';
import { RootState, RootStore } from '@/store/state';
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
  fetchSavepoints as fetchSavepointsInApi,
  writeSavepoint as writeSavepointInApi,
  applySavepoint as applySavepointInApi,
  removeSavepoint as removeSavepointInApi,
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
  setSavepoints as setSavepointsInStore,
} from './mutations';
import { BlocksContext, SparkState } from './state';

export const actions: ActionTree<SparkState, RootState> = {
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

export const updateGroupNames = (store: RootStore, id: string, names: string[]) => {
  const existing = sparkServiceById(store, id);
  saveService(store, {
    ...existing,
    config: {
      ...existing.config,
      groupNames: names,
    },
  });
};

export const fetchBlocks = async (store: RootStore, serviceId: string) =>
  setBlocksInStore(store, serviceId, await fetchBlocksInApi(serviceId));

export const renameBlock = async (
  store: RootStore,
  serviceId: string,
  currentId: string,
  newId: string,
) => {
  if (blockIds(store, serviceId).includes(newId)) {
    throw new Error(`Block ${newId} already exists`);
  }
  await renameBlockInApi(serviceId, currentId, newId);
  await fetchBlocks(store, serviceId);
  allDashboardItems(store)
    .filter(item => item.config.serviceId === serviceId && item.config.blockId === currentId)
    .forEach(item => setDashboardItem(store, { ...item, config: { ...item.config, blockId: newId } }));
};

export const clearBlocks = async (store: RootStore, service: Service) => {
  await clearBlocksInApi(service.id);
  await fetchBlocks(store, service.id);
};

export const fetchServiceStatus = async (store: RootStore, serviceId: string) =>
  setLastStatusInStore(store, serviceId, await fetchSystemStatusInApi(serviceId));

export const fetchUnits = async (store: RootStore, serviceId: string) =>
  setUnitsInStore(store, serviceId, await fetchUnitsInApi(serviceId));

export const saveUnits = async (store: RootStore, serviceId: string, units: UserUnits) =>
  setUnitsInStore(store, serviceId, await persistUnitsInApi(serviceId, units));

export const fetchUnitAlternatives = async (store: RootStore, serviceId: string) =>
  setUnitAlternativesInStore(store, serviceId, await fetchUnitAlternativesInApi(serviceId));

export const fetchCompatibleBlocks = async (store: RootStore, serviceId: string, type: string) =>
  setCompatibleBlocksInStore(
    store,
    serviceId,
    { type, ids: await fetchCompatibleBlocksInApi(serviceId, type) },
  );

export const fetchDiscoveredBlocks = async (store: RootStore, serviceId: string) => {
  const newIds = await fetchDiscoveredBlocksInApi(serviceId);
  setDiscoveredBlocksInStore(store, serviceId, [...discoveredBlocks(store, serviceId), ...newIds]);
};

export const clearDiscoveredBlocks = async (store: RootStore, serviceId: string) =>
  setDiscoveredBlocksInStore(store, serviceId, []);

export const fetchSavepoints = async (store: RootStore, serviceId: string) =>
  setSavepointsInStore(store, serviceId, await fetchSavepointsInApi(serviceId));

export const fetchAll = async (store: RootStore, service: Service) =>
  Promise.all([
    fetchServiceStatus(store, service.id),
    fetchUnits(store, service.id),
    fetchUnitAlternatives(store, service.id),
    fetchSavepoints(store, service.id),
  ]);

export const createUpdateSource = async (store: RootStore, serviceId: string) =>
  setUpdateSourceInStore(
    store,
    serviceId,
    await fetchUpdateSourceInApi(
      serviceId,
      blocks => setBlocksInStore(store, serviceId, blocks),
      () => setUpdateSourceInStore(store, serviceId, null),
    ),
  );

export const validateService = async (serviceId: string) =>
  validateServiceInApi(serviceId);

export const writeSavepoint = async (store: RootStore, serviceId: string, savepointId: string) => {
  await writeSavepointInApi(serviceId, savepointId);
  await fetchSavepoints(store, serviceId);
};

export const applySavepoint = async (store: RootStore, serviceId: string, savepointId: string) =>
  applySavepointInApi(serviceId, savepointId);

export const removeSavepoint = async (store: RootStore, serviceId: string, savepointId: string) => {
  await removeSavepointInApi(serviceId, savepointId);
  await fetchSavepoints(store, serviceId);
};
