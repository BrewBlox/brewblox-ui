<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import {
  startAddBlockToDisplay,
  startAddBlockToGraphWidget,
  startChangeBlockId,
  startRemoveBlock,
} from '@/plugins/spark/utils/actions';
import {
  isBlockDisplayReady,
  isBlockRemovable,
} from '@/plugins/spark/utils/info';
import { useServiceStore } from '@/store/services';
import { saveFile } from '@/utils/import-export';
import { startCopyWidget } from '@/utils/widgets';

export default defineComponent({
  name: 'BlockActions',
  setup() {
    const serviceStore = useServiceStore();
    const { serviceId, widget, block, isVolatileWidget, hasGraph } =
      useBlockWidget.setup();

    const serviceTitle = computed<string>(
      () => serviceStore.serviceById(serviceId)!.title,
    );

    const canRemove = computed<boolean>(() => isBlockRemovable(block.value));

    const canDisplay = computed<boolean>(() =>
      isBlockDisplayReady(block.value),
    );

    function exportBlock(): void {
      saveFile(block.value, `${block.value.id}.json`);
    }

    return {
      startAddBlockToGraphWidget,
      startRemoveBlock,
      startAddBlockToDisplay,
      startCopyWidget,
      startChangeBlockId,
      serviceTitle,
      widget,
      isVolatileWidget,
      block,
      hasGraph,
      canDisplay,
      canRemove,
      exportBlock,
    };
  },
});
</script>

<template>
  <ActionSubmenu label="Block">
    <q-item class="fade-4">
      <q-item-section avatar>
        <q-icon name="mdi-cloud" />
      </q-item-section>
      <q-item-section>
        <q-item-label caption> Service </q-item-label>
        {{ serviceTitle }}
      </q-item-section>
    </q-item>
    <slot name="block-actions" />
    <ActionItem
      v-if="isVolatileWidget"
      icon="mdi-widgets"
      label="Show on dashboard"
      @click="startCopyWidget(widget)"
    />
    <ActionItem
      icon="edit"
      label="Rename"
      @click="startChangeBlockId(block)"
    />
    <ActionItem
      v-if="hasGraph"
      icon="mdi-chart-line"
      label="Add to Graph widget"
      @click="startAddBlockToGraphWidget(block)"
    />
    <ActionItem
      v-if="canDisplay"
      icon="mdi-monitor"
      label="Add to Spark display"
      @click="startAddBlockToDisplay(block)"
    />
    <ActionItem
      icon="mdi-file-export"
      label="Export"
      @click="exportBlock"
    />
    <ActionItem
      v-if="canRemove"
      icon="delete"
      label="Remove block"
      @click="startRemoveBlock(block)"
    />
  </ActionSubmenu>
</template>
