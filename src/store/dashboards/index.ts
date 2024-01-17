import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { makeObjectSorter } from '@/utils/functional';
import api from './api';
import type { Dashboard } from './types';

export * from './types';

const sorter = makeObjectSorter<Dashboard>('id');

export const useDashboardStore = defineStore('dashboardStore', () => {
  const dashboardMap = reactive<Mapped<Dashboard>>({});

  const dashboards = computed<Dashboard[]>(() =>
    Object.values(dashboardMap).sort(sorter),
  );

  const dashboardIds = computed<string[]>(() =>
    dashboards.value.map((v) => v.id),
  );

  function dashboardById(id: Maybe<string>): Dashboard | null {
    return dashboardMap[id ?? ''] ?? null;
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
    (await api.fetch()).forEach((v) => (dashboardMap[v.id] = v));
    api.subscribe(
      (dashboard) => (dashboardMap[dashboard.id] = dashboard),
      (id) => delete dashboardMap[id],
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
