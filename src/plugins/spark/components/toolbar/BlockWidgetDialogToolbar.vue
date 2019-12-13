<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import { WidgetMode } from '@/store/features';

import BlockCrudComponent from '../BlockCrudComponent';


@Component
export default class BlockWidgetDialogToolbar extends BlockCrudComponent {
  graphModalOpen = false;

  @Prop({ type: String, required: false })
  public readonly mode!: WidgetMode;

  updateMode(val: WidgetMode): void {
    this.$emit('update:mode', val);
  }
}
</script>

<template>
  <WidgetDialogToolbar :crud="crud" :mode="mode" @update:mode="updateMode">
    <BlockGraph
      v-if="graphModalOpen"
      :id="`graph-full-toolbar--${widget.id}`"
      v-model="graphModalOpen"
      :config.sync="graphCfg"
    />
    <template v-if="isStoreBlock" #actions>
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
      <WidgetActions :crud="crud" no-rename />
      <BlockActions :crud="crud" />
    </template>
  </WidgetDialogToolbar>
</template>
