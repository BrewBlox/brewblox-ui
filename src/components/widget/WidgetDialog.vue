<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { useDialog, useGlobals } from '@/composables';
import { Crud, featureStore, WidgetContext, WidgetMode } from '@/store/features';

export default defineComponent({
  name: 'WidgetDialog',
  props: {
    ...useDialog.props,
    getCrud: {
      type: Function as PropType<() => Crud>,
      required: true,
    },
    mode: {
      type: String as PropType<WidgetMode>,
      default: 'Full',
    },
    getProps: {
      type: Function as PropType<() => LooseDictionary>,
      required: true,
    },
    listeners: {
      type: Object as PropType<Mapped<(...args: any[]) => void>>,
      default: () => ({}),
    },
  },
  emits: {
    ...useDialog.emits,
  },
  setup(props) {
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
    } = useDialog.setup();
    const { dense } = useGlobals.setup();

    const context = computed<WidgetContext>(
      () => ({
        mode: props.mode,
        container: 'Dialog',
        size: 'Fixed',
      }),
    );

    const crud = computed<Crud>(
      () => props.getCrud(),
    );

    const widgetProps = computed<LooseDictionary>(
      () => props.getProps(),
    );

    const widgetComponent = computed<string>(
      () => featureStore.widgetComponent(crud.value).component,
    );

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      dense,
      context,
      crud,
      widgetProps,
      widgetComponent,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    transition-show="fade"
    :maximized="dense"
    v-bind="dialogProps"
    @hide="onDialogHide"
  >
    <component
      :is="widgetComponent"
      :initial-crud="crud"
      :context="context"
      v-bind="widgetProps"
      v-on="listeners"
      @close="onDialogHide"
    />
  </q-dialog>
</template>
