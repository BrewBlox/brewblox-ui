import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { objReducer } from '@/helpers/functional';
import store from '@/store';

import { dashboardApi, widgetApi } from './api';
import { Dashboard, PersistentWidget } from './types';
export * from './types';

const rawError = true;

@Module({ store, namespaced: true, dynamic: true, name: 'dashboards' })
export class DashboardModule extends VuexModule {
  public replicatingDashboards = false;
  public dashboards: Record<string, Dashboard> = {};

  public replicatingItems = false;
  public widgets: Record<string, PersistentWidget> = {};

  public get dashboardIds(): string[] {
    return Object.keys(this.dashboards);
  }

  public get dashboardValues(): Dashboard[] {
    return Object.values(this.dashboards);
  }

  public get widgetIds(): string[] {
    return Object.keys(this.widgets);
  }

  public get widgetValues(): PersistentWidget[] {
    return Object.values(this.widgets);
  }

  public get primaryDashboardId(): string | null {
    const sorted = Object
      .values(this.dashboards)
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
  }

  public get dashboardById(): (id: string) => Dashboard {
    return id => this.dashboards[id] || null;
  }

  public get persistentWidgetById(): (id: string) => PersistentWidget {
    return id => this.widgets[id] || null;
  }

  public get persistentWidgetsByDashboardId(): (id: string) => PersistentWidget[] {
    return id => this.widgetValues.filter(widget => widget.dashboard === id);
  }

  @Mutation
  public commitDashboard(dashboard: Dashboard): void {
    Vue.set(this.dashboards, dashboard.id, { ...dashboard });
  }

  @Mutation
  public commitAllDashboards(dashboards: Dashboard[]): void {
    this.dashboards = dashboards.reduce(objReducer('id'), {});
  }

  @Mutation
  public commitRemoveDashboard(dashboard: Dashboard): void {
    Vue.delete(this.dashboards, dashboard.id);
  }

  @Mutation
  public commitReplicatingDashboards(val: boolean): void {
    this.replicatingDashboards = val;
  }

  @Mutation
  public commitPersistentWidget(widget: PersistentWidget): void {
    Vue.set(this.widgets, widget.id, { ...widget });
  }

  @Mutation
  public commitAllPersistentWidgets(widgets: PersistentWidget[]): void {
    this.widgets = widgets.reduce(objReducer('id'), {});
  }

  @Mutation
  public commitRemovePersistentWidget(widget: PersistentWidget): void {
    Vue.delete(this.widgets, widget.id);
  }

  @Mutation
  public commitReplicatingItems(val: boolean): void {
    this.replicatingItems = val;
  }

  @Action({ rawError, commit: 'commitDashboard' })
  public async createDashboard(dashboard: Dashboard): Promise<Dashboard> {
    return await dashboardApi.create(dashboard);
  }

  @Action({ rawError, commit: 'commitDashboard' })
  public async saveDashboard(dashboard: Dashboard): Promise<Dashboard> {
    return await dashboardApi.persist(dashboard);
  }

  @Action({ rawError })
  public async updateDashboardOrder(ids: string[]): Promise<void> {
    await Promise.all(
      ids
        .map(async (id, index) =>
          await this.context.dispatch(
            'saveDashboard',
            { ...this.dashboards[id], order: index + 1 },
          )));
  }

  @Action({ rawError })
  public async updatePrimaryDashboard(newId: string | null): Promise<void> {
    await Promise.all(
      this.dashboardValues
        .reduce(
          (promises: Promise<void>[], dash: Dashboard) => {
            if (dash.id === newId) {
              promises.push(this.context.dispatch('saveDashboard', { ...dash, primary: true }));
            } else if (dash.primary) {
              promises.push(this.context.dispatch('saveDashboard', { ...dash, primary: false }));
            }
            return promises;
          },
          []
        ));
  }

  @Action({ rawError, commit: 'commitRemoveDashboard' })
  public async removeDashboard(dashboard: Dashboard): Promise<Dashboard> {
    this.persistentWidgetsByDashboardId(dashboard.id)
      .forEach(widget => this.context.dispatch('removePersistentWidget', widget));
    await dashboardApi.remove(dashboard).catch(() => { });
    return dashboard;
  }

  @Action({ rawError, commit: 'commitPersistentWidget' })
  public async createPersistentWidget(widget: PersistentWidget): Promise<PersistentWidget> {
    return await widgetApi.create(widget);
  }

  @Action({ rawError, commit: 'commitPersistentWidget' })
  public async appendPersistentWidget(widget: PersistentWidget): Promise<PersistentWidget> {
    const order = this.persistentWidgetsByDashboardId(widget.dashboard).length + 1;
    return await widgetApi.create({ ...widget, order });
  }

  @Action({ rawError, commit: 'commitPersistentWidget' })
  public async savePersistentWidget(widget: PersistentWidget): Promise<PersistentWidget> {
    return await widgetApi.persist(widget);
  }

  @Action({ rawError })
  public async updatePersistentWidgetOrder(widgetIds: string[]): Promise<void> {
    await Promise.all(
      widgetIds
        .reduce(
          (promises: Promise<void>[], id, index) => {
            const widget = this.persistentWidgetById(id);
            const order = index + 1;
            if (widget.order !== order) {
              promises.push(this.context.dispatch('savePersistentWidget', { ...widget, order }));
            }
            return promises;
          },
          [],
        ));
  }

  @Action({ rawError })
  public async updatePersistentWidgetSize(
    { id, cols, rows }: { id: string; cols: number; rows: number }
  ): Promise<PersistentWidget> {
    const widget = this.persistentWidgetById(id);
    return await this.context.dispatch('savePersistentWidget', { ...widget, cols, rows });
  }

  @Action({ rawError })
  public async updatePersistentWidgetConfig({ id, config }: { id: string; config: any }): Promise<PersistentWidget> {
    const widget = this.persistentWidgetById(id);
    return await this.context.dispatch('savePersistentWidget', { ...widget, config });
  }

  @Action({ rawError, commit: 'commitRemovePersistentWidget' })
  public async removePersistentWidget(widget: PersistentWidget): Promise<PersistentWidget> {
    await widgetApi.remove(widget).catch(() => { });
    return widget;
  }

  @Action({ rawError })
  public async setup(): Promise<void> {
    const onDashboardChange = (dashboard: Dashboard): void => {
      const existing = this.dashboardById(dashboard.id);
      if (!existing || existing._rev !== dashboard._rev) {
        this.commitDashboard(dashboard);
      }
    };
    const onDashboardDelete = (id: string): void => {
      const existing = this.dashboardById(id);
      if (existing) {
        this.commitRemoveDashboard(existing);
      }
    };
    const onItemChange = (widget: PersistentWidget): void => {
      const existing = this.persistentWidgetById(widget.id);
      if (!existing || existing._rev !== widget._rev) {
        this.commitPersistentWidget(widget);
      }
    };
    const onItemDelete = (id: string): void => {
      const existing = this.persistentWidgetById(id);
      if (existing) {
        this.commitRemovePersistentWidget(existing);
      }
    };

    this.commitAllDashboards(await dashboardApi.fetch());
    this.commitAllPersistentWidgets(await widgetApi.fetch());

    dashboardApi.setup(onDashboardChange, onDashboardDelete);
    widgetApi.setup(onItemChange, onItemDelete);
  }
}

export const dashboardStore = getModule(DashboardModule);
