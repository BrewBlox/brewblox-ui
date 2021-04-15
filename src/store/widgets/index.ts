import { Action, Module, VuexModule } from 'vuex-class-modules';

import store from '@/store';
import { extendById, filterById, findById } from '@/utils/functional';

import api from './api';
import type { Widget } from './types';

export * from './types';

@Module({ generateMutationSetters: true })
export class WidgetModule extends VuexModule {
  public widgets: Widget[] = [];
  public volatileWidgets: Widget[] = [];

  public get widgetIds(): string[] {
    return this.widgets.map(v => v.id);
  }

  public widgetById(id: string, includeVolatile = false): Widget | null {
    return includeVolatile
      ? (findById(this.widgets, id) ?? findById(this.volatileWidgets, id))
      : findById(this.widgets, id);
  }

  @Action
  public async createWidget(widget: Widget): Promise<void> {
    if (widget.volatile) {
      widget.volatile = undefined;
      this.volatileWidgets = filterById(this.volatileWidgets, widget);
    }
    await api.create(widget); // triggers callback
  }

  @Action
  public async createVolatileWidget(widget: Widget): Promise<void> {
    widget.volatile = true;
    this.volatileWidgets = extendById(this.volatileWidgets, widget);
  }

  @Action
  public async appendWidget(widget: Widget): Promise<void> {
    const order = this.widgets
      .filter(v => v.dashboard === widget.dashboard)
      .length + 1;
    await this.createWidget({ ...widget, order });
  }

  @Action
  public async saveWidget(widget: Widget): Promise<void> {
    if (widget.volatile) {
      this.volatileWidgets = extendById(this.volatileWidgets, widget);
    }
    else {
      await api.persist(widget); // triggers callback
    }
  }

  @Action
  public async removeWidget(widget: Widget): Promise<void> {
    if (widget.volatile) {
      this.volatileWidgets = filterById(this.volatileWidgets, widget);
    }
    else {
      await api.remove(widget); // triggers callback
    }
  }

  @Action
  public async start(): Promise<void> {
    this.widgets = await api.fetch();
    api.subscribe(
      widget => this.widgets = extendById(this.widgets, widget),
      id => this.widgets = filterById(this.widgets, { id }),
    );
  }
}

export const widgetStore = new WidgetModule({ store, name: 'widgets' });
