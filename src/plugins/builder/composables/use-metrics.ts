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

import { addSource } from '@/plugins/history/sources/metrics';
import { useHistoryStore } from '@/plugins/history/store';
import { MetricsSource } from '@/plugins/history/types';

import { useBuilderStore } from '../store';
import { BuilderLayout } from '../types';

const sourceIdKey: InjectionKey<string> = Symbol('$builderMetricSourceId');

export interface UseMetricsComponent {
  source: ComputedRef<MetricsSource | null>;
}

export interface UseMetricsComposable {
  setup(layoutId: Ref<string | null> | null): UseMetricsComponent;
}

export const useMetrics: UseMetricsComposable = {
  setup(layoutId: Ref<string | null> | null): UseMetricsComponent {
    const historyStore = useHistoryStore();

    if (layoutId) {
      // Provider side
      const builderStore = useBuilderStore();
      const sourceId = nanoid(6);
      let activeFields: Set<string> = new Set();

      const source = computed<MetricsSource | null>(() =>
        historyStore.sourceById<MetricsSource>(sourceId),
      );

      const initMetrics = debounce(
        (layout: BuilderLayout | null) => {
          if (!layout) {
            historyStore.removeSource(source.value);
            return;
          }

          const fields = new Set(
            layout.parts.flatMap((part) => part.metrics?.fields ?? []),
          );

          if (isEqual(activeFields, fields)) {
            // nothing to do
            return;
          }

          historyStore.removeSource(source.value);
          addSource(sourceId, {}, {}, [...fields]);
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

      onBeforeUnmount(() => historyStore.removeSource(source.value));
      provide(sourceIdKey, sourceId);

      return {
        source,
      };
    } else {
      // Consumer
      const sourceId = inject(sourceIdKey, null);

      const source = computed<MetricsSource | null>(() =>
        historyStore.sourceById<MetricsSource>(sourceId),
      );

      return {
        source,
      };
    }
  },
};
