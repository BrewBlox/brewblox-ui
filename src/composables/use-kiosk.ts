import { notify } from '@/utils/notify';
import { computed, WritableComputedRef } from 'vue';
import { useRouter } from 'vue-router';

export interface UseKioskComponent {
  kiosk: WritableComputedRef<boolean>;
}

export interface UseKioskComposable {
  setup(): UseKioskComponent;
}

export const useKiosk: UseKioskComposable = {
  setup(): UseKioskComponent {
    const router = useRouter();

    const kiosk = computed<boolean>({
      get: () => router.currentRoute.value.query.kiosk !== undefined,
      set: (v) => {
        router.push({
          query: {
            ...router.currentRoute.value.query,
            kiosk: v ? null : undefined,
          },
        });
        if (v) {
          notify.info({
            message: 'Click the Brewblox logo to exit kiosk mode.',
            position: 'top',
          });
        }
      },
    });

    return {
      kiosk,
    };
  },
};
