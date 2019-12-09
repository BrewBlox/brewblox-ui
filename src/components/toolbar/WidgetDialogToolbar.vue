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
      ? 'mdi-arrow-expand-all'
      : 'mdi-arrow-collapse-all';
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
      <q-btn v-if="!!mode" :icon="toggleIcon" flat stretch size="md" @click="toggle" />
      <q-btn-dropdown flat stretch size="md" icon="mdi-menu">
        <q-list bordered>
          <slot name="actions">
            <WidgetActions :crud="crud" />
          </slot>
        </q-list>
      </q-btn-dropdown>
    </template>
  </DialogToolbar>
</template>
