<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import { WidgetMode } from '@/store/features';

import BlockCrudComponent from '../BlockCrudComponent';

@Component
export default class BlockWidgetToolbar extends BlockCrudComponent {
  graphModalOpen = false;

  @Prop({ type: String, required: false })
  public readonly mode!: WidgetMode | null;

  updateMode(val: WidgetMode): void {
    this.$emit('update:mode', val);
  }
}
</script>

<template>
  <WidgetToolbar :crud="crud" :mode="mode" @update:mode="updateMode">
    <BlockGraph
      v-if="graphModalOpen"
      :id="`graph-full--${widget.id}`"
      v-model="graphModalOpen"
      :config.sync="graphCfg"
    />

    <template #actions>
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
    </template>
  </WidgetToolbar>
</template>

<style scoped>
.dense {
  padding: 0px;
}
</style>
