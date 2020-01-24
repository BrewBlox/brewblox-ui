<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import { WidgetMode } from '@/store/features';

import BlockCrudComponent from '../BlockCrudComponent';

@Component
export default class BlockWidgetToolbar extends BlockCrudComponent {
  graphModalOpen = false;

  @Prop({ type: String, required: false })
  public readonly mode!: WidgetMode | null;

  get localMode(): WidgetMode | null {
    return this.mode;
  }

  set localMode(val: WidgetMode | null) {
    this.$emit('update:mode', val);
  }
}
</script>

<template>
  <WidgetToolbar :crud="crud" :mode.sync="localMode">
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
        label="Graph"
        @click="graphModalOpen = true"
      />
      <slot name="actions" />
    </template>

    <template #menus>
      <WidgetActions :crud="crud" no-rename />
      <BlockActions :crud="crud" />
    </template>
  </WidgetToolbar>
</template>
