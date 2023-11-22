import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { concatById, filterById, findById } from '@/utils/collections';
import api from './api';
import type { Dashboard } from './types';

export * from './types';

export const useDashboardStore = defineStore('dashboardStore', () => {
  const dashboards = ref<Dashboard[]>([]);

  const dashboardIds = computed<string[]>(() =>
    dashboards.value.map((v) => v.id),
  );

  function dashboardById(id: Maybe<string>): Dashboard | null {
    return findById(dashboards.value, id);
  }

  function dashboardTitle(id: Maybe<string>): string {
    return dashboardById(id)?.title ?? 'Unknown';
  }

  async function createDashboard(dashboard: Dashboard): Promise<void> {
    await api.create(dashboard); // triggers callback
  }

  async function saveDashboard(dashboard: Dashboard): Promise<void> {
    await api.persist(dashboard); // triggers callback
  }

  async function removeDashboard(dashboard: Dashboard): Promise<void> {
    await api.remove(dashboard); // triggers callback
  }

  async function start(): Promise<void> {
    dashboards.value = await api.fetch();
    api.subscribe(
      (dashboard) =>
        (dashboards.value = concatById(dashboards.value, dashboard)),
      (id) => (dashboards.value = filterById(dashboards.value, { id })),
    );
  }

  return {
    dashboards,
    dashboardIds,
    dashboardById,
    dashboardTitle,
    createDashboard,
    saveDashboard,
    removeDashboard,
    start,
  };
});
