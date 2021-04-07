<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { typeName as graphType } from '@/plugins/history/Graph/getters';
import { addBlockGraph } from '@/plugins/history/Graph/helpers';
import { createWidgetWizard } from '@/plugins/wizardry';
import { dashboardStore } from '@/store/dashboards';

import BlockCrudComponent from '../BlockCrudComponent';

@Component
export default class BlockActions extends BlockCrudComponent {

  async addToGraph(): Promise<void> {
    const graphOpts = dashboardStore
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
          title: 'Select Graph widget',
          listSelect: graphOpts.length < 10,
          selectProps: {
            label: 'Graph widgets',
          },
          value: null,
          selectOptions: graphOpts,
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
      addBlockGraph(widgetId, this.block);
    }
  }
}
</script>

<template>
  <ActionSubmenu label="Block">
    <slot name="block-actions" />
    <ActionItem
      v-if="!crud.isStoreWidget"
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
      @click="displayBlock"
    />
    <BlockGroupsAction
      v-if="crud.isStoreBlock"
      :crud="crud"
    />
    <ActionItem
      icon="mdi-file-export"
      label="Export"
      @click="exportBlock"
    />
    <RemoveBlockAction
      v-if="!crud.isStoreWidget"
      :crud="crud"
    />
  </ActionSubmenu>
</template>
