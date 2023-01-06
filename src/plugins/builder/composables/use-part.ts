import { MetricsConfig } from '@/plugins/history/types';
import { emptyMetricsConfig } from '@/plugins/history/utils';
import { deepCopy } from '@/utils/objects';
import { computed, ComputedRef, inject, WritableComputedRef } from 'vue';
import {
  BORDER_KEY,
  COLOR_KEY,
  FLOW_TOGGLE_KEY,
  PartKey,
  PlaceholderKey,
  ReflowKey,
} from '../const';
import { FlowPart } from '../types';
import { colorString, coord2grid } from '../utils';

export interface UsePartComponent {
  /**
   * The builder part itself.
   * Updating its value will cause it to be updated in the store,
   * and active flows to be recalculated.
   */
  part: WritableComputedRef<FlowPart>;

  /**
   * `part.settings`, extracted for convenience.
   * Updating its value will cause `part` to be updated.
   */
  settings: WritableComputedRef<Mapped<any>>;

  /**
   * Part metrics will be merged per layout,
   * and the data is accessible through the useMetrics composable.
   */
  metrics: ComputedRef<MetricsConfig>;

  /**
   * The calculated part width, in grid squares.
   */
  partWidth: ComputedRef<number>;

  /**
   * The calculated part height, in grid squares.
   */
  partHeight: ComputedRef<number>;

  /**
   * The calculated part width, in SVG units.
   */
  width: ComputedRef<number>;

  /**
   * The calculated part height, in SVG units.
   */
  height: ComputedRef<number>;

  /**
   * The part should be rendered horizontally mirrored.
   * The order of operation is to flip before rotate.
   */
  flipped: ComputedRef<boolean>;

  /**
   * The part is rendered for demonstration purposed.
   * Link errors should be suppressed, and dummy values shown.
   */
  placeholder: boolean;

  /**
   * Optional: the liquid color property.
   * This is used by parts that are a container or a liquid source.
   * The value is a HTML color (# + 1-6 hexadecimal characters)
   *
   * If no color is set, the value is an empty string.
   */
  color: WritableComputedRef<string>;

  /**
   * Optional: whether to render the border for this part.
   * This is used by various display parts.
   */
  bordered: WritableComputedRef<boolean>;

  /**
   * Optional: parts with no explicit tubes may declare
   * universal flow passthrough.
   * Any edge will be connected to all other edges.
   * This is used to support inline display components.
   */
  passthrough: WritableComputedRef<boolean>;

  /**
   * Update one or more setting values.
   * All other settings will be unchanged.
   * To remove a setting, change its value to `undefined`.
   *
   * @param patch The changed subset of the part settings.
   */
  patchSettings: (patch: Mapped<any>) => void;

  /**
   * Causes the active layout to recalculate flows.
   * Flows are always recalculated if settings are changed,
   * but external changes (such as block values) may also
   * justify flows to be re-rendered.
   */
  reflow: () => void;
}

export interface UsePartComposable {
  setup(): UsePartComponent;
}

export const usePart: UsePartComposable = {
  setup(): UsePartComponent {
    const part = inject(PartKey)!;
    const reflow = inject(ReflowKey)!;
    const placeholder = inject(PlaceholderKey, false);

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

    const color = computed<string>({
      get: () => settings.value[COLOR_KEY] ?? '',
      set: (v) => patchSettings({ [COLOR_KEY]: colorString(v) }),
    });

    const bordered = computed<boolean>({
      get: () => Boolean(settings.value[BORDER_KEY] ?? true),
      set: (v) => patchSettings({ [BORDER_KEY]: Boolean(v) }),
    });

    const passthrough = computed<boolean>({
      get: () => Boolean(settings.value[FLOW_TOGGLE_KEY]),
      set: (v) => patchSettings({ [FLOW_TOGGLE_KEY]: Boolean(v) }),
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
      color,
      bordered,
      passthrough,
      placeholder,
      patchSettings,
      reflow,
    };
  },
};
