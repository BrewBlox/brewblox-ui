import { createAccessors } from '@/helpers/static-store';
import { GetterTree } from 'vuex';
import { RootState, RootStore } from '../state';
import { Dashboard, DashboardContext, DashboardItem, DashboardState } from './state';

const { read } = createAccessors('dashboards');

export const getters: GetterTree<DashboardState, RootState> = {
  replicatingDashboards: (state: DashboardState): boolean => state.replicatingDashboards,
  dashboards: (state: DashboardState): { [id: string]: Dashboard } => state.dashboards,
  dashboardIds: (state: DashboardState): string[] => Object.keys(state.dashboards),
  dashboardValues: (state: DashboardState): Dashboard[] => Object.values(state.dashboards),
  replicatingItems: (state: DashboardState): boolean => state.replicatingItems,
  items: (state: DashboardState): { [id: string]: DashboardItem } => state.items,
  itemIds: (state: DashboardState): string[] => Object.keys(state.items),
  itemValues: (state: DashboardState): DashboardItem[] => Object.values(state.items),
  primaryDashboardId: (state: DashboardState): string | null => {
    const sorted = Object
      .values(state.dashboards)
      .sort((left, right) => {
        if (left.primary && !right.primary) {
          return -1;
        }
        if (!left.primary && right.primary) {
          return 1;
        }
        return left.order - right.order;
      });
    return sorted.length > 0
      ? sorted[0].id
      : null;
  },
};

export const replicatingDashboards = read(getters.replicatingDashboards);
export const dashboards = read(getters.dashboards);
export const dashboardIds = read(getters.dashboardIds);
export const dashboardValues = read(getters.dashboardValues);

export const replicatingItems = read(getters.replicatingItems);
export const dashboardItems = read(getters.items);
export const dashboardItemIds = read(getters.itemIds);
export const dashboardItemValues = read(getters.itemValues);
export const primaryDashboardId = read(getters.primaryDashboardId);

export const dashboardById =
  (store: RootStore | DashboardContext, id: string): Dashboard =>
    dashboards(store)[id];

export const dashboardItemById =
  (store: RootStore | DashboardContext, id: string): DashboardItem =>
    dashboardItems(store)[id];

export const dashboardItemsByDashboardId =
  (store: RootStore | DashboardContext, id: string): DashboardItem[] =>
    dashboardItemValues(store)
      .filter(item => item.dashboard === id);

export const itemCopyName =
  (store: RootStore | DashboardContext, id: string): string => {
    const existingIds = dashboardItemIds(store);
    if (!existingIds.includes(id)) {
      return id;
    }

    const copyName = (i: number): string =>
      (id.match(/\(\d+\)$/)
        ? id.replace(/\(\d+\)$/, `(${i})`)
        : `${id}(${i})`);

    let idx = 2;
    while (existingIds.includes(copyName(idx))) {
      idx += 1;
    }
    return copyName(idx);
  };
