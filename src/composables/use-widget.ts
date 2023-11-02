import { useFeatureStore } from '@/store/features';
import { Widget } from '@/store/widgets';
import {
  ChangeWidgetTitleKey,
  InvalidateKey,
  PatchWidgetKey,
  VolatileKey,
  WidgetKey,
} from '@/symbols';
import { produce } from 'immer';
import { computed, ComputedRef, inject, toRaw } from 'vue';

export interface UseWidgetComponent<WidgetT extends Widget> {
  widgetId: string;
  widget: ComputedRef<WidgetT>;
  config: ComputedRef<WidgetT['config']>;
  isVolatileWidget: boolean;
  featureTitle: ComputedRef<string>;
  widgetComponent: ComputedRef<string>;

  patchWidget(patch: Partial<WidgetT>): Awaitable<void>;
  saveConfig(config: WidgetT['config']): Awaitable<void>;
  patchConfig(patch: Partial<WidgetT['config']>): Awaitable<void>;
  updateConfig(
    cb: (draft: WidgetT['config']) => void | WidgetT['config'],
  ): Promise<void>;
  invalidate(reason?: string): void;
  changeWidgetTitle(): void;
}

export interface UseWidgetComposable {
  setup<WidgetT extends Widget>(): UseWidgetComponent<WidgetT>;
}

export const useWidget: UseWidgetComposable = {
  setup<WidgetT extends Widget>(): UseWidgetComponent<WidgetT> {
    type ConfigT = WidgetT['config'];

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

    const config = computed<ConfigT>(() => widget.value.config);

    const featureTitle = computed<string>(
      () =>
        featureStore.widgetTitle(widget.value.feature) ?? widget.value.feature,
    );

    const widgetComponent = computed<string>(
      () => featureStore.widgetComponent(widget.value)!,
    );

    async function saveConfig(config: ConfigT): Promise<void> {
      await patchWidget({ config });
    }

    async function patchConfig(patch: Partial<ConfigT>): Promise<void> {
      await saveConfig({ ...widget.value.config, ...patch });
    }

    async function updateConfig(
      cb: (draft: ConfigT) => void | ConfigT,
    ): Promise<void> {
      const updated = produce<ConfigT>(toRaw(config.value), cb);
      await patchConfig(updated);
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
      updateConfig,
      invalidate,
      changeWidgetTitle,
    };
  },
};
