import { defineStore } from 'pinia';

import { concatById, filterById, findById } from '@/utils/collections';

import { useFeatureStore } from '../features';
import api from './api';
import type { Widget } from './types';

export * from './types';

interface WidgetStoreState {
  widgets: Widget[];
  volatileWidgets: Widget[];
}

export const useWidgetStore = defineStore('widgetStore', {
  state: (): WidgetStoreState => ({
    widgets: [],
    volatileWidgets: [],
  }),
  getters: {
    widgetIds: (state): string[] => state.widgets.map((v) => v.id),
  },
  actions: {
    widgetById<T extends Widget>(id: Maybe<string>): T | null {
      return (findById(this.widgets, id) ??
        findById(this.volatileWidgets, id)) as T | null;
    },

    setVolatileWidget(widget: Widget): void {
      if (this.widgetIds.includes(widget.id)) {
        throw new Error(
          `Widget ${widget.title} (${widget.id}) already exists as persistent widget`,
        );
      }
      widget.volatile = true;
      this.volatileWidgets = concatById(this.volatileWidgets, widget);
    },

    removeVolatileWidget(widget: HasId): void {
      this.volatileWidgets = filterById(this.volatileWidgets, widget);
    },

    async createWidget(widget: Widget): Promise<void> {
      if (widget.volatile) {
        throw new Error(`Widget ${widget.title} is volatile`);
      }
      await api.create(widget); // triggers callback
    },

    async appendWidget(widget: Widget): Promise<void> {
      if (widget.volatile) {
        throw new Error(`Widget ${widget.title} is volatile`);
      }
      const order =
        this.widgets.filter((v) => v.dashboard === widget.dashboard).length + 1;
      await this.createWidget({ ...widget, order });
    },

    async saveWidget(widget: Widget): Promise<void> {
      if (widget.volatile) {
        this.volatileWidgets = concatById(this.volatileWidgets, widget);
      } else {
        await api.persist(widget); // triggers callback
      }
    },

    async removeWidget(widget: Widget): Promise<void> {
      if (widget.volatile) {
        this.volatileWidgets = filterById(this.volatileWidgets, widget);
      } else {
        await api.remove(widget); // triggers callback
      }
    },

    async start(): Promise<void> {
      this.widgets = await api.fetch();

      const featureStore = useFeatureStore();
      [...this.widgets].forEach((widget) => {
        const upgraded = featureStore.upgradeWidget(widget);
        if (upgraded) {
          // Immediately set upgraded widget, to prevent rendering with invalid data
          concatById(this.widgets, widget);
          this.saveWidget(upgraded);
        }
      });

      api.subscribe(
        (widget) => (this.widgets = concatById(this.widgets, widget)),
        (id) => (this.widgets = filterById(this.widgets, { id })),
      );
    },
  },
});
