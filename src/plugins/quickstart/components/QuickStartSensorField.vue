<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { prettyQty } from '@/helpers/bloxfield';
import { isCompatible } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { BlockIntfType } from '@/plugins/spark/types';


@Component
export default class QuickStartSensorField extends Vue {

  @Prop({ type: String, required: false })
  public readonly value!: string;

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  get local(): string {
    return this.value;
  }

  set local(value: string) {
    this.$emit('input', value);
  }

  get opts(): string[] {
    return sparkStore.serviceBlocks(this.serviceId)
      .filter(block => isCompatible(block.type, BlockIntfType.TempSensorInterface))
      .map(block => block.id);
  }

  get sensorTemp(): string {
    const block = sparkStore.blockById(this.serviceId, this.local);
    return prettyQty(block?.data.value);
  }
}
</script>

<template>
  <q-select
    v-model="local"
    :options="opts"
    :hint="sensorTemp"
    :rules="[v => !!v || 'Sensor must be selected']"
    v-bind="$attrs"
  />
</template>
