<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import { WidgetMode } from '@/store/features';

import BlockCrudComponent from './BlockCrudComponent';

@Component
export default class BlockWidgetToolbar extends BlockCrudComponent {
  graphModalOpen = false;

  @Prop({ type: String, required: false })
  public readonly mode!: WidgetMode | null;

  @Emit('update:mode')
  public toggleMode(): WidgetMode {
    return this.mode === 'Basic' ? 'Full' : 'Basic';
  }

  get modeIcon(): string {
    return this.mode === 'Basic'
      ? 'mdi-unfold-more-horizontal'
      : 'mdi-unfold-less-horizontal';
  }
}
</script>

<template>
  <WidgetToolbar :title="widget.title" :subtitle="displayName">
    <BlockGraph
      v-if="graphModalOpen"
      :id="widget.id"
      v-model="graphModalOpen"
      :config.sync="graphCfg"
    />

    <q-item-section v-if="!!mode" side>
      <q-btn flat :icon="modeIcon" @click="toggleMode" />
    </q-item-section>
    <q-item-section side>
      <q-btn-dropdown flat split icon="settings" @click="showDialog">
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
