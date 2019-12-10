<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { WidgetMode } from '@/store/features';

@Component
export default class WidgetDialogToolbar extends CrudComponent {

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
  <DialogToolbar>
    <q-item-section>
      <q-item-label>{{ widget.title }}</q-item-label>
      <q-item-label caption>
        {{ displayName }}
      </q-item-label>
    </q-item-section>
    <slot />
    <template #buttons>
      <q-btn v-if="!!mode" :icon="toggleIcon" flat stretch size="md" @click="toggle">
        <q-tooltip>
          {{ toggleTooltip }}
        </q-tooltip>
      </q-btn>
      <q-btn flat stretch size="md" icon="mdi-menu">
        <q-tooltip>
          Show menu
        </q-tooltip>
        <q-menu>
          <q-list bordered>
            <slot name="actions">
              <WidgetActions :crud="crud" />
            </slot>
          </q-list>
        </q-menu>
      </q-btn>
    </template>
  </DialogToolbar>
</template>
