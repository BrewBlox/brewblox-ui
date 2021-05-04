import { Action, Module, VuexModule } from 'vuex-class-modules';

import store from '@/store';
import { extendById, filterById, findById } from '@/utils/functional';

import api from './api';
import type { Dashboard } from './types';

export * from './types';

@Module({ generateMutationSetters: true })
export class DashboardModule extends VuexModule {
  public dashboards: Dashboard[] = [];

  public get dashboardIds(): string[] {
    return this.dashboards.map(v => v.id);
  }

  public dashboardById(id: Nullable<string>): Dashboard | null {
    return findById(this.dashboards, id);
  }

  public dashboardTitle(id: Nullable<string>): string {
    return this.dashboardById(id)?.title ?? 'Unknown';
  }

  @Action
  public async createDashboard(dashboard: Dashboard): Promise<void> {
    await api.create(dashboard); // triggers callback
  }

  @Action
  public async saveDashboard(dashboard: Dashboard): Promise<void> {
    await api.persist(dashboard);// triggers callback
  }

  @Action
  public async updateDashboardOrder(ids: string[]): Promise<void> {
    await Promise.all(
      ids
        .map(id => this.dashboardById(id))
        .filter((v): v is Dashboard => v !== null)
        .map((dashboard, idx) => {
          const order = idx + 1;
          if (order !== dashboard.order) {
            this.saveDashboard({ ...dashboard, order });
          }
        }),
    );
  }

  @Action
  public async removeDashboard(dashboard: Dashboard): Promise<void> {
    await api.remove(dashboard); // triggers callback
  }

  @Action
  public async start(): Promise<void> {
    this.dashboards = await api.fetch();
    api.subscribe(
      dashboard => this.dashboards = extendById(this.dashboards, dashboard),
      id => this.dashboards = filterById(this.dashboards, { id }),
    );
  }
}

export const dashboardStore = new DashboardModule({ store, name: 'dashboards' });
