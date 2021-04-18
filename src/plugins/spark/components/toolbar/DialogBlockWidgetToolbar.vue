<script lang="ts">
import { defineComponent, ref } from 'vue';

import { useBlockWidget } from '../../composables';

export default defineComponent({
  name: 'DialogBlockWidgetToolbar',
  setup() {
    const {
      widgetId,
      isVolatileBlock,
      startChangeBlockId,
      hasGraph,
      graphConfig,
    } = useBlockWidget.setup();
    const graphModalOpen = ref(false);

    return {
      widgetId,
      isVolatileBlock,
      hasGraph,
      graphConfig,
      startChangeBlockId,
      graphModalOpen,
    };
  },
});
</script>

<template>
  <WidgetDialogToolbar
    @title-click="startChangeBlockId"
  >
    <BlockGraph
      v-if="graphModalOpen"
      :id="`graph-full-toolbar--${widgetId}`"
      v-model="graphModalOpen"
      v-model:config="graphConfig"
    />
    <template v-if="!isVolatileBlock" #actions>
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
  </WidgetDialogToolbar>
</template>
