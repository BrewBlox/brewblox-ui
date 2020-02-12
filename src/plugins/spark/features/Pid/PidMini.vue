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
    <div
      class="col-grow row justify-center q-py-sm clickable rounded-borders"
      @click="$emit('edit:input')"
    >
      <div class="col-auto grid-container">
        <div class="grid-value text-h5 text-purple-3">
          Input
        </div>

        <q-icon
          class="grid-icon q-mx-auto"
          name="mdi-thermometer"
          size="sm"
          color="green-3"
        />
        <div class="grid-value text-h5">
          {{ block.data.inputValue | unit }}
        </div>

        <q-icon
          class="grid-icon q-mx-auto"
          name="mdi-unfold-more-horizontal"
          size="sm"
          color="amber-4"
        />
        <div class="grid-value text-h6 text-amber-4">
          {{ block.data.inputSetting | unit }}
        </div>
      </div>
    </div>
    <div
      class="col-grow row justify-center q-py-sm clickable rounded-borders"
      @click="$emit('edit:output')"
    >
      <div class="col-auto grid-container">
        <div class="grid-value text-h5 text-purple-3">
          Output
        </div>

        <q-icon
          v-if="kp === null"
          class="grid-icon q-mx-auto"
          name="mdi-calculator-variant"
          size="sm"
        />
        <HeatingIcon
          v-else-if="kp > 0"
          class="grid-icon q-mx-auto"
          color="red"
          size="sm"
          :svg-props="{'stroke-width': '2px'}"
        />
        <CoolingIcon
          v-else-if="kp < 0"
          class="grid-icon q-mx-auto"
          color="dodgerblue"
          size="sm"
          :svg-props="{'stroke-width': '2px'}"
        />
        <div class="grid-value text-h5">
          {{ block.data.outputValue | round }} %
        </div>

        <q-icon
          class="grid-icon q-mx-auto"
          name="mdi-unfold-more-horizontal"
          size="sm"
          color="amber-4"
        />
        <div class="grid-value text-h6 text-amber-4">
          {{ block.data.outputSetting | round }} %
        </div>
      </div>
    </div>

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
        :class="[
          'col-auto self-center text-bold',
          `text-${block.data.boilModeActive ? 'deep-orange' : 'grey'}`,
        ]"
      >
        boil
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.grid-container
  display: grid
  grid-template-columns: repeat(3, 50px)
  grid-row-gap: 5px
  grid-auto-flow: row

.grid-icon
  grid-column-end: span 1
  grid-column-start: 1

.grid-value
  grid-column-end: span 2
  grid-column-start: 2
  align-self: flex-end
</style>
