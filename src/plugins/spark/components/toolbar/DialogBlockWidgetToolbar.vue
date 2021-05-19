<script lang="ts">
import { defineComponent, ref } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { startChangeBlockId } from '@/plugins/spark/utils';

export default defineComponent({
  name: 'DialogBlockWidgetToolbar',
  setup() {
    const {
      widgetId,
      block,
      hasGraph,
      graphConfig,
    } = useBlockWidget.setup();
    const graphModalOpen = ref(false);

    function changeTitle(): void {
      startChangeBlockId(block.value);
    }

    return {
      widgetId,
      block,
      hasGraph,
      graphConfig,
      graphModalOpen,
      changeTitle,
    };
  },
});
</script>

<template>
  <DialogWidgetToolbar :change-title-fn="changeTitle">
    <BlockGraph
      v-if="graphModalOpen"
      :id="`graph-full-toolbar--${widgetId}`"
      v-model:modal="graphModalOpen"
      v-model:config="graphConfig"
    />

    <!-- Avoid the toolbar rendering an empty menu -->
    <template v-if="hasGraph || $slots.actions" #actions>
      <ActionItem
        v-if="hasGraph"
        icon="mdi-chart-line"
        label="Graph"
        @click="graphModalOpen = true"
      />
      <slot name="actions" />
    </template>

    <template #menus>
      <slot name="menus" />
      <WidgetActions no-rename />
      <BlockActions />
    </template>
  </DialogWidgetToolbar>
</template>
