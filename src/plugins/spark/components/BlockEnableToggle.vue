<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

@Component
export default class BlockEnableToggle extends BlockCrudComponent {

  @Prop({ type: String, default: 'enabled' })
  public readonly dataKey!: string;

  @Prop({ type: String, default: 'This block is enabled' })
  readonly textEnabled!: string;

  @Prop({ type: String, default: 'This block is disabled' })
  readonly textDisabled!: string;

  get enabled() {
    return Boolean(this.block.data[this.dataKey]);
  }

  get mainText() {
    return this.enabled
      ? this.textEnabled
      : this.textDisabled;
  }

  toggleEnabled() {
    this.block.data[this.dataKey] = !this.enabled;
    this.saveBlock();
  }
}
</script>

<template>
  <q-item dark>
    <q-item-section>{{ mainText }}</q-item-section>
    <q-item-section side>
      <q-btn
        :label="enabled ? 'Disable': 'Enable'"
        :color="enabled ? 'negative' : 'positive'"
        outline
        dense
        @click="toggleEnabled"
      />
    </q-item-section>
  </q-item>
</template>
