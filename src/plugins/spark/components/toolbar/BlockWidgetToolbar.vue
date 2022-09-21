<script lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { startChangeBlockId } from '@/plugins/spark/utils/actions';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'BlockWidgetToolbar',
  setup() {
    const { widgetId, block, hasGraph, graphConfig } = useBlockWidget.setup();
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
  <WidgetToolbar :change-title-fn="changeTitle">
    <BlockGraph
      v-if="graphModalOpen"
      :id="`graph-full--${widgetId}`"
      v-model:modal="graphModalOpen"
      v-model:config="graphConfig"
    />
    <slot />

    <!-- Avoid the toolbar rendering an empty menu -->
    <template
      v-if="hasGraph || $slots.actions"
      #actions
    >
      <ActionItem
        v-if="hasGraph"
        icon="mdi-chart-line"
        label="Graph"
        @click="graphModalOpen = true"
      />
      <slot name="actions" />
    </template>

    <template #menus>
      <WidgetActions no-rename />
      <BlockActions />
    </template>
  </WidgetToolbar>
</template>
