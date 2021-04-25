import { computed, ComputedRef } from 'vue';

import { BORDER_KEY, SCALE_KEY } from '../const';
import { FlowPart } from '../types';

export interface UsePartComponent {
  sizeX: ComputedRef<number>;
  sizeY: ComputedRef<number>;
  flipped: ComputedRef<boolean>;
  bordered: ComputedRef<boolean>;
  scale: ComputedRef<number>;
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

    const flipped = computed<boolean>(
      () => part.flipped === true,
    );

    const bordered = computed<boolean>(
      () => part.settings[BORDER_KEY] ?? true,
    );

    const scale = computed<number>(
      () => part.settings[SCALE_KEY] ?? 1,
    );

    return {
      sizeX,
      sizeY,
      flipped,
      bordered,
      scale,
    };
  },
};
