<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { typeName as DS2413Type } from '@/plugins/spark/features/DS2413/getters';
import { typeName as Spark2PinsType } from '@/plugins/spark/features/Spark2Pins/getters';
import { typeName as Spark3PinsType } from '@/plugins/spark/features/Spark3Pins/getters';
import { sparkStore } from '@/plugins/spark/store';

import { PinChannel } from '../types';

@Component
export default class QuickStartPinField extends Vue {
  readonly validTypes = [
    Spark2PinsType,
    Spark3PinsType,
    DS2413Type,
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
    return sparkStore.blockValues(this.serviceId)
      .reduce(
        (acc, block) => {
          if (this.validTypes.includes(block.type)) {
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
    if ([Spark2PinsType, Spark3PinsType].includes(block.type)) {
      return '';
    }
    return block.data.connected
      ? `${this.local.arrayId} is connected`
      : `${this.local.arrayId} is not connected`;
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
    dark
    options-dark
  />
</template>
