import { defineStore } from 'pinia';

import { concatById, filterById, findById } from '@/utils/collections';
import { nullFilter } from '@/utils/functional';

import api from './api';
import type { Dashboard } from './types';

export * from './types';

interface DashboardStoreState {
  dashboards: Dashboard[];
}

export const useDashboardStore = defineStore('dashboardStore', {
  state: (): DashboardStoreState => ({
    dashboards: [],
  }),
  getters: {
    dashboardIds: (state): string[] => state.dashboards.map((v) => v.id),
  },
  actions: {
    dashboardById(id: Maybe<string>): Dashboard | null {
      return findById(this.dashboards, id);
    },

    dashboardTitle(id: Maybe<string>): string {
      return this.dashboardById(id)?.title ?? 'Unknown';
    },

    async createDashboard(dashboard: Dashboard): Promise<void> {
      await api.create(dashboard); // triggers callback
    },

    async saveDashboard(dashboard: Dashboard): Promise<void> {
      await api.persist(dashboard); // triggers callback
    },

    async updateDashboardOrder(ids: string[]): Promise<void> {
      await Promise.all(
        ids
          .map((id) => this.dashboardById(id))
          .filter(nullFilter)
          .map((dashboard, idx) => {
            const order = idx + 1;
            if (order !== dashboard.order) {
              this.saveDashboard({ ...dashboard, order });
            }
          }),
      );
    },

    async removeDashboard(dashboard: Dashboard): Promise<void> {
      await api.remove(dashboard); // triggers callback
    },

    async start(): Promise<void> {
      this.dashboards = await api.fetch();
      api.subscribe(
        (dashboard) =>
          (this.dashboards = concatById(this.dashboards, dashboard)),
        (id) => (this.dashboards = filterById(this.dashboards, { id })),
      );
    },
  },
});
