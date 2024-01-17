<script setup lang="ts">
import { ref } from 'vue';
import { useBlockWidget } from '@/plugins/spark/composables';
import { startRelationsDialog } from '@/plugins/spark/utils/relations';

const { block, widgetId, hasGraph, hasRelations, graphConfig } =
  useBlockWidget.setup();
const graphModalOpen = ref(false);
</script>

<template>
  <WidgetToolbar>
    <BlockGraph
      v-if="graphModalOpen"
      :id="`graph-full--${widgetId}`"
      v-model:modal="graphModalOpen"
      v-model:config="graphConfig"
    />
    <slot />

    <!-- Avoid the toolbar rendering an empty menu -->
    <template
      v-if="hasGraph || hasRelations || $slots.actions"
      #actions
    >
      <ActionItem
        v-if="hasGraph"
        icon="mdi-chart-line"
        label="Graph"
        @click="graphModalOpen = true"
      />
      <ActionItem
        v-if="hasRelations"
        icon="mdi-vector-line"
        label="Relations"
        @click="startRelationsDialog(block)"
      />
      <slot name="actions" />
    </template>

    <template #menus>
      <WidgetActions no-rename />
      <BlockActions />
    </template>
  </WidgetToolbar>
</template>
