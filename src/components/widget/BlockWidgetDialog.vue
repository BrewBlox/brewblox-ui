<script setup lang="ts">
import { nanoid } from 'nanoid';
import { computed, provide, ref } from 'vue';
import {
  useDialog,
  UseDialogEmits,
  UseDialogProps,
  useGlobals,
} from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { BlockWidget } from '@/plugins/spark/types';
import { useFeatureStore, WidgetContext, WidgetMode } from '@/store/features';
import { ChainOfKey, DialogStepBackKey, ShowBlockKey } from '@/symbols';

interface Props extends UseDialogProps {
  serviceId: string;
  blockId: string;
  mode?: WidgetMode;
  getProps?: () => AnyDict;
  /** The block whose control chain this block was opened from */
  chainOf?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  mode: 'Full',
  getProps: () => ({}),
  chainOf: null,
});

defineEmits<UseDialogEmits>();

const {
  dialogRef,
  dialogOpts,
  onDialogHide,
  pushRouteStep,
  routeSteps,
  routeStepBack,
} = useDialog.setup<never>();
const { dense } = useGlobals.setup();
const sparkStore = useSparkStore();
const featureStore = useFeatureStore();

function blockWidget(blockId: string): BlockWidget {
  const blockType = sparkStore.blockById(props.serviceId, blockId)?.type ?? '';
  return {
    id: nanoid(),
    title: blockId,
    feature: blockType,
    dashboard: '',
    order: 0,
    config: {
      serviceId: props.serviceId,
      blockId,
    },
    ...featureStore.widgetSize(blockType),
  };
}

const widget = ref<BlockWidget>(blockWidget(props.blockId));
const chainOf = ref<string | null>(props.chainOf);
// Follows the widget's Basic/Full toggle
const mode = ref<WidgetMode>(props.mode);

// Other blocks are shown in the same dialog, in the mode the dialog is in.
// The back button returns to the previous one, in the mode it was in.
function showBlock(blockId: string, nextChainOf: string | null = null): void {
  const previous = {
    widget: widget.value,
    chainOf: chainOf.value,
    mode: mode.value,
  };
  if (blockId === previous.widget.config.blockId) {
    return;
  }
  widget.value = blockWidget(blockId);
  chainOf.value = nextChainOf;
  pushRouteStep(() => {
    widget.value = previous.widget;
    chainOf.value = previous.chainOf;
    mode.value = previous.mode;
  });
}

provide(ShowBlockKey, showBlock);
provide(
  DialogStepBackKey,
  computed(() => (routeSteps.value > 0 ? routeStepBack : null)),
);
provide(
  ChainOfKey,
  computed(() => chainOf.value),
);

const context = computed<WidgetContext>(() => ({
  container: 'Dialog',
  mode: mode.value,
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
      :key="widget.id"
      v-model:widget="widget"
      :context="context"
      v-bind="widgetProps"
      volatile
      @update:mode="(v) => (mode = v)"
      @close="onDialogHide"
    />
  </q-dialog>
</template>
