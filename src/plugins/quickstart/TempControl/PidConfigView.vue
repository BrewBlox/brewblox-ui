<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { PidConfig } from '../types';


@Component
export default class PidConfigView extends Vue {

  @Prop({ type: Object, required: true })
  public readonly value!: PidConfig;

  get colorClass(): string {
    if (!this.value.kp.value) {
      return '';
    }
    return this.value.kp.value > 0
      ? 'text-red'
      : 'text-blue';
  }

}
</script>

<template>
  <div
    :class="[
      'q-gutter-x-sm prop-parent',
      colorClass,
    ]"
  >
    <div class="col-auto">
      <span>Kp</span>
      <span>{{ value.kp | quantity }}</span>
    </div>
    <div class="col-auto">
      <span>Td</span>
      <span>{{ value.td | duration }}</span>
    </div>
    <div class="col-auto">
      <span>Ti</span>
      <span>{{ value.ti | duration }}</span>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.prop-parent > div > span:first-child
  width: 2em
  float: left
</style>
