import { computed, ComputedRef, inject, Ref, ref, UnwrapRef, watch } from 'vue';

import { FlowPart } from '../types';

export interface UsePartComponent {
  sizeX: ComputedRef<number>;
  sizeY: ComputedRef<number>;
  bordered: ComputedRef<boolean>;
  flipped: ComputedRef<boolean>;
}

export interface UsePartComposable {
  setup(part: FlowPart): UsePartComponent;
}

export const usePart: UsePartComposable = {
  setup(part: FlowPart): UsePartComponent {
    const sizeX = computed<number>(
      () => part.size[0],
    );

    const sizeY = computed<number>(
      () => part.size[1],
    );

    const bordered = computed<boolean>(
      () => part.settings.bordered !== false,
    );

    const flipped = computed<boolean>(
      () => part.flipped === true,
    );

    return {
      sizeX,
      sizeY,
      bordered,
      flipped,
    };
  },
};
