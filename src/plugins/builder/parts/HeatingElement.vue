<script lang="ts">
import { Component } from 'vue-property-decorator';

import { ActuatorPwmBlock } from '@/plugins/spark/features/ActuatorPwm/types';

import PartBase from '../components/PartBase';
import { settingsBlock } from '../helpers';

@Component
export default class HeatingElement extends PartBase {
  get paths() {
    return {
      fixture: [
        'M0,10l0,30h19v-7h-6.5c0,0,0,0,0,0c-4.1,0.1-7.4-3.2-7.5-7.2c0-4.7,2.8-7.8,7.5-7.8H19v-8H0z',
      ],
      borders: [
        'M50,24.7h24c7.1,0,6.6-6.7,14-6.7h126.9c0,0,7,0.1,7,7c0,7-7,7-7,7H90',
      ],
    };
  }

  get block(): ActuatorPwmBlock | null {
    return settingsBlock(this.part, 'pwm');
  }

  get pwmSetting(): number | null {
    return this.block
      ? this.block.data.desiredSetting
      : null;
  }
}
</script>

<template>
  <g>
    <foreignObject
      :transform="textTransformation([1,1])"
      :width="SQUARE_SIZE"
      :height="SQUARE_SIZE"
    >
      <div class="text-white text-bold text-center">
        <q-icon name="mdi-gauge" class="q-mr-xs" />
        <q-icon v-if="!block" name="mdi-link-variant-off" />
        <small v-else>%</small>
        <br />
        {{ pwmSetting | round(0) }}
      </div>
    </foreignObject>
    <g class="outline">
      <path v-for="border in paths.borders" :key="border" :d="border" />
      <rect
        :width="SQUARE_SIZE-2"
        :height="SQUARE_SIZE-2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </g>
</template>
