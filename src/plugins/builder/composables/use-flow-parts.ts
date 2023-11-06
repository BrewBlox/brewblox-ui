import { calculateNormalizedFlows } from '../calculateFlows';
import { FlowsKey } from '../symbols';
import {
  BuilderLayout,
  BuilderPart,
  PartFlows,
  PartTransitions,
} from '../types';
import { useBuilderStore } from '@/plugins/builder/store';
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

    function assignLocalParts(updated: Mapped<BuilderPart>): void {
      if (!isEqual(updated, parts.value)) {
        parts.value = updated;
        reflow();
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

    function makeTransitions(
      evaluated: BuilderPart[],
    ): Mapped<PartTransitions> {
      return evaluated.reduce((acc, part) => {
        const transitions = builderStore
          .blueprintByType(part.type)
          ?.transitions(part);
        if (transitions) {
          acc[part.id] = transitions;
        }
        return acc;
      }, {});
    }

    const reflow = debounce(
      () => {
        const evaluated = Object.values(parts.value);
        const transitions = makeTransitions(evaluated);

        flows.value = calculateNormalizedFlows(evaluated, transitions);
      },
      100,
      { leading: true },
    );

    watch(
      () => layout.value?.parts,
      (newParts: BuilderPart[] | undefined) => {
        assignLocalParts(keyBy(newParts ?? [], 'id'));
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
