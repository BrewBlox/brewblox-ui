<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { interfaceTypes, isCompatible } from '@/plugins/spark/block-types';
import { sparkStore } from '@/plugins/spark/store';


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
      .filter(block => isCompatible(block.type, interfaceTypes.TempSensor))
      .map(block => block.id);
  }

  get sensorTemp(): string {
    return sparkStore.blockById(this.serviceId, this.local)?.data.value.toString() ?? '';
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
