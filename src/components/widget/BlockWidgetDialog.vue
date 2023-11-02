<script setup lang="ts">
import {
  UseDialogEmits,
  UseDialogProps,
  useDialog,
  useGlobals,
} from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { BlockWidget } from '@/plugins/spark/types';
import { useFeatureStore, WidgetContext, WidgetMode } from '@/store/features';
import type { Block } from 'brewblox-proto/ts';
import { nanoid } from 'nanoid';
import { computed, ref } from 'vue';

interface Props extends UseDialogProps {
  serviceId: string;
  blockId: string;
  mode?: WidgetMode;
  getProps?: () => AnyDict;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  mode: 'Full',
  getProps: () => ({}),
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide } = useDialog.setup();
const { dense } = useGlobals.setup();
const widgetId = nanoid();
const sparkStore = useSparkStore();
const featureStore = useFeatureStore();

const block = computed<Block | null>(() =>
  sparkStore.blockById(props.serviceId, props.blockId),
);

const blockType = computed<string>(() => block.value?.type ?? '');

const widget = ref<BlockWidget>({
  id: widgetId,
  title: props.blockId,
  feature: blockType.value,
  dashboard: '',
  order: 0,
  config: {
    serviceId: props.serviceId,
    blockId: props.blockId,
  },
  ...featureStore.widgetSize(blockType.value),
});

const context = computed<WidgetContext>(() => ({
  container: 'Dialog',
  mode: props.mode,
  size: 'Fixed',
}));

const widgetProps = computed<AnyDict>(() => props.getProps() ?? {});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    :maximized="dense"
    transition-show="fade"
    class="row"
    v-bind="{ ...dialogOpts, ...$attrs }"
    @hide="onDialogHide"
  >
    <WidgetWrapper
      v-if="widget"
      v-model:widget="widget"
      :context="context"
      v-bind="widgetProps"
      volatile
      @close="onDialogHide"
    />
  </q-dialog>
</template>
