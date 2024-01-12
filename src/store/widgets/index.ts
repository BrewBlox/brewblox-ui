import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { makeObjectSorter } from '@/utils/functional';
import { useFeatureStore } from '../features';
import api from './api';
import type { Widget } from './types';

export * from './types';

const sorter = makeObjectSorter<Widget>('id');

export const useWidgetStore = defineStore('widgetStore', () => {
  const widgetMap = reactive<Mapped<Widget>>({});

  const widgets = computed<Widget[]>(() =>
    Object.values(widgetMap).sort(sorter),
  );

  const widgetIds = computed<string[]>(() => widgets.value.map((v) => v.id));

  function widgetById<T extends Widget>(id: Maybe<string>): T | null {
    return (widgetMap[id ?? ''] as T) ?? null;
  }

  async function createWidget(widget: Widget): Promise<void> {
    await api.create(widget); // triggers callback
  }

  async function appendWidget(widget: Widget): Promise<void> {
    const order =
      widgets.value.filter((v) => v.dashboard === widget.dashboard).length + 1;
    await createWidget({ ...widget, order });
  }

  async function saveWidget(widget: Widget): Promise<void> {
    await api.persist(widget); // triggers callback
  }

  async function removeWidget(widget: Widget): Promise<void> {
    await api.remove(widget); // triggers callback
  }

  async function start(): Promise<void> {
    const featureStore = useFeatureStore();

    const storedWidgets: Widget[] = await api.fetch();

    const upgradedWidgets = storedWidgets
      .map((stored) => {
        const changed = featureStore.upgradeWidget(stored);
        const actual = changed ?? stored;
        widgetMap[actual.id] = actual;
        return changed;
      })
      .filter((v): v is Widget => v != null);

    api.persistMult(upgradedWidgets);

    api.subscribe(
      (widget) => (widgetMap[widget.id] = widget),
      (id) => delete widgetMap[id],
    );
  }

  return {
    widgets,
    widgetIds,
    widgetById,
    createWidget,
    appendWidget,
    saveWidget,
    removeWidget,
    start,
  };
});
