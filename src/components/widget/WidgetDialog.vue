<script lang="ts">
import { useDialog, useGlobals } from '@/composables';
import { WidgetContext, WidgetMode } from '@/store/features';
import { useWidgetStore, Widget } from '@/store/widgets';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'WidgetDialog',
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
      type: Function as PropType<() => AnyDict>,
      default: () => ({}),
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const widgetStore = useWidgetStore();
    const { dialogRef, dialogProps, onDialogHide } = useDialog.setup();
    const { dense } = useGlobals.setup();

    const widget = computed<Widget | null>({
      get: () => widgetStore.widgetById(props.widgetId),
      set: (v) => v && widgetStore.saveWidget(v),
    });

    const context = computed<WidgetContext>(() => ({
      container: 'Dialog',
      mode: props.mode,
      size: 'Fixed',
    }));

    const widgetProps = computed<AnyDict>(() => props.getProps() ?? {});

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      dense,
      context,
      widget,
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
    transition-show="fade"
    @hide="onDialogHide"
  >
    <WidgetWrapper
      v-if="widget"
      v-model:widget="widget"
      :context="context"
    />
  </q-dialog>
</template>
