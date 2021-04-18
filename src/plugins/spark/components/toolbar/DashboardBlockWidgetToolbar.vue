<script lang="ts">
import { defineComponent, ref } from 'vue';

import { useBlockWidget } from '../../composables';

export default defineComponent({
  name: 'DashboardBlockWidgetToolbar',
  setup() {
    const {
      widgetId,
      hasGraph,
      graphConfig,
      startChangeBlockId,
    } = useBlockWidget.setup();
    const graphModalOpen = ref(false);

    return {
      widgetId,
      hasGraph,
      graphConfig,
      graphModalOpen,
      startChangeBlockId,
    };
  },
});
</script>

<template>
  <WidgetToolbar @title-click="startChangeBlockId">
    <BlockGraph
      v-if="graphModalOpen"
      :id="`graph-full--${widgetId}`"
      v-model:modal="graphModalOpen"
      v-model:config="graphConfig"
    />

    <template #actions>
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
