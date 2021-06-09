import { Action, Module, VuexModule } from 'vuex-class-modules';

import store from '@/store';
import { extendById, filterById, findById } from '@/utils/collections';

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

  public widgetById<T extends Widget>(id: Maybe<string>): T | null {
    return (findById(this.widgets, id) ?? findById(this.volatileWidgets, id)) as T | null;
  }

  public setVolatileWidget(widget: Widget): void {
    if (this.widgetIds.includes(widget.id)) {
      throw new Error(`Widget ${widget.title} (${widget.id}) already exists as persistent widget`);
    }
    widget.volatile = true;
    this.volatileWidgets = extendById(this.volatileWidgets, widget);
  }

  public removeVolatileWidget(widget: HasId): void {
    this.volatileWidgets = filterById(this.volatileWidgets, widget);
  }

  @Action
  public async createWidget(widget: Widget): Promise<void> {
    if (widget.volatile) {
      throw new Error(`Widget ${widget.title} is volatile`);
    }
    await api.create(widget); // triggers callback
  }

  @Action
  public async appendWidget(widget: Widget): Promise<void> {
    if (widget.volatile) {
      throw new Error(`Widget ${widget.title} is volatile`);
    }
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
