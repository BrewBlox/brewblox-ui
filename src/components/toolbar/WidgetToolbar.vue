<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { WidgetMode } from '@/store/features';

@Component
export default class WidgetToolbar extends CrudComponent {

  @Prop({ type: String, required: false })
  public readonly mode!: WidgetMode | null;

  get toggleIcon(): string {
    return this.mode === 'Basic'
      ? 'mdi-unfold-more-horizontal'
      : 'mdi-unfold-less-horizontal';
  }

  get toggleTooltip(): string {
    return this.mode === 'Basic'
      ? 'Show full widget'
      : 'Show basic widget';
  }

  public toggle(): void {
    this.$emit('update:mode', this.mode === 'Basic' ? 'Full' : 'Basic');
  }
}
</script>

<template>
  <Toolbar :title="widget.title" :subtitle="mode === 'Full' ? displayName : null">
    <q-item-section side />
    <slot />
    <template #buttons>
      <slot name="buttons">
        <q-btn v-if="!!mode" flat dense :icon="toggleIcon" @click="toggle">
          <q-tooltip>
            {{ toggleTooltip }}
          </q-tooltip>
        </q-btn>
        <q-btn flat icon="mdi-launch" dense @click="showDialog">
          <q-tooltip>
            Show in dialog
          </q-tooltip>
        </q-btn>
        <ActionMenu dense>
          <template #actions>
            <slot name="actions" />
          </template>
          <template #menus>
            <slot name="menus">
              <WidgetActions :crud="crud" />
            </slot>
          </template>
        </ActionMenu>
      </slot>
    </template>
  </Toolbar>
</template>
