<script lang="ts">
import { Component } from 'vue-property-decorator';

import { ActuatorPwmBlock } from '@/plugins/spark/features/ActuatorPwm/types';

import PartBase from '../components/PartBase';
import { settingsBlock } from '../helpers';

@Component
export default class HeatingElement extends PartBase {

  get path(): string {
    const straight = this.squares(this.sizeX - 2);
    return `M50,24.7h24c7.1,0,6.6-6.7,14-6.7 h${straight} c0,0,7,0.1,7,7 c0,7-7,7-7,7 H90`;
  }

  get block(): ActuatorPwmBlock | null {
    return settingsBlock(this.part, 'pwm');
  }

  get pwmValue(): number | null {
    return this.block && this.block.data.enabled
      ? this.block.data.value
      : null;
  }
}
</script>

<template>
  <g>
    <foreignObject :transform="textTransformation([1,1])" :width="squares(1)" :height="squares(1)">
      <div class="text-white text-bold text-center">
        <q-icon name="mdi-gauge" class="q-mr-xs" />
        <q-icon v-if="!block" name="mdi-link-variant-off" />
        <small v-else>%</small>
        <br />
        {{ pwmValue | round(0) }}
      </div>
    </foreignObject>
    <g class="outline">
      <path :d="path" />
      <rect
        :width="squares(1)-2"
        :height="squares(1)-2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </g>
</template>
