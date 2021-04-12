import { inject, Ref } from 'vue';

import { DenseKey, TouchKey } from '@/symbols';

export interface UseGlobalsComponent {
  dense: Ref<boolean>;
  touch: Ref<boolean>;
}

export interface UseGlobalsComposable {
  setup(): UseGlobalsComponent;
}

export const useGlobals: UseGlobalsComposable = {
  setup(): UseGlobalsComponent {
    const dense = inject(DenseKey)!;
    const touch = inject(TouchKey)!;

    return {
      dense,
      touch,
    };
  },
};
