<script lang="ts">
import { nanoid } from 'nanoid';
import { PropType, computed, defineComponent, onUnmounted } from 'vue';

import { useDialog, useGlobals } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import type { Block } from '@/plugins/spark/types';
import {
  ComponentResult,
  WidgetContext,
  WidgetMode,
  useFeatureStore,
} from '@/store/features';
import { Widget, useWidgetStore } from '@/store/widgets';

export default defineComponent({
  name: 'BlockWidgetDialog',
  props: {
    ...useDialog.props,
    serviceId: {
      type: String,
      required: true,
    },
    blockId: {
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
    const { dialogRef, dialogProps, onDialogHide } = useDialog.setup();
    const { dense } = useGlobals.setup();
    const widgetId = nanoid();
    const sparkStore = useSparkStore();
    const widgetStore = useWidgetStore();
    const featureStore = useFeatureStore();

    const block = computed<Block | null>(() =>
      sparkStore.blockById(props.serviceId, props.blockId),
    );

    const blockType = computed<string>(() => block.value?.type ?? '');

    widgetStore.setVolatileWidget({
      id: widgetId,
      title: props.blockId,
      feature: blockType.value,
      dashboard: '',
      order: 0,
      config: {
        serviceId: props.serviceId,
        blockId: props.blockId,
      },
      volatile: true,
      ...featureStore.widgetSize(blockType.value),
    });

    onUnmounted(() => {
      widgetStore.removeVolatileWidget({ id: widgetId });
    });

    const widget = computed<Widget | null>(() =>
      widgetStore.widgetById(widgetId),
    );

    const context = computed<WidgetContext>(() => ({
      container: 'Dialog',
      mode: props.mode,
      size: 'Fixed',
    }));

    const widgetComponent = computed<ComponentResult | null>(() =>
      widget.value ? featureStore.widgetComponent(widget.value) : null,
    );

    const widgetProps = computed<AnyDict>(() => props.getProps() ?? {});

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      dense,
      block,
      widgetId,
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
    transition-show="fade"
    class="row"
    v-bind="{ ...dialogProps, ...$attrs }"
    @hide="onDialogHide"
  >
    <WidgetProvider
      :widget-id="widgetId"
      :context="context"
    >
      <component
        :is="widgetComponent.component"
        v-if="block && widgetComponent"
        :error="widgetComponent.error"
        v-bind="widgetProps"
        @close="onDialogHide"
      />
    </WidgetProvider>
  </q-dialog>
</template>
