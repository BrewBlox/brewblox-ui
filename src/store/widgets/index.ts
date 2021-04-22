import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

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

  public widgetById<T extends Widget>(id: string): T | null {
    return (findById(this.widgets, id) ?? findById(this.volatileWidgets, id)) as T | null;
  }

  @Action
  public async createWidget(widget: Widget): Promise<void> {
    if (widget.volatile) {
      this.volatileWidgets = filterById(this.volatileWidgets, widget);
    }
    await api.create({ ...widget, volatile: undefined }); // triggers callback
  }

  @Mutation
  public setVolatileWidget(widget: Widget): void {
    widget.volatile = true;
    this.volatileWidgets = extendById(this.volatileWidgets, widget);
  }

  @Action
  public async createVolatileWidget(widget: Widget): Promise<void> {
    if (this.widgetIds.includes(widget.id)) {
      throw new Error(`Widget ${widget.title} (${widget.id}) already exists as persistent widget`);
    }
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
  public async removeVolatileWidget(widget: Widget): Promise<void> {
    this.volatileWidgets = filterById(this.volatileWidgets, widget);
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
