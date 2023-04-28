import { concatById, filterById, findById } from '@/utils/collections';
import { defineStore } from 'pinia';
import { useFeatureStore } from '../features';
import api from './api';
import type { Widget } from './types';

export * from './types';

interface WidgetStoreState {
  widgets: Widget[];
}

export const useWidgetStore = defineStore('widgetStore', {
  state: (): WidgetStoreState => ({
    widgets: [],
  }),
  getters: {
    widgetIds: (state): string[] => state.widgets.map((v) => v.id),
  },
  actions: {
    widgetById<T extends Widget>(id: Maybe<string>): T | null {
      return findById(this.widgets, id) as T | null;
    },

    async createWidget(widget: Widget): Promise<void> {
      await api.create(widget); // triggers callback
    },

    async appendWidget(widget: Widget): Promise<void> {
      const order =
        this.widgets.filter((v) => v.dashboard === widget.dashboard).length + 1;
      await this.createWidget({ ...widget, order });
    },

    async saveWidget(widget: Widget): Promise<void> {
      await api.persist(widget); // triggers callback
    },

    async removeWidget(widget: Widget): Promise<void> {
      await api.remove(widget); // triggers callback
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
