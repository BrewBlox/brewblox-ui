<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { useDialog, useGlobals } from '@/composables';
import { Crud, featureStore, WidgetContext, WidgetMode } from '@/store/features';
import { Widget, widgetStore } from '@/store/widgets';

export default defineComponent({
  name: 'StoreWidgetDialog',
  props: {
    ...useDialog.props,
    widgetId: {
      type: String,
      required: true,
    },
    mode: {
      type: String as PropType<WidgetMode>,
      default: 'Full',
    },
    getProps: {
      type: Function as PropType<() => LooseDictionary>,
      default: () => ({}),
    },
  },
  emits: [
    ...useDialog.emits,
  ],
  setup(props) {
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
    } = useDialog.setup();
    const {
      dense,
    } = useGlobals.setup();

    const widget = computed<Widget | null>(
      () => widgetStore.widgetById(props.widgetId),
    );

    const crud = computed<Crud | null>(
      () => widget.value === null
        ? null
        : {
          isStoreWidget: true,
          widget: widget.value,
          saveWidget: widgetStore.saveWidget,
          closeDialog: () => onDialogHide(),
        },
    );

    const context = computed<WidgetContext>(
      () => ({
        container: 'Dialog',
        mode: props.mode,
        size: 'Fixed',
      }),
    );

    const widgetComponent = computed<string | null>(
      () => crud.value === null
        ? null
        : featureStore.widgetComponent(crud.value).component,
    );

    const widgetProps = computed<LooseDictionary>(
      () => props.getProps() ?? {},
    );

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      dense,
      widget,
      crud,
      context,
      widgetComponent,
      widgetProps,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    :maximized="dense"
    v-bind="dialogProps"
    class="row"
    @hide="onDialogHide"
  >
    <component
      :is="widgetComponent"
      v-if="widget && crud && widgetComponent"
      :crud="crud"
      :context="context"
      v-bind="widgetProps"
      @close="onDialogHide"
    />
  </q-dialog>
</template>
