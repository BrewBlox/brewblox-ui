import { MetricsConfig } from '@/plugins/history/types';
import { emptyMetricsConfig } from '@/plugins/history/utils';
import { deepCopy } from '@/utils/objects';
import { computed, ComputedRef, inject, WritableComputedRef } from 'vue';
import {
  BORDER_KEY,
  DEPRECATED_IO_PRESSURE_KEY,
  InteractKey,
  IO_ENABLED_KEY,
  PartKey,
  ReflowKey,
} from '../const';
import { FlowPart } from '../types';
import { coord2grid } from '../utils';

export interface UsePartComponent {
  part: WritableComputedRef<FlowPart>;
  settings: WritableComputedRef<Mapped<any>>;
  metrics: ComputedRef<MetricsConfig>;
  partWidth: ComputedRef<number>;
  partHeight: ComputedRef<number>;
  width: ComputedRef<number>;
  height: ComputedRef<number>;
  flipped: ComputedRef<boolean>;
  bordered: WritableComputedRef<boolean>;
  pressured: WritableComputedRef<boolean>;
  patchSettings: (patch: Mapped<any>) => void;
  interact: (func: () => unknown) => void;
  reflow: () => void;
}

export interface UsePartComposable {
  setup(): UsePartComponent;
}

export const usePart: UsePartComposable = {
  setup(): UsePartComponent {
    const part = inject(PartKey)!;
    const interact = inject(InteractKey, () => {});
    const reflow = inject(ReflowKey)!;

    const settings = computed<Mapped<any>>({
      get: () => part.value.settings,
      set: (data) => {
        part.value = { ...part.value, settings: deepCopy(data) };
      },
    });

    const metrics = computed<MetricsConfig>(
      () => part.value.metrics ?? emptyMetricsConfig(),
    );

    const partWidth = computed<number>(() => part.value.size[0]);

    const partHeight = computed<number>(() => part.value.size[1]);

    const width = computed<number>(() => coord2grid(partWidth.value));

    const height = computed<number>(() => coord2grid(partHeight.value));

    const flipped = computed<boolean>(() => part.value.flipped === true);

    const bordered = computed<boolean>({
      get: () => Boolean(part.value.settings[BORDER_KEY] ?? true),
      set: (v) => patchSettings({ [BORDER_KEY]: Boolean(v) }),
    });

    const pressured = computed<boolean>({
      get: () =>
        Boolean(
          settings.value[IO_ENABLED_KEY] ??
            settings.value[DEPRECATED_IO_PRESSURE_KEY],
        ),
      set: (enabled) =>
        patchSettings({
          [IO_ENABLED_KEY]: enabled,
          [DEPRECATED_IO_PRESSURE_KEY]: undefined,
        }),
    });

    function patchSettings(patch: Mapped<any>): void {
      settings.value = { ...part.value.settings, ...patch };
    }

    return {
      part,
      settings,
      metrics,
      partWidth,
      partHeight,
      width,
      height,
      flipped,
      bordered,
      pressured,
      patchSettings,
      reflow,
      interact,
    };
  },
};
