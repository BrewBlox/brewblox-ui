<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/Widget/CrudComponent';
import { WidgetMode } from '@/store/features';

@Component
export default class WidgetDialogToolbar extends CrudComponent {

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
  <DialogToolbar>
    <q-item-section>
      <q-item-label>{{ widget.title }}</q-item-label>
      <q-item-label caption>
        {{ displayName }}
      </q-item-label>
    </q-item-section>
    <slot />
    <q-item-section v-if="!!mode" side>
      <q-btn flat color="white" :icon="modeIcon" @click="toggleMode" />
    </q-item-section>
    <template v-slot:buttons>
      <slot name="buttons">
        <q-btn-dropdown flat icon="mdi-pencil">
          <q-list dark bordered>
            <slot name="actions">
              <WidgetActions :crud="crud" />
            </slot>
          </q-list>
        </q-btn-dropdown>
      </slot>
    </template>
  </DialogToolbar>
</template>
