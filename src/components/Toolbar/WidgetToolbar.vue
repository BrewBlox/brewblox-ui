<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/Widget/CrudComponent';
import { WidgetMode } from '@/store/features';

@Component
export default class WidgetToolbar extends CrudComponent {

  @Prop({ type: String, required: false })
  public readonly mode!: WidgetMode | null;

  get moreIcon(): string {
    if (!this.mode) {
      return 'mdi-menu';
    }
    return this.mode === 'Full'
      ? 'mdi-launch'
      : 'settings';
  }

  public more(): void {
    if (!this.mode) {
      return;
    }
    else if (this.mode === 'Basic') {
      this.$emit('update:mode', 'Full');
    }
    else {
      this.$emit('update:mode', 'Basic');
      this.showDialog();
    }
  }

  public less(): void {
    this.$emit('update:mode', 'Basic');
  }
}
</script>

<template>
  <Toolbar :title="widget.title" :subtitle="displayName">
    <slot />
    <q-item-section v-if="mode === 'Full'" side>
      <q-btn flat icon="mdi-arrow-left-circle" color="white" @click="less" />
    </q-item-section>
    <template #buttons>
      <slot name="buttons">
        <q-btn-dropdown :split="!!mode" flat :icon="moreIcon" @click="more">
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
