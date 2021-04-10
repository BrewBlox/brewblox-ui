import { computed, ComputedRef, PropType, Ref, ref } from 'vue';

import { Crud, WidgetContext, WidgetMode } from '@/store/features';

import { CrudPluginComponent, CrudPluginProps, useCrud } from './use-crud';

export interface DialogPluginProps extends CrudPluginProps {
  context: {
    type: PropType<WidgetContext>,
    required: true,
  }
}

export type DialogPluginEmits = string[];

const props: DialogPluginProps = {
  crud: {
    type: Object as PropType<Crud>,
    required: true,
  },
  context: {
    type: Object as PropType<WidgetContext>,
    required: true,
  },
};

const emits: DialogPluginEmits = [];

interface WidgetPluginComponent<ConfigT> extends CrudPluginComponent<ConfigT> {
  mode: Ref<WidgetMode>;
  toggleMode(): void;
  inDialog: ComputedRef<boolean>;
  toolbarComponent: ComputedRef<string>;
}

interface UseWidgetComposable {
  <ConfigT>(crud: Crud<ConfigT>, context: WidgetContext): WidgetPluginComponent<ConfigT>;
  props: DialogPluginProps;
  emits: DialogPluginEmits;
}

function compose<ConfigT>(crud: Crud<ConfigT>, context: WidgetContext): WidgetPluginComponent<ConfigT> {
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
    ...useCrud(crud),
    mode,
    toggleMode,
    inDialog,
    toolbarComponent,
  };
}
compose.props = props;
compose.emits = emits;

export const useWidget: UseWidgetComposable = compose;
