import { MetricsConfig } from '@/plugins/history/types';
import { emptyMetricsConfig } from '@/plugins/history/utils';
import {
  computed,
  ComputedRef,
  inject,
  shallowRef,
  WritableComputedRef,
} from 'vue';
import { BORDER_KEY, COLOR_KEY, PASSTHROUGH_KEY } from '../const';
import {
  FlowsKey,
  InteractableKey,
  PartKey,
  PatchPartKey,
  PatchSettingsKey,
  PlaceholderKey,
  ReflowKey,
} from '../symbols';
import { BuilderPart, PartFlows } from '../types';
import { colorString, coord2grid } from '../utils';

export interface UsePartComponent {
  /**
   * The builder part itself.
   */
  part: ComputedRef<BuilderPart>;

  /**
   * `part.settings`, extracted for convenience.
   */
  settings: ComputedRef<Mapped<any>>;

  /**
   * Part metrics will be merged per layout,
   * and the data is accessible through the useMetrics composable.
   */
  metrics: ComputedRef<MetricsConfig>;

  /**
   * Part flows if defined and calculated.
   * The object will be empty otherwise.
   */
  flows: ComputedRef<PartFlows>;

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
   * Part can allow custom click and hover handlers.
   * This is also handled by the BuilderInteraction component.
   */
  interactable: ComputedRef<boolean>;

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
   * Update one or more part values.
   * All other properties will be unchanged.
   * To remove a value, change its value to `undefined`.
   * To update part settings, `patchSettings` is recommended.
   *
   * @param patch The changed subset of the part.
   */
  patchPart: (patch: Partial<BuilderPart>) => void;

  /**
   * Update one or more setting values.
   * All other settings will be unchanged.
   * To remove a setting, change its value to `undefined`.
   *
   * @param patch The changed subset of the part settings.
   */
  patchSettings: (patch: Partial<BuilderPart['settings']>) => void;

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
    const patchPart = inject(PatchPartKey, () => {});
    const patchSettings = inject(PatchSettingsKey, () => {});
    const reflow = inject(ReflowKey)!;
    const allFlows = inject(FlowsKey, shallowRef({}));
    const placeholder = inject(PlaceholderKey, false);
    const interactable = inject(
      InteractableKey,
      computed(() => false),
    );

    const settings = computed<Mapped<any>>(() => part.value.settings);

    const metrics = computed<MetricsConfig>(
      () => part.value.metrics ?? emptyMetricsConfig(),
    );

    const flows = computed<PartFlows>(
      () => allFlows.value[part.value.id] ?? {},
    );

    const width = computed<number>(() => coord2grid(part.value.width));

    const height = computed<number>(() => coord2grid(part.value.height));

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
      get: () => Boolean(settings.value[PASSTHROUGH_KEY]),
      set: (v) => patchSettings({ [PASSTHROUGH_KEY]: Boolean(v) }),
    });

    return {
      part,
      settings,
      metrics,
      flows,
      width,
      height,
      flipped,
      color,
      bordered,
      passthrough,
      placeholder,
      interactable,
      patchPart,
      patchSettings,
      reflow,
    };
  },
};
