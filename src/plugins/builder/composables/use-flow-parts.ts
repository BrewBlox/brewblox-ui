import { produce } from 'immer';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import keyBy from 'lodash/keyBy';
import {
  computed,
  ComputedRef,
  provide,
  Ref,
  shallowRef,
  ShallowRef,
  toRaw,
  watch,
} from 'vue';
import { useBuilderStore } from '@/plugins/builder/store';
import { notify } from '@/utils/notify';
import {
  calculateNormalizedFlows,
  translatedTransitions,
} from '../calculateFlows';
import { FlowsKey } from '../symbols';
import {
  BuilderLayout,
  BuilderPart,
  PartFlows,
  PartTransitions,
} from '../types';

export type UpdateLayoutFunc = (draft: BuilderLayout) => void | BuilderLayout;
export type UpdatePartsFunc = (
  draft: Mapped<BuilderPart>,
) => void | Mapped<BuilderPart>;

export interface UseFlowPartsComponent {
  layout: ComputedRef<BuilderLayout | null>;

  parts: ShallowRef<Mapped<BuilderPart>>;
  flows: ShallowRef<Mapped<PartFlows>>;

  orderedParts: ComputedRef<BuilderPart[]>;

  updateLayout: (cb: UpdateLayoutFunc) => void;
  updateParts: (cb: UpdatePartsFunc) => void;

  /**
   * Force a recalculation of flows.
   *
   * This is not required for changes to parts or linked blocks:
   * flows are recalculated whenever the transitions of any part change.
   */
  reflow: () => void;
}

export interface UseFlowPartsComposable {
  setup(layoutId: Ref<string | null>): UseFlowPartsComponent;
}

export const useFlowParts: UseFlowPartsComposable = {
  setup(layoutId: Ref<string | null>): UseFlowPartsComponent {
    const builderStore = useBuilderStore();

    const layout = computed<BuilderLayout | null>(() =>
      builderStore.layoutById(layoutId.value),
    );

    const parts = shallowRef<Mapped<BuilderPart>>({});
    const flows = shallowRef<Mapped<PartFlows>>({});
    provide(FlowsKey, flows);

    const orderedParts = computed<BuilderPart[]>(() =>
      Object.values(parts.value).sort(
        (a, b) => b.width * b.height - a.width * a.height,
      ),
    );

    // Blueprint transitions depend on part settings,
    // and may also depend on external state, such as linked blocks.
    // All reactive state read while evaluating is tracked here,
    // so a change to a linked block causes the transitions to be re-evaluated.
    // Coordinates are made absolute here, so that moving, rotating,
    // or flipping a part also changes the result.
    const transitions = computed<Mapped<PartTransitions>>(() =>
      Object.values(parts.value).reduce((acc, part) => {
        const partTransitions = builderStore
          .blueprintByType(part.type)
          ?.transitions(part);
        if (partTransitions) {
          acc[part.id] = translatedTransitions(part, partTransitions);
        }
        return acc;
      }, {}),
    );

    // Transitions used for the most recent calculation.
    // Re-evaluated transitions are only used if they are different.
    // Initial flows are empty, and match empty transitions.
    let calculatedTransitions: Mapped<PartTransitions> = {};
    const shownWarnings = new Set<string>();

    function calculate(): void {
      const current = transitions.value;
      calculatedTransitions = current;
      try {
        const result = calculateNormalizedFlows(
          Object.values(parts.value),
          current,
        );
        flows.value = result.flows;
        result.warnings
          .filter((msg) => !shownWarnings.has(msg))
          .forEach((msg) => {
            shownWarnings.add(msg);
            notify.warn(msg);
          });
      } catch (e) {
        flows.value = {};
        notify.error(`Failed to calculate flows: ${e}`);
      }
    }

    const reflow = debounce(calculate, 100, { leading: true });

    watch(
      transitions,
      (updated) => {
        if (!isEqual(updated, calculatedTransitions)) {
          reflow();
        }
      },
      { immediate: true },
    );

    function assignLocalParts(updated: Mapped<BuilderPart>): void {
      if (!isEqual(updated, parts.value)) {
        parts.value = updated;
      }
    }

    function updateLayout(cb: UpdateLayoutFunc): void {
      if (layout.value) {
        const updated = produce(toRaw(layout.value), cb);
        assignLocalParts(keyBy(updated.parts, 'id'));
        builderStore.saveLayout(updated);
      }
    }

    function updateParts(cb: UpdatePartsFunc): void {
      if (layout.value) {
        const updated = produce(parts.value, cb);
        assignLocalParts(updated);
        builderStore.saveLayout({
          ...layout.value,
          parts: Object.values(updated),
        });
      }
    }

    watch(
      () => layout.value?.parts,
      (newParts) => {
        // The local parts are used as immer base state.
        // Store objects are unwrapped to prevent
        // reactive proxies from being frozen by immer.
        assignLocalParts(keyBy(toRaw(newParts) ?? [], 'id'));
      },
      { immediate: true },
    );

    return {
      layout,
      parts,
      flows,
      orderedParts,
      updateLayout,
      updateParts,
      reflow,
    };
  },
};
