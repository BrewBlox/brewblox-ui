<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/Widget/CrudComponent';
import { WidgetMode } from '@/store/features';

@Component
export default class WidgetToolbar extends CrudComponent {

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
  <Toolbar :title="widget.title" :subtitle="displayName">
    <slot />
    <q-item-section v-if="!!mode" side>
      <q-btn flat :icon="modeIcon" @click="toggleMode" />
    </q-item-section>
    <template v-slot:buttons>
      <slot name="buttons">
        <q-btn-dropdown flat split icon="settings" @click="showDialog">
          <q-list dark bordered>
            <slot name="actions">
              <WidgetActions :crud="crud" />
            </slot>
          </q-list>
        </q-btn-dropdown>
      </slot>
    </template>
  </Toolbar>
</template>
