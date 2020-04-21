<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { blockTypes, isCompatible } from '@/plugins/spark/block-types';
import { sparkStore } from '@/plugins/spark/store';

import { PinChannel } from '../types';

@Component
export default class QuickStartPinField extends Vue {
  readonly validTypes = [
    blockTypes.Spark2Pins,
    blockTypes.Spark3Pins,
    blockTypes.MockPins,
    blockTypes.DS2413,
  ];

  @Prop({ type: Object, required: false })
  public readonly value!: PinChannel;

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  get local(): PinChannel {
    return this.value;
  }

  set local(value: PinChannel) {
    this.$emit('input', value);
  }

  get opts(): SelectOption[] {
    return sparkStore.serviceBlocks(this.serviceId)
      .reduce(
        (acc, block) => {
          if (isCompatible(block.type, this.validTypes)) {
            acc.push(
              ...block.data.pins.map((pin, idx) => {
                const [pinName] = Object.keys(block.data.pins[idx]);
                return { pinName, arrayId: block.id, pinId: idx + 1 };
              })
            );
          }
          return acc;
        },
        Array<PinChannel>())
      .map(channel => ({ label: `${channel.arrayId} ${channel.pinName}`, value: channel }));
  }

  get status(): string {
    if (!this.local) {
      return '';
    }
    const block = sparkStore.blockById(this.serviceId, this.local.arrayId);
    if (!block) {
      return `Block '${this.local.arrayId}' not found`;
    }
    return (block.data.connected === false)
      ? `${this.local.arrayId} is not connected`
      : `${this.local.arrayId} is connected`;
  }
}
</script>

<template>
  <q-select
    v-model="local"
    :options="opts"
    :hint="status"
    :rules="[v => !!v || 'Pin must be selected']"
    v-bind="$attrs"
    emit-value
    map-options
  />
</template>
