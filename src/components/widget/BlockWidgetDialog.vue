<script lang="ts">
import { nanoid } from 'nanoid';
import { computed, defineComponent, PropType, ref } from 'vue';

import { useDialog, useGlobals } from '@/composables';
import { sparkStore } from '@/plugins/spark/store';
import type { Block, BlockConfig, BlockCrud } from '@/plugins/spark/types';
import { Widget } from '@/store/dashboards';
import { featureStore, WidgetContext, WidgetMode } from '@/store/features';

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
  setup(props) {
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
    } = useDialog.setup();
    const { dense } = useGlobals.setup();

    const block = computed<Block | null>(
      () => sparkStore.blockById(props.serviceId, props.blockId),
    );

    const blockType = computed<string>(
      () => block.value?.type ?? '',
    );

    const widget = ref<Widget<BlockConfig>>({
      id: nanoid(),
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

    const crud = computed<BlockCrud>(
      () => ({
        isStoreWidget: false,
        isStoreBlock: true,
        widget: widget.value,
        saveWidget: v => widget.value = v,
        block: block.value!,
        saveBlock: v => sparkStore.saveBlock(v),
        closeDialog: () => onDialogHide(),
      }),
    );

    const context = computed<WidgetContext>(
      () => ({
        container: 'Dialog',
        mode: props.mode,
        size: 'Fixed',
      }),
    );

    const widgetComponent = computed<string>(
      () => featureStore.widgetComponent(crud.value).component,
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
    transition-show="fade"
    class="row"
    v-bind="{...dialogProps, ...$attrs}"
    @hide="onDialogHide"
  >
    <component
      :is="widgetComponent"
      v-if="block && widgetComponent"
      :initial-crud="crud"
      :context="context"
      v-bind="widgetProps"
      @close="onDialogHide"
    />
  </q-dialog>
</template>
