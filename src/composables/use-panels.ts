import { computed, WritableComputedRef } from 'vue';
import { useRouter } from 'vue-router';

export interface UsePanelsComponent {
  panels: WritableComputedRef<boolean>;
}

export interface UsePanelsComposable {
  setup(): UsePanelsComponent;
}

export const usePanels: UsePanelsComposable = {
  setup(): UsePanelsComponent {
    const router = useRouter();

    const panels = computed<boolean>({
      get: () => router.currentRoute.value.query.nopanel === undefined,
      set: (v) =>
        router.push({
          query: {
            ...router.currentRoute.value.query,
            nopanel: v ? undefined : null,
          },
        }),
    });

    return {
      panels,
    };
  },
};
