import { computed, ComputedRef } from 'vue';
import { useRoute } from 'vue-router';

export interface UseRouteIdComponent {
  activeDashboardId: ComputedRef<string | null>;
  activeServiceId: ComputedRef<string | null>;
  activeLayoutId: ComputedRef<string | null>;
}

export interface UseRouteIdComposable {
  setup(): UseRouteIdComponent;
}

export const useRouteId: UseRouteIdComposable = {
  setup(): UseRouteIdComponent {
    const route = useRoute();

    const sections = computed<string[]>(() =>
      route.path.split('/').filter((v) => !!v),
    );

    const activeDashboardId = computed<string | null>(() => {
      const [base, id] = sections.value;
      if (base === 'dashboard' && id != null) {
        return id;
      }
      return null;
    });

    const activeServiceId = computed<string | null>(() => {
      const [base, id] = sections.value;
      if (base === 'service' && id != null) {
        return id;
      }
      return null;
    });

    const activeLayoutId = computed<string | null>(() => {
      const [base, id] = sections.value;
      if (base === 'builder' || (base === 'brewery' && id != null)) {
        return id;
      }
      return null;
    });

    return {
      activeDashboardId,
      activeServiceId,
      activeLayoutId,
    };
  },
};
