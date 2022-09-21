import { DenseKey, NowKey, TouchKey } from '@/symbols';
import { inject, Ref } from 'vue';

export interface UseGlobalsComponent {
  dense: Ref<boolean>;
  touch: Ref<boolean>;
  now: Ref<Date>;
}

export interface UseGlobalsComposable {
  setup(): UseGlobalsComponent;
}

export const useGlobals: UseGlobalsComposable = {
  setup(): UseGlobalsComponent {
    const dense = inject(DenseKey)!;
    const touch = inject(TouchKey)!;
    const now = inject(NowKey)!;

    return {
      dense,
      touch,
      now,
    };
  },
};
