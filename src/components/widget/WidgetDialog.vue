<script setup lang="ts">
import { computed } from 'vue';
import {
  useDialog,
  UseDialogEmits,
  UseDialogProps,
  useGlobals,
} from '@/composables';
import { WidgetContext, WidgetMode } from '@/store/features';
import { useWidgetStore, Widget } from '@/store/widgets';

interface Props extends UseDialogProps {
  widgetId: string;
  mode?: WidgetMode;
  widgetProps?: AnyDict;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  mode: 'Full',
  widgetProps: () => ({}),
});

defineEmits<UseDialogEmits>();

const widgetStore = useWidgetStore();
const { dialogRef, dialogOpts, onDialogHide } = useDialog.setup<never>();
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
      v-bind="widgetProps"
    />
  </q-dialog>
</template>
