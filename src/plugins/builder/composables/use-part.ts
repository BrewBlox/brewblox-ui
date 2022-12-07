import { MetricsConfig } from '@/plugins/history/types';
import { emptyMetricsConfig } from '@/plugins/history/utils';
import { deepCopy } from '@/utils/objects';
import { computed, ComputedRef, inject, WritableComputedRef } from 'vue';
import { BORDER_KEY, PartKey, ReflowKey } from '../const';
import { FlowPart } from '../types';
import { coord2grid } from '../utils';

export interface UsePartComponent {
  part: WritableComputedRef<FlowPart>;
  settings: WritableComputedRef<Mapped<any>>;
  metrics: ComputedRef<MetricsConfig>;
  sizeX: ComputedRef<number>;
  sizeY: ComputedRef<number>;
  width: ComputedRef<number>;
  height: ComputedRef<number>;
  flipped: ComputedRef<boolean>;
  bordered: ComputedRef<boolean>;
  patchSettings: (patch: Mapped<any>) => void;
  reflow: () => void;
}

export interface UsePartComposable {
  setup(): UsePartComponent;
}

export const usePart: UsePartComposable = {
  setup(): UsePartComponent {
    const part = inject(PartKey)!;
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

    const sizeX = computed<number>(() => part.value.size[0]);

    const sizeY = computed<number>(() => part.value.size[1]);

    const width = computed<number>(() => coord2grid(sizeX.value));

    const height = computed<number>(() => coord2grid(sizeY.value));

    const flipped = computed<boolean>(() => part.value.flipped === true);

    const bordered = computed<boolean>(
      () => part.value.settings[BORDER_KEY] ?? true,
    );

    function patchSettings(patch: any): void {
      settings.value = { ...part.value.settings, ...patch };
    }

    return {
      part,
      settings,
      metrics,
      sizeX,
      sizeY,
      width,
      height,
      flipped,
      bordered,
      patchSettings,
      reflow,
    };
  },
};
