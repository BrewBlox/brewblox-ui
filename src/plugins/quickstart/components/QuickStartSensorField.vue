<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { blockTypes } from '@/plugins/spark/block-types';
import { sparkStore } from '@/plugins/spark/store';


@Component
export default class QuickStartSensorField extends Vue {
  readonly validTypes = [
    blockTypes.TempSensorOneWire,
    blockTypes.TempSensorMock,
  ];

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
    return sparkStore.blockValues(this.serviceId)
      .filter(block => this.validTypes.includes(block.type))
      .map(block => block.id);
  }

  get sensorTemp(): string {
    return !!this.local
      ? sparkStore.blockById(this.serviceId, this.local).data.value.toString()
      : '';
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
    dark
    options-dark
  />
</template>
