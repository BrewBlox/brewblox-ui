import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import { nanoid } from 'nanoid';
import {
  computed,
  ComputedRef,
  inject,
  InjectionKey,
  onBeforeUnmount,
  provide,
  Ref,
  watch,
} from 'vue';
import { useHistoryStore } from '@/plugins/history/store';
import { MetricsSource } from '@/plugins/history/types';
import { useBuilderStore } from '../store';
import { BuilderLayout } from '../types';

const sourceIdKey: InjectionKey<string> = Symbol('$builderMetricSourceId');

export interface UseMetricsComponent {
  source: ComputedRef<MetricsSource | null>;
}

export interface UseMetricsComposable {
  setupProvider(layoutId: Ref<string | null> | null): UseMetricsComponent;
  setupConsumer(): UseMetricsComponent;
}

export const useMetrics: UseMetricsComposable = {
  setupProvider(layoutId: Ref<string | null>): UseMetricsComponent {
    const historyStore = useHistoryStore();
    const builderStore = useBuilderStore();
    const sourceId = nanoid(6);
    let activeFields: Set<string> = new Set();

    const source = computed<MetricsSource | null>(
      () => historyStore.sourceById<MetricsSource>(sourceId)?.value ?? null,
    );

    const initMetrics = debounce(
      (layout: BuilderLayout | null) => {
        if (!layout) {
          historyStore.removeSource(sourceId);
          return;
        }

        const fields = new Set(
          layout.parts.flatMap((part) => part.metrics?.fields ?? []),
        );

        if (isEqual(activeFields, fields)) {
          // nothing to do
          return;
        }

        historyStore.removeSource(sourceId);
        historyStore.createMetricsSource(sourceId, {}, {}, [...fields]);
        activeFields = fields;
      },
      500,
      { trailing: true },
    );

    watch(
      () => builderStore.layoutById(layoutId.value),
      (newV) => initMetrics(newV),
      { immediate: true },
    );

    onBeforeUnmount(() => historyStore.removeSource(sourceId));
    provide(sourceIdKey, sourceId);

    return {
      source,
    };
  },
  setupConsumer(): UseMetricsComponent {
    const historyStore = useHistoryStore();
    const sourceId = inject(sourceIdKey, null);

    const source = computed<MetricsSource | null>(
      () => historyStore.sourceById<MetricsSource>(sourceId)?.value ?? null,
    );

    return {
      source,
    };
  },
};
