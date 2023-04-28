import { useFeatureStore } from '@/store/features';
import { Widget } from '@/store/widgets';
import {
  ChangeWidgetTitleKey,
  InvalidateKey,
  PatchWidgetKey,
  VolatileKey,
  WidgetKey,
} from '@/symbols';
import { computed, ComputedRef, inject } from 'vue';

export interface UseWidgetComponent<WidgetT extends Widget> {
  widgetId: string;
  widget: ComputedRef<WidgetT>;
  config: ComputedRef<WidgetT['config']>;
  isVolatileWidget: boolean;
  featureTitle: ComputedRef<string>;
  widgetComponent: ComputedRef<string>;

  patchWidget(patch: Partial<WidgetT>): Promise<void>;
  saveConfig(config: WidgetT['config']): Promise<void>;
  patchConfig(patch: Partial<WidgetT['config']>): Promise<void>;
  invalidate(reason?: string): void;
  changeWidgetTitle(): void;
}

export interface UseWidgetComposable {
  setup<WidgetT extends Widget>(): UseWidgetComponent<WidgetT>;
}

export const useWidget: UseWidgetComposable = {
  setup<WidgetT extends Widget>(): UseWidgetComponent<WidgetT> {
    const featureStore = useFeatureStore();
    const widget = inject<ComputedRef<WidgetT>>(WidgetKey)!;
    const patchWidget = inject(PatchWidgetKey)!;
    const invalidate = inject(InvalidateKey)!;
    const isVolatileWidget = inject(VolatileKey)!;
    const changeWidgetTitle = inject(ChangeWidgetTitleKey)!;

    if (!widget) {
      throw new Error('No widget injected');
    }

    const widgetId = widget.value.id;

    const config = computed<WidgetT['config']>(() => widget.value.config);

    const featureTitle = computed<string>(
      () =>
        featureStore.widgetTitle(widget.value.feature) ?? widget.value.feature,
    );

    const widgetComponent = computed<string>(
      () => featureStore.widgetComponent(widget.value)!,
    );

    async function saveConfig(config: WidgetT['config']): Promise<void> {
      await patchWidget({ config });
    }

    async function patchConfig(
      patch: Partial<WidgetT['config']>,
    ): Promise<void> {
      await saveConfig({ ...widget.value.config, ...patch });
    }

    return {
      widgetId,
      widget,
      config,
      isVolatileWidget,
      featureTitle,
      widgetComponent,
      saveConfig,
      patchWidget,
      patchConfig,
      invalidate,
      changeWidgetTitle,
    };
  },
};
