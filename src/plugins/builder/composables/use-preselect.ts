import { computed, ComputedRef, Ref, ref } from 'vue';
import { useGlobals } from '@/composables';
import { userUISettings } from '@/user-settings';

export interface UsePreselectComponent {
  preselectedId: Ref<string | null>;
  preselectable: ComputedRef<boolean>;
  preselect: (id: string | null) => void;
}

export interface UsePreselectComposable {
  setup(): UsePreselectComponent;
}

export const usePreselect: UsePreselectComposable = {
  setup(): UsePreselectComponent {
    const { dense } = useGlobals.setup();

    const preselectedId = ref<string | null>(null);

    const preselectable = computed<boolean>(() => {
      const { builderTouchDelayed } = userUISettings.value;
      return (
        builderTouchDelayed === 'always' ||
        (builderTouchDelayed === 'dense' && dense.value)
      );
    });

    function preselect(id: string | null): void {
      if (id != null && preselectedId.value != null) {
        return;
      }
      preselectedId.value = id;
    }

    return {
      preselectedId,
      preselectable,
      preselect,
    };
  },
};
