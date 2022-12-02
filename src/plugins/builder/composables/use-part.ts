import { computed, ComputedRef, getCurrentInstance } from 'vue';
import { BORDER_KEY, SCALE_KEY } from '../const';
import { FlowPart } from '../types';

export type UsePartEmits = ['update:part', 'dirty'];

export interface UsePartComponent {
  sizeX: ComputedRef<number>;
  sizeY: ComputedRef<number>;
  flipped: ComputedRef<boolean>;
  bordered: ComputedRef<boolean>;
  scale: ComputedRef<number>;
  savePart: (part: FlowPart) => void;
  patchSettings: (patch: any) => void;
}

export interface UsePartComposable {
  emits: UsePartEmits;
  setup(part: FlowPart): UsePartComponent;
}

export const usePart: UsePartComposable = {
  emits: ['update:part', 'dirty'],
  setup(part: FlowPart): UsePartComponent {
    const instance = getCurrentInstance()!;

    const sizeX = computed<number>(() => part.size[0]);

    const sizeY = computed<number>(() => part.size[1]);

    const flipped = computed<boolean>(() => part.flipped === true);

    const bordered = computed<boolean>(() => part.settings[BORDER_KEY] ?? true);

    const scale = computed<number>(() => part.settings[SCALE_KEY] ?? 1);

    function savePart(updated: FlowPart): void {
      instance.emit('update:part', updated);
    }

    function patchSettings(patch: any): void {
      savePart({ ...part, settings: { ...part.settings, ...patch } });
    }

    return {
      sizeX,
      sizeY,
      flipped,
      bordered,
      scale,
      savePart,
      patchSettings,
    };
  },
};
