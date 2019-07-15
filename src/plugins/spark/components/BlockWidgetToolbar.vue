<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import BlockCrudComponent from './BlockCrudComponent';

@Component
export default class BlockWidgetToolbar extends BlockCrudComponent {
  graphModalOpen: boolean = false;

  @Prop({ type: Object })
  public readonly graphProps!: any;
}
</script>

<template>
  <WidgetToolbar :title="widget.title" :subtitle="displayName">
    <BlockGraph
      v-if="graphModalOpen"
      v-model="graphModalOpen"
      :id="widget.id"
      :config.sync="graphCfg"
    />

    <q-item-section side>
      <q-btn-dropdown flat split icon="settings" @click="openModal({graphProps})">
        <q-list dark bordered>
          <!-- Global Actions -->
          <ActionItem
            v-if="hasGraph"
            icon="mdi-chart-line"
            label="Show graph"
            @click="graphModalOpen = true"
          />
          <slot name="actions" />
          <ActionItem icon="refresh" label="Refresh" @click="refreshBlock" />
          <WidgetActions :crud="crud" no-rename />
          <BlockActions :crud="crud" />
        </q-list>
      </q-btn-dropdown>
    </q-item-section>
  </WidgetToolbar>
</template>

<style scoped>
.dense {
  padding: 0px;
}
</style>
