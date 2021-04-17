<script lang="ts">
import { nanoid } from 'nanoid';
import { computed, defineComponent, onUnmounted, PropType } from 'vue';

import { useDialog, useGlobals } from '@/composables';
import { sparkStore } from '@/plugins/spark/store';
import type { Block } from '@/plugins/spark/types';
import { featureStore, WidgetContext, WidgetMode } from '@/store/features';
import { Widget, widgetStore } from '@/store/widgets';

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
      type: Function as PropType<() => LooseDictionary>,
      default: () => ({}),
    },
  },
  emits: {
    ...useDialog.emits,
  },
  async setup(props) {
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
    } = useDialog.setup();
    const { dense } = useGlobals.setup();
    const widgetId = nanoid();

    const block = computed<Block | null>(
      () => sparkStore.blockById(props.serviceId, props.blockId),
    );

    const blockType = computed<string>(
      () => block.value?.type ?? '',
    );

    onUnmounted(() => {
      const widget = widgetStore.widgetById(widgetId);
      if (widget) {
        widgetStore.removeWidget(widget);
      }
    });

    await widgetStore.createWidget({
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

    const widget = computed<Widget | null>(
      () => widgetStore.widgetById(widgetId),
    );

    const context = computed<WidgetContext>(
      () => ({
        container: 'Dialog',
        mode: props.mode,
        size: 'Fixed',
      }),
    );

    const widgetComponent = computed<string | null>(
      () => widget.value
        ? featureStore.widgetComponent(widget.value).component
        : null,
    );

    const widgetProps = computed<LooseDictionary>(
      () => props.getProps() ?? {},
    );

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
    v-bind="{...dialogProps, ...$attrs}"
    @hide="onDialogHide"
  >
    <suspense>
      <component
        :is="widgetComponent"
        v-if="block && widgetComponent"
        :widget-id="widgetId"
        :context="context"
        v-bind="widgetProps"
        @close="onDialogHide"
      />
    </suspense>
  </q-dialog>
</template>
