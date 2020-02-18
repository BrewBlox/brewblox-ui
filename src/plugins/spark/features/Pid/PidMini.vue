<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

import { SetpointSensorPairBlock } from '../SetpointSensorPair/types';
import { PidBlock } from './types';


@Component
export default class PidMini extends Vue {
  @Prop({ type: Object, required: true })
  public readonly block!: PidBlock;

  get serviceId(): string {
    return this.block.serviceId;
  }

  get inputBlock(): SetpointSensorPairBlock | null {
    return sparkStore.tryBlockById(this.serviceId, this.block.data.inputId.id);
  }

  get outputBlock(): Block | null {
    return sparkStore.tryBlockById(this.serviceId, this.block.data.outputId.id);
  }

  get kp(): number | null {
    return this.block.data.kp.value;
  }

  fit(v: number): number {
    return Math.min(v, 100);
  }
}
</script>

<template>
  <div class="col-auto row justify-around q-gutter-sm q-my-none q-pr-sm">
    <SettingValueField editable class="col-grow" @click="$emit('edit:input')">
      <template #header>
        Input
      </template>
      <template #valueIcon>
        <q-icon name="mdi-thermometer" color="green-3" />
      </template>
      <template #value>
        {{ block.data.inputValue | unit }}
      </template>
      <template #setting>
        {{ block.data.inputSetting | unit }}
      </template>
    </SettingValueField>
    <SettingValueField editable class="col-grow" @click="$emit('edit:output')">
      <template #header>
        Output
      </template>
      <template #valueIcon>
        <q-icon
          v-if="kp === null"
          name="mdi-calculator-variant"
        />
        <HeatingIcon
          v-else-if="kp > 0"
          color="red"
          :svg-props="{'stroke-width': '2px'}"
        />
        <CoolingIcon
          v-else-if="kp < 0"
          color="dodgerblue"
          :svg-props="{'stroke-width': '2px'}"
        />
      </template>
      <template #value>
        {{ block.data.outputValue | round }} %
      </template>
      <template #setting>
        {{ block.data.outputSetting | round }} %
      </template>
    </SettingValueField>

    <div class="col-break" />

    <div class="col row no-wrap q-gutter-x-sm q-mr-md">
      <div class="col-auto self-center text-bold">
        P
      </div>
      <q-slider
        :value="fit(block.data.p)"
        readonly
        class="col-grow"
        thumb-path=""
      />

      <div class="col-auto self-center text-bold">
        I
      </div>
      <q-slider
        :value="fit(block.data.i)"
        :max="100"
        readonly
        class="col-grow"
        thumb-path=""
      />

      <div class="col-auto self-center text-bold">
        D
      </div>
      <q-slider
        :value="fit(block.data.d)"
        :max="100"
        readonly
        class="col-grow"
        thumb-path=""
      />

      <div
        v-if="!!block.data.boilMinOutput"
        :class="[
          'col-auto self-center text-bold',
          `text-${block.data.boilModeActive
            ? 'deep-orange'
            : 'grey'
          }`,
        ]"
      >
        boil
      </div>
    </div>
  </div>
</template>
