<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { isCompatible } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { BlockType } from '@/plugins/spark/types';

import { PinChannel } from '../types';

@Component
export default class QuickStartPinField extends Vue {
  readonly validTypes: BlockType[] = [
    'Spark2Pins',
    'Spark3Pins',
    'MockPins',
    'DS2413',
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
      .filter(block => isCompatible(block.type, this.validTypes))
      .flatMap((block): PinChannel[] =>
        block.data.pins.map((pin, idx) => {
          const [pinName] = Object.keys(block.data.pins[idx]);
          return { pinName, arrayId: block.id, pinId: idx + 1 };
        }))
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
