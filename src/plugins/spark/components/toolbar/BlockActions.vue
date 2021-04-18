<script lang="ts">
import { defineComponent } from 'vue';

import { typeName as graphType } from '@/plugins/history/Graph/getters';
import { addBlockGraph } from '@/plugins/history/Graph/utils';
import { tryDisplayBlock } from '@/plugins/spark/utils';
import { createWidgetWizard } from '@/plugins/wizardry';
import { dashboardStore } from '@/store/dashboards';
import { widgetStore } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { saveFile } from '@/utils/import-export';

import { useBlockWidget } from '../../composables';

export default defineComponent({
  name: 'BlockActions',
  setup() {
    const {
      block,
      isVolatileWidget,
      startMakeWidget,
      startChangeBlockId,
      hasGraph,
      canDisplay,
      isVolatileBlock,
    } = useBlockWidget.setup();

    async function addToGraph(): Promise<void> {
      const graphOpts = widgetStore
        .widgets
        .filter(v => v.feature === graphType)
        .map(v => ({
          label: `[${dashboardStore.dashboardTitle(v.dashboard)}] ${v.title}`,
          value: v.id,
        }));

      const widgetId: string | null = await new Promise((resolve) => {
        if (graphOpts.length) {
          createDialog({
            component: 'SelectDialog',
            componentProps: {
              title: 'Select Graph widget',
              listSelect: graphOpts.length < 10,
              selectProps: {
                label: 'Graph widgets',
              },
              modelValue: null,
              selectOptions: graphOpts,
            },
          })
            .onOk(value => resolve(value))
            .onCancel(() => resolve(null))
            .onDismiss(() => resolve(null));
        }
        else {
          createWidgetWizard(graphType)
            .onOk(output => resolve(output.widget?.id ?? null))
            .onCancel(() => resolve(null))
            .onDismiss(() => resolve(null));
        }
      });

      if (widgetId) {
        addBlockGraph(widgetId, block.value);
      }
    }

    function addToDisplay(): void {
      tryDisplayBlock(block.value);
    }

    function exportBlock(): void {
      saveFile(block.value, `${block.value.id}.json`);
    }

    return {
      isVolatileWidget,
      startMakeWidget,
      startChangeBlockId,
      hasGraph,
      canDisplay,
      isVolatileBlock,
      addToGraph,
      addToDisplay,
      exportBlock,
    };
  },
});
</script>

<template>
  <ActionSubmenu label="Block">
    <slot name="block-actions" />
    <ActionItem
      v-if="isVolatileWidget"
      icon="mdi-widgets"
      label="Show on dashboard"
      @click="startMakeWidget"
    />
    <ActionItem
      icon="edit"
      label="Rename"
      @click="startChangeBlockId"
    />
    <ActionItem
      v-if="hasGraph"
      icon="mdi-chart-line"
      label="Add to Graph widget"
      @click="addToGraph"
    />
    <ActionItem
      v-if="canDisplay"
      icon="mdi-monitor"
      label="Add to Spark display"
      @click="addToDisplay"
    />
    <ActionItem
      icon="mdi-file-export"
      label="Export"
      @click="exportBlock"
    />
    <RemoveBlockAction
      v-if="isVolatileWidget"
    />
  </ActionSubmenu>
</template>
