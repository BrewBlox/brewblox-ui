import { Action, Module, VuexModule } from 'vuex-class-modules';

import store from '@/store';
import { extendById, filterById, findById, patchedById } from '@/utils/functional';

import { dashboardApi, widgetApi } from './api';
import { Dashboard, Widget } from './types';

export * from './types';

@Module({ generateMutationSetters: true })
export class DashboardModule extends VuexModule {
  public dashboards: Dashboard[] = [];
  public widgets: Widget[] = [];

  public get dashboardIds(): string[] {
    return this.dashboards.map(v => v.id);
  }

  public get widgetIds(): string[] {
    return this.widgets.map(v => v.id);
  }

  public dashboardById(id: string): Dashboard | null {
    return findById(this.dashboards, id);
  }

  public dashboardTitle(id: string): string {
    return this.dashboardById(id)?.title ?? 'Unknown';
  }

  public widgetById(id: string): Widget | null {
    return findById(this.widgets, id);
  }

  public dashboardWidgets(dashboardId: string): Widget[] {
    return this.widgets.filter(widget => widget.dashboard === dashboardId);
  }

  @Action
  public async createDashboard(dashboard: Dashboard): Promise<void> {
    await dashboardApi.create(dashboard); // triggers callback
  }

  @Action
  public async saveDashboard(dashboard: Dashboard): Promise<void> {
    await dashboardApi.persist(dashboard);// triggers callback
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
    await dashboardApi.remove(dashboard); // triggers callback
  }

  @Action
  public async createWidget(widget: Widget): Promise<void> {
    await widgetApi.create(widget); // triggers callback
  }

  @Action
  public async appendWidget(widget: Widget): Promise<void> {
    const order = this.dashboardWidgets(widget.dashboard).length + 1;
    await this.createWidget({ ...widget, order });
  }

  @Action
  public async saveWidget(widget: Widget): Promise<void> {
    await widgetApi.persist(widget); // triggers callback
  }

  @Action
  public async patchWidgets(updated: Patch<Widget>[]): Promise<void> {
    const applied = updated
      .map(change => patchedById(this.widgets, change))
      .filter((v): v is Widget => v !== null);
    await Promise.all(applied.map(v => this.saveWidget(v)));
  }

  @Action
  public async updateWidgetConfig({ id, config }: Pick<Widget, 'id' | 'config'>): Promise<void> {
    const widget = this.widgetById(id);
    if (widget) {
      await this.saveWidget({ ...widget, config });
    }
  }

  @Action
  public async removeWidget(widget: Widget): Promise<void> {
    await widgetApi.remove(widget); // triggers callback
  }

  @Action
  public async start(): Promise<void> {
    const onDashboardChange = (dashboard: Dashboard): void => {
      this.dashboards = extendById(this.dashboards, dashboard);
    };
    const onDashboardDelete = (id: string): void => {
      this.dashboards = filterById(this.dashboards, { id });
    };

    const onWidgetChange = (widget: Widget): void => {
      this.widgets = extendById(this.widgets, widget);
    };
    const onWidgetDelete = (id: string): void => {
      this.widgets = filterById(this.widgets, { id });
    };

    this.dashboards = await dashboardApi.fetch();
    this.widgets = await widgetApi.fetch();

    dashboardApi.subscribe(onDashboardChange, onDashboardDelete);
    widgetApi.subscribe(onWidgetChange, onWidgetDelete);
  }
}

export const dashboardStore = new DashboardModule({ store, name: 'dashboards' });
