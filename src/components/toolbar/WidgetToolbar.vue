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
  <Toolbar :title="widget.title" :subtitle="displayName">
    <slot />
    <q-item-section side>
    </q-item-section>
    <template #buttons>
      <slot name="buttons">
        <q-btn v-if="!!mode" flat :icon="toggleIcon" @click="toggle">
          <q-tooltip>
            {{ toggleTooltip }}
          </q-tooltip>
        </q-btn>
        <q-btn flat icon="mdi-launch" color="white" @click="showDialog">
          <q-tooltip>
            Show in dialog
          </q-tooltip>
        </q-btn>
        <q-btn flat icon="mdi-menu">
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
      </slot>
    </template>
  </Toolbar>
</template>
