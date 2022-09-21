import { concatById, filterById, findById } from '@/utils/collections';
import { defineStore } from 'pinia';
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
