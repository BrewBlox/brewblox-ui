<script setup lang="ts">
import { useDialog, useGlobals } from '@/composables';
import { WidgetContext, WidgetMode } from '@/store/features';
import { useWidgetStore, Widget } from '@/store/widgets';
import { computed, PropType } from 'vue';

const props = defineProps({
  ...useDialog.props,
  widgetId: {
    type: String,
    required: true,
  },
  mode: {
    type: String as PropType<WidgetMode>,
    default: 'Full',
  },
});

defineEmits<UseDialogEmits>();

const widgetStore = useWidgetStore();
const { dialogRef, dialogOpts, onDialogHide } = useDialog.setup();
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
</script>

<template>
  <q-dialog
    ref="dialogRef"
    :maximized="dense"
    v-bind="dialogOpts"
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
