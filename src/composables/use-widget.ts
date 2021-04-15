import { computed, ComputedRef, PropType, Ref, ref } from 'vue';

import { WidgetContext, WidgetMode } from '@/store/features';

export interface UseWidgetProps {
  context: {
    type: PropType<WidgetContext>,
    required: true,
  }
}

export interface UseWidgetComponent {
  mode: Ref<WidgetMode>;
  toggleMode(): void;
  inDialog: ComputedRef<boolean>;
  toolbarComponent: ComputedRef<string>;
}

export interface UseWidgetComposable {
  props: UseWidgetProps;
  setup(context: WidgetContext): UseWidgetComponent;
}

export const useWidget: UseWidgetComposable = {
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

    const toolbarComponent = computed<string>(
      () => inDialog.value
        ? 'WidgetDialogToolbar'
        : 'WidgetToolbar',
    );

    return {
      mode,
      toggleMode,
      inDialog,
      toolbarComponent,
    };
  },
};

