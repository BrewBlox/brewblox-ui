import { computed, ComputedRef, PropType, Ref, ref } from 'vue';

import { Crud, WidgetContext, WidgetMode } from '@/store/features';

import { useCrud, UseCrudComponent, UseCrudProps } from './use-crud';

export interface UseWidgetProps extends UseCrudProps {
  context: {
    type: PropType<WidgetContext>,
    required: true,
  }
}

export interface UseWidgetComponent<ConfigT> extends UseCrudComponent<ConfigT> {
  mode: Ref<WidgetMode>;
  toggleMode(): void;
  inDialog: ComputedRef<boolean>;
  toolbarComponent: ComputedRef<string>;
}

export interface UseWidgetComposable {
  props: UseWidgetProps;
  setup<ConfigT>(crud: Crud<ConfigT>, context: WidgetContext): UseWidgetComponent<ConfigT>;
}

export const useWidget: UseWidgetComposable = {
  props: {
    crud: {
      type: Object as PropType<Crud>,
      required: true,
    },
    context: {
      type: Object as PropType<WidgetContext>,
      required: true,
    },
  },
  setup<ConfigT>(crud: Crud<ConfigT>, context: WidgetContext) {
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
      ...useCrud.setup(crud),
      mode,
      toggleMode,
      inDialog,
      toolbarComponent,
    };
  },
};

