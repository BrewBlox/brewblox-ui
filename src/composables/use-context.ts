import { computed, ComputedRef, PropType, Ref, ref } from 'vue';

import { WidgetContext, WidgetMode } from '@/store/features';

export interface UseContextProps {
  context: {
    type: PropType<WidgetContext>;
    required: true;
  };
}

export interface UseContextComponent {
  mode: Ref<WidgetMode>;
  toggleMode(): void;
  inDialog: ComputedRef<boolean>;
}

export interface UseContextComposable {
  props: UseContextProps;
  setup(context: WidgetContext): UseContextComponent;
}

export const useContext: UseContextComposable = {
  props: {
    context: {
      type: Object as PropType<WidgetContext>,
      required: true,
    },
  },
  setup(context: WidgetContext) {
    const mode = ref<WidgetMode>(context.mode);

    function toggleMode(): void {
      mode.value = mode.value === 'Basic' ? 'Full' : 'Basic';
    }

    const inDialog = computed<boolean>(
      () => context.container === 'Dialog',
    );

    return {
      mode,
      toggleMode,
      inDialog,
    };
  },
};
