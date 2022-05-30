import { ComputedRef, Ref, UnwrapRef, computed, inject, ref, watch } from 'vue';

import { useFeatureStore } from '@/store/features';
import { Widget, useWidgetStore } from '@/store/widgets';
import { InvalidateKey, WidgetIdKey } from '@/symbols';

export interface UseWidgetComponent<WidgetT extends Widget> {
  widgetId: string;
  widget: Ref<UnwrapRef<WidgetT>>;
  config: ComputedRef<WidgetT['config']>;
  isVolatileWidget: ComputedRef<boolean>;
  featureTitle: ComputedRef<string>;

  saveWidget(widget?: WidgetT): Promise<void>;
  saveConfig(config?: WidgetT['config']): Promise<void>;
  invalidate(): void;
}

export interface UseWidgetComposable {
  setup<WidgetT extends Widget>(): UseWidgetComponent<WidgetT>;
}

export const useWidget: UseWidgetComposable = {
  setup<WidgetT extends Widget>(): UseWidgetComponent<WidgetT> {
    const widgetStore = useWidgetStore();
    const featureStore = useFeatureStore();
    const widgetId = inject(WidgetIdKey);
    const invalidate = inject(InvalidateKey);
    const widget = ref<WidgetT>(widgetStore.widgetById<WidgetT>(widgetId)!);

    if (!widgetId) {
      throw new Error('No widget ID injected');
    }

    if (!invalidate) {
      throw new Error('No invalidation function injected');
    }

    if (!widget.value) {
      throw new Error(`No widget found for ID ${widgetId}`);
    }

    watch(
      () => widgetStore.widgetById<WidgetT>(widgetId),
      (newV) => {
        if (newV) {
          widget.value = newV;
        } else {
          invalidate();
        }
      },
    );

    const config = computed<WidgetT['config']>(() => widget.value.config);

    const isVolatileWidget = computed<boolean>(() =>
      Boolean(widget.value.volatile),
    );

    const featureTitle = computed<string>(
      () =>
        featureStore.widgetTitle(widget.value.feature) ?? widget.value.feature,
    );

    async function saveWidget(w: WidgetT = widget.value): Promise<void> {
      await widgetStore.saveWidget(w);
    }

    async function saveConfig(
      c: WidgetT['config'] = config.value,
    ): Promise<void> {
      await widgetStore.saveWidget({ ...widget.value, config: c });
    }

    return {
      widgetId,
      widget,
      config,
      isVolatileWidget,
      featureTitle,
      saveWidget,
      saveConfig,
      invalidate,
    };
  },
};
