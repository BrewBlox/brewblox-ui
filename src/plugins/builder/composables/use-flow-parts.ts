import debounce from 'lodash/debounce';
import { nanoid } from 'nanoid';
import { computed, ComputedRef, Ref, ref, watch, WritableComputedRef } from 'vue';

import { Coordinates } from '@/utils/coordinates';
import { deepCopy } from '@/utils/functional';

import { calculateNormalizedFlows } from '../calculateFlows';
import { builderStore } from '../store';
import { BuilderLayout, FlowPart, PersistentPart } from '../types';
import { asPersistentPart, asStatePart, vivifyParts } from '../utils';

export interface UseFlowPartsComponent {
  layout: Ref<BuilderLayout | null>;
  saveLayout(): Awaitable<unknown>;

  parts: WritableComputedRef<PersistentPart[]>;
  overlaps: ComputedRef<[Coordinates, number][]>;

  flowParts: Ref<FlowPart[]>;
  flowPartsRevision: Ref<string>;

  calculateFlowParts(): Awaitable<unknown>;
}

export interface UseFlowPartsComposable {
  setup(layoutId: Ref<string | null>): UseFlowPartsComponent;
}

export const useFlowParts: UseFlowPartsComposable = {
  setup(layoutId: Ref<string | null>): UseFlowPartsComponent {

    const layout = ref<BuilderLayout | null>(builderStore.layoutById(layoutId.value));

    const saveLayout = debounce(
      () => {
        if (layout.value) {
          builderStore.saveLayout(layout.value);
        }
      },
      500,
      { trailing: true },
    );

    const parts = computed<PersistentPart[]>({
      get: () => vivifyParts(layout.value?.parts),
      set: values => {
        if (layout.value) {
          layout.value.parts = values.map(asPersistentPart);
          saveLayout();
        }
      },
    });

    const _flowParts = ref<FlowPart[]>([]);
    const flowPartsRevision = ref<string>('');

    const flowParts = computed<FlowPart[]>({
      get: () => _flowParts.value,
      set: values => {
        _flowParts.value = values;
        flowPartsRevision.value = nanoid(6);
      },
    });

    const calculateFlowParts = debounce(
      () => {
        const source = deepCopy(parts.value);
        flowParts.value = calculateNormalizedFlows(source.map(asStatePart));
      },
      500,
      { leading: true },
    );

    const overlaps = computed<[Coordinates, number][]>(
      () => {
        const counts: Mapped<number> = {};
        for (const part of parts.value) {
          const key = new Coordinates([part.x, part.y, 0]).toString();
          counts[key] = (counts[key] || 0) + 1;
        }
        return Object.entries(counts)
          .filter(([, v]) => v > 1)
          .map(([k, v]) => [new Coordinates(k), v] as [Coordinates, number]);
      },
    );

    watch(
      () => builderStore.layoutById(layoutId.value),
      newV => layout.value = newV,
    );

    watch(
      () => parts.value,
      () => calculateFlowParts(),
      { immediate: true },
    );

    return {
      layout,
      saveLayout,
      parts,
      overlaps,
      flowParts,
      flowPartsRevision,
      calculateFlowParts,
    };
  },
};
