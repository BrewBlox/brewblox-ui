<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import BlockCrudComponent from '../BlockCrudComponent';

@Component
export default class BlockEnableToggle extends BlockCrudComponent {

  @Prop({ type: String, default: 'enabled' })
  public readonly dataKey!: string;

  @Prop({ type: Boolean, default: false })
  public readonly hideEnabled!: boolean;

  get enabled(): boolean {
    return Boolean(this.block.data[this.dataKey]);
  }

  toggleEnabled(): void {
    this.block.data[this.dataKey] = !this.enabled;
    this.saveBlock();
  }
}
</script>

<template>
  <div
    v-if="!(enabled && hideEnabled)"
    class="
    row no-wrap items-center
    q-gutter-x-md q-mx-md q-mt-sm q-py-sm
    clickable rounded-borders"
    style="max-width: 100%"
    @click="toggleEnabled"
  >
    <q-icon
      :name="enabled ? 'mdi-link' : 'mdi-link-variant-off'"
      :color="enabled ? 'positive' : 'negative'"
      size="md"
      class="col-auto"
    />
    <div class="col">
      <small class="col fade-5">Click to toggle</small>
      <div v-show="enabled" class="col">
        <slot name="enabled">
          This block is enabled.
        </slot>
      </div>
      <div v-show="!enabled" class="col">
        <slot name="disabled">
          This block is disabled.
        </slot>
      </div>
    </div>
  </div>
</template>
