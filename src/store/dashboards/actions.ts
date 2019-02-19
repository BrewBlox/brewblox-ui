import { createAccessors } from '@/helpers/static-store';
import UrlSafeString from 'url-safe-string';
import { ActionTree } from 'vuex';
import { RootState, RootStore } from '../state';
import {
  createDashboard as createDashboardInApi,
  createDashboardItem as createDashboardItemInApi,
  deleteDashboard as removeDashboardInApi,
  deleteDashboardItem as removeDashboardItemInApi,
  fetchDashboardItems as fetchDashboardItemsInApi,
  fetchDashboards as fetchDashboardsInApi,
  persistDashboard as persistDashboardInApi,
  persistDashboardItem as persistDashboardItemInApi,
  setupDashboards as setupDashboardsInApi,
  setupDashboardItems as setupDashboardItemsInApi,
} from './api';
import {
  allDashboards as getAllDashboards,
  dashboardById as getDashboardInStore,
  dashboardItemById as getDashboardItemInStore,
  dashboardItemsByDashboardId,
} from './getters';
import {
  removeDashboard as removeDashboardInStore,
  removeDashboardItem as removeDashboardItemInStore,
  setdashboardItemValues as setdashboardItemValuesInStore,
  setAllDashboards as setAllDashboardsInStore,
  setDashboard as setDashboardInStore,
  setDashboardItem as setDashboardItemInStore,
} from './mutations';
import { Dashboard, DashboardContext, DashboardItem, DashboardState } from './state';

const { dispatch } = createAccessors('dashboards');

export const actions: ActionTree<DashboardState, RootState> = {
  createDashboard: async (context: DashboardContext, title: string) => {
    const id = new UrlSafeString().generate(title);
    const dashboard = {
      id,
      title,
      order: Object.keys(context.state.dashboards).length + 1,
    };
    setDashboardInStore(context, await createDashboardInApi(dashboard));
  },

  saveDashboard: async (context: DashboardContext, dashboard: Dashboard) =>
    setDashboardInStore(context, await persistDashboardInApi(dashboard)),

  updateDashboardOrder: async (context: DashboardContext, ids: string[]) =>
    ids.forEach((id, index) =>
      context.dispatch('saveDashboard', { ...getDashboardInStore(context, id), order: index + 1 })),

  updatePrimaryDashboard: async (context: DashboardContext, newId: string | null) => {
    getAllDashboards(context)
      .forEach((dash: Dashboard) => {
        if (dash.id === newId) {
          context.dispatch('saveDashboard', { ...dash, primary: true });
        } else if (dash.primary) {
          context.dispatch('saveDashboard', { ...dash, primary: false });
        }
      });
  },

  removeDashboard: async (context: DashboardContext, dashboard: Dashboard) => {
    dashboardItemsByDashboardId(context, dashboard.id)
      .forEach((item: DashboardItem) => context.dispatch('removeDashboardItem', item));
    removeDashboardInApi(dashboard).catch(() => { });
    removeDashboardInStore(context, dashboard);
  },

  createDashboardItem: async (context: DashboardContext, item: DashboardItem) =>
    setDashboardItemInStore(context, await createDashboardItemInApi(item)),

  appendDashboardItem: async (context: DashboardContext, item: DashboardItem) =>
    setDashboardItemInStore(context, await createDashboardItemInApi({
      ...item,
      order: context.getters['dashboardIds'].length,
    })),

  saveDashboardItem: async (context: DashboardContext, item: DashboardItem) =>
    setDashboardItemInStore(context, await persistDashboardItemInApi(item)),

  updateDashboardItemId: async (
    context: DashboardContext,
    { id, newId }: { id: string; newId: string },
  ) => {
    const item = getDashboardItemInStore(context, id);
    const currentItemNewId = getDashboardItemInStore(context, newId);
    if (!item) {
      throw new Error(`Unable to rename ${id}: item does not exist`);
    }
    if (currentItemNewId) {
      throw new Error(`An item with ID ${newId} already exists`);
    }
    context.dispatch('removeDashboardItem', { ...item });
    context.dispatch('createDashboardItem', { ...item, id: newId });
  },

  updateDashboardItemOrder: async (context: DashboardContext, itemIds: string[]) =>
    itemIds.forEach((id, index) => {
      const item = getDashboardItemInStore(context, id);
      const order = index + 1;
      if (item.order !== order) {
        context.dispatch('saveDashboardItem', { ...item, order });
      }
    }),

  updateDashboardItemSize: async (
    context: DashboardContext,
    { id, cols, rows }: { id: string; cols: number; rows: number },
  ) => {
    const item = getDashboardItemInStore(context, id);
    context.dispatch('saveDashboardItem', { ...item, cols, rows });
  },

  updateDashboardItemConfig: async (
    context: DashboardContext,
    { id, config }: { id: string; config: any },
  ) => {
    const item = getDashboardItemInStore(context, id);
    context.dispatch('saveDashboardItem', { ...item, config });
  },

  removeDashboardItem: async (context: DashboardContext, item: DashboardItem) => {
    removeDashboardItemInApi(item).catch(() => { });
    removeDashboardItemInStore(context, item);
  },
};

export const createDashboard = dispatch(actions.createDashboard);
export const saveDashboard = dispatch(actions.saveDashboard);
export const updateDashboardOrder = dispatch(actions.updateDashboardOrder);
export const updatePrimaryDashboard = dispatch(actions.updatePrimaryDashboard);
export const removeDashboard = dispatch(actions.removeDashboard);

export const createDashboardItem = dispatch(actions.createDashboardItem);
export const appendDashboardItem = dispatch(actions.appendDashboardItem);
export const saveDashboardItem = dispatch(actions.saveDashboardItem);
export const updateDashboardItemId = dispatch(actions.updateDashboardItemId);
export const updateDashboardItemOrder = dispatch(actions.updateDashboardItemOrder);
export const updateDashboardItemSize = dispatch(actions.updateDashboardItemSize);
export const updateDashboardItemConfig = dispatch(actions.updateDashboardItemConfig);
export const removeDashboardItem = dispatch(actions.removeDashboardItem);

export const setupApi =
  async (store: RootStore): Promise<void> => {
    /* eslint-disable no-underscore-dangle */
    const onDashboardChange = (dashboard: Dashboard): void => {
      const existing = getDashboardInStore(store, dashboard.id);
      if (!existing || existing._rev !== dashboard._rev) {
        setDashboardInStore(store, dashboard);
      }
    };
    const onDashboardDelete = (id: string): void => {
      const existing = getDashboardInStore(store, id);
      if (existing) {
        removeDashboardInStore(store, existing);
      }
    };
    const onItemChange = (item: DashboardItem): void => {
      const existing = getDashboardItemInStore(store, item.id);
      if (!existing || existing._rev !== item._rev) {
        setDashboardItemInStore(store, item);
      }
    };
    const onItemDelete = (id: string): void => {
      const existing = getDashboardItemInStore(store, id);
      if (existing) {
        removeDashboardItemInStore(store, existing);
      }
    };
    /* eslint-enable no-underscore-dangle */

    setAllDashboardsInStore(store, await fetchDashboardsInApi());
    setdashboardItemValuesInStore(store, await fetchDashboardItemsInApi());

    setupDashboardsInApi(onDashboardChange, onDashboardDelete);
    setupDashboardItemsInApi(onItemChange, onItemDelete);
  };
